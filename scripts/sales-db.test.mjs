import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("migration, RLS, atomic deduplication, notifications, booking and cascade deletion", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(
      `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);`,
    );
    await pg.exec(
      readFileSync("supabase/migrations/202611140001_sales.sql", "utf8"),
    );
    const id = randomUUID();
    const p = {
      request_id: id,
      name: "Test",
      company: "Company",
      email: "test@example.com",
      phone: "",
      description: "Reporting project",
      service: "data-engineering",
      budget: "10000",
      currency: "CAD",
      startDate: "January",
      timeline: "Six months",
      attribution: { utm_campaign: "launch" },
      summary: "Data reporting project",
      summary_kind: "ai",
      consent_version: "test",
      messages: [{ role: "user", content: "Data warehouse please" }],
    };
    const capture = async (data) =>
      (
        await pg.query("select capture_sales_lead($1::jsonb,180) as result", [
          JSON.stringify(data),
        ])
      ).rows[0].result;
    const first = await capture(p);
    assert.equal(first.created, true);
    assert.equal(first.qualified, true);
    assert.equal((await capture(p)).replayed, true);
    const second = await capture({
      ...p,
      request_id: randomUUID(),
      attribution: { utm_campaign: "different" },
    });
    assert.equal(second.created, false);
    let leads = (await pg.query("select * from sales_leads")).rows;
    assert.equal(leads.length, 1);
    assert.equal(leads[0].attribution.utm_campaign, "launch");
    assert.equal(
      (await pg.query("select * from sales_submissions")).rows.length,
      2,
    );
    assert.equal((await pg.query("select * from sales_outbox")).rows.length, 2);
    assert.equal(
      (await pg.query("select * from claim_sales_mail()")).rows.length,
      2,
    );
    assert.equal(
      (await pg.query("select * from claim_sales_mail()")).rows.length,
      0,
    );
    await pg.exec(
      "update sales_outbox set locked_until=null,next_attempt_at=now()-interval '1 hour',first_attempt_at=now()-interval '21 hours'",
    );
    assert.equal(
      (await pg.query("select * from claim_sales_mail()")).rows.length,
      0,
      "old ambiguous sends require manual review",
    );
    assert.equal(
      (
        await pg.query("select confirm_sales_booking($1,$2) as result", [
          id,
          "booking-1",
        ])
      ).rows[0].result,
      true,
    );
    assert.equal(
      (
        await pg.query("select confirm_sales_booking($1,$2) as result", [
          id,
          "booking-1",
        ])
      ).rows[0].result,
      false,
    );
    assert.equal(
      (await pg.query("select status from sales_leads")).rows[0].status,
      "Consultation Scheduled",
    );
    const rep = randomUUID(),
      other = randomUUID();
    await pg.query("insert into auth.users(id) values($1),($2)", [rep, other]);
    await pg.query(
      "insert into sales_staff values($1,'Rep','sales'),($2,'Other','sales')",
      [rep, other],
    );
    await pg.query("update sales_leads set assigned_to=$1", [rep]);
    assert.equal(
      (await pg.query("select sales_metrics($1) as result", [rep])).rows[0]
        .result.total,
      1,
    );
    assert.equal(
      (await pg.query("select sales_metrics($1) as result", [other])).rows[0]
        .result.total,
      0,
    );
    for (const role of ["anon", "authenticated"]) {
      await pg.exec(`set role ${role}`);
      await assert.rejects(
        () => pg.query("select * from sales_leads"),
        /permission denied/,
      );
      await assert.rejects(
        () =>
          pg.query("select capture_sales_lead($1,180)", [JSON.stringify(p)]),
        /permission denied/,
      );
      await pg.exec("reset role");
    }
    const rls = (
      await pg.query(
        "select relname,relrowsecurity from pg_class where relname like 'sales_%' and relkind='r'",
      )
    ).rows;
    assert.ok(rls.length >= 7);
    assert.ok(rls.every((r) => r.relrowsecurity));
    await pg.query("insert into sales_notes(lead_id,body) values($1,$2)", [
      leads[0].id,
      "Follow up",
    ]);
    await pg.exec("delete from sales_leads");
    for (const table of [
      "sales_submissions",
      "sales_notes",
      "sales_outbox",
      "sales_booking_events",
    ])
      assert.equal((await pg.query(`select * from ${table}`)).rows.length, 0);
  } finally {
    await pg.close();
  }
});
