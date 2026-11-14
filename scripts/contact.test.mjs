import test from "node:test";
import assert from "node:assert/strict";
import { createHandler, config } from "../netlify/functions/contact.mjs";
const env = {
  RESEND_API_KEY: "test-key-not-real",
  RESEND_FROM_EMAIL: "Website <website@eazzime.com>",
};
const valid = {
  name: "Test Person",
  email: "test@example.com",
  company: "Test Company",
  phone: "431-555-0100",
  service: "Data Engineering",
  message: "A sample enquiry for automated testing.",
  requestId: "12345678-1234-4234-8234-123456789012",
  "bot-field": "",
};
const request = (body = valid, options = {}) =>
  new Request("https://eazzime.com/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://eazzime.com",
    },
    body: JSON.stringify(body),
    ...options,
  });
const neverSend = async () => {
  assert.fail("Email provider must not be called");
};
test("sends only to the company inbox with reply-to and plain-text fields", async () => {
  let sent;
  const handler = createHandler({
    env,
    send: async (url, opts) => {
      sent = { url, ...opts };
      return Response.json({ id: "email-123" });
    },
  });
  assert.equal(
    (await handler(request({ ...valid, to: "attacker@example.com" }))).status,
    200,
  );
  const email = JSON.parse(sent.body);
  assert.deepEqual(email.to, ["info@eazzime.com"]);
  assert.equal(email.reply_to, valid.email);
  assert.equal(email.from, env.RESEND_FROM_EMAIL);
  assert.match(email.text, /Data Engineering/);
  assert.match(email.text, /Test Company/);
  assert.ok(!email.html);
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.equal(sent.headers.Authorization, "Bearer test-key-not-real");
});
test("retries preserve idempotency and changed content gets a new key", async () => {
  const keys = [];
  const handler = createHandler({
    env,
    send: async (_, opts) => {
      keys.push(opts.headers["Idempotency-Key"]);
      return Response.json({ id: "id" });
    },
  });
  await handler(request());
  await handler(request());
  await handler(request({ ...valid, message: "A different enquiry message." }));
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[1], keys[2]);
});
test("validates required fields, lengths, email and malformed payloads", async () => {
  const handler = createHandler({ env, send: neverSend });
  for (const body of [
    null,
    [],
    { ...valid, name: " " },
    { ...valid, email: "invalid" },
    { ...valid, email: "test@example.com\r\nBcc:x@y.com" },
    { ...valid, message: "short" },
    { ...valid, company: "x".repeat(151) },
    { ...valid, name: {} },
    { ...valid, requestId: "bad" },
  ])
    assert.equal((await handler(request(body))).status, 400);
  assert.equal((await handler(request(valid, { body: "{bad" }))).status, 400);
  assert.equal(
    (await handler(request({ ...valid, message: "x".repeat(25000) }))).status,
    413,
  );
});
test("honeypot does not send mail", async () => {
  const response = await createHandler({ env, send: neverSend })(
    request({ ...valid, "bot-field": "bot" }),
  );
  assert.deepEqual(await response.json(), { ok: true });
});
test("rejects other origins, methods, content types and unprotected route", async () => {
  const handler = createHandler({ env, send: neverSend });
  assert.equal(
    (
      await handler(
        request(valid, {
          headers: {
            Origin: "https://elsewhere.com",
            "Content-Type": "application/json",
          },
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handler(
        request(valid, { headers: { "Content-Type": "text/plain" } }),
      )
    ).status,
    415,
  );
  assert.equal(
    (await handler(new Request("https://eazzime.com/api/contact"))).status,
    405,
  );
  assert.equal(
    (
      await handler(
        new Request("https://eazzime.com/.netlify/functions/contact"),
      )
    ).status,
    404,
  );
  assert.equal(config.rateLimit.windowLimit, 5);
});
test("missing configuration and provider failures never return success or leak secrets", async () => {
  assert.equal(
    (await createHandler({ env: {}, send: neverSend })(request())).status,
    503,
  );
  for (const send of [
    async () =>
      Response.json({ message: "secret provider diagnostic" }, { status: 401 }),
    async () => Response.json({}),
    async () => {
      throw new Error("secret timeout");
    },
  ]) {
    const response = await createHandler({ env, send })(request());
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false });
  }
});
