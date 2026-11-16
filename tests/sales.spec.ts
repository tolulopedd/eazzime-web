import { test, expect, Page } from "@playwright/test";
async function mocks(page: Page) {
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.turnstile={render:(node,options)=>{node.innerHTML='<span>Security check verified (test)</span>';setTimeout(()=>options.callback('test-token'),10);return 'test';},remove:()=>{}};`,
    }),
  );
  await page.route("**/api/sales/chat", (route) =>
    route.fulfill({
      json:
        route.request().method() === "GET"
          ? {
              welcome:
                "Hi, I’m Davine an Eazzime AI assistant. What would you like to ask, build or improve on?",
              whatsapp: "14315571227",
            }
          : {
              reply:
                "Our data engineering service includes conversion, cleansing and migration. Which systems would you like to connect?",
            },
    }),
  );
  await page.addInitScript(() => {
    (window as unknown as { events: unknown[] }).events = [];
    window.gtag = (...args: unknown[]) => {
      (window as unknown as { events: unknown[] }).events.push(args);
    };
  });
}
test("chat consent, conversation, error recovery, lead capture and safe analytics", async ({
  page,
}, testInfo) => {
  await mocks(page);
  let captured: Record<string, unknown> | undefined;
  let booked = false;
  let fail = true;
  await page.route("**/api/sales/lead", (route) => {
    const body = route.request().postDataJSON();
    if (body.action === "receipt") return route.fulfill({ json: { booked } });
    captured = body;
    if (fail)
      return route.fulfill({
        status: 503,
        json: { error: "Temporary test failure. Try again." },
      });
    return route.fulfill({
      json: {
        ok: true,
        created: true,
        qualified: true,
        receipt: "test-receipt",
        bookingUrl: "https://cal.com/example/30min",
      },
    });
  });
  await page.goto("/?utm_source=qa&utm_campaign=launch");
  await page
    .getByRole("button", { name: "Chat with Davine @Eazzime", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveCount(0);
  await page.getByLabel("I agree to AI processing", { exact: false }).click();
  await page
    .getByRole("button", { name: "Improve our data", exact: true })
    .click();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveValue(
    "Improve our data",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    dialog.getByText(/Our data engineering service includes/),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("chat.png") });
  const before = await page.evaluate(() =>
    (window as unknown as { events: unknown[][] }).events.filter(
      (e) => e[0] === "event",
    ),
  );
  expect(before).toHaveLength(0);
  await page.getByLabel("Allow anonymous chatbot analytics").check();
  await page
    .getByRole("button", {
      name: "Book a Free 30-Minute Technology Consultation",
      exact: true,
    })
    .click();
  await page.getByLabel("Full name *", { exact: true }).fill("Test Visitor");
  await page.getByLabel("Company", { exact: true }).fill("Test Company");
  await page.getByLabel("Email *", { exact: true }).fill("visitor@example.com");
  await page
    .getByLabel("What would you like to build or improve? *", { exact: true })
    .fill("Create a reporting warehouse for our sales team.");
  await page.getByLabel("Estimated budget", { exact: true }).fill("10000");
  await page.getByLabel("Currency", { exact: true }).selectOption("CAD");
  await page
    .getByLabel("Desired delivery window", { exact: true })
    .fill("Six months");
  await page.getByLabel("I agree to EazziMe saving", { exact: false }).check();
  await page
    .getByRole("button", {
      name: "Send enquiry & book consultation",
      exact: true,
    })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Temporary test failure",
  );
  await expect(page.getByLabel("Full name *", { exact: true })).toHaveValue(
    "Test Visitor",
  );
  const firstId = captured?.requestId;
  fail = false;
  await page
    .getByRole("button", {
      name: "Send enquiry & book consultation",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Your enquiry is saved", { exact: true }),
  ).toBeVisible();
  expect(captured?.requestId).toBe(firstId);
  expect(captured?.consent).toBe(true);
  expect((captured?.attribution as Record<string, string>).utm_campaign).toBe(
    "launch",
  );
  let events = await page.evaluate(() =>
    (window as unknown as { events: unknown[][] }).events.filter(
      (e) => e[0] === "event",
    ),
  );
  expect(events.filter((e) => e[1] === "chatbot_lead_generated")).toHaveLength(
    1,
  );
  expect(
    events.filter((e) => e[1] === "chatbot_consultation_booked"),
  ).toHaveLength(0);
  expect(JSON.stringify(events)).not.toMatch(
    /visitor@example.com|Test Visitor|reporting warehouse|utm_campaign/,
  );
  booked = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByText("Consultation confirmed", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  events = await page.evaluate(() =>
    (window as unknown as { events: unknown[][] }).events.filter(
      (e) => e[0] === "event",
    ),
  );
  expect(
    events.filter((e) => e[1] === "chatbot_consultation_booked"),
  ).toHaveLength(1);
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.getByRole("button", { name: "Close chat", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Chat with Davine @Eazzime",
      exact: true,
    }),
  ).toBeFocused();
});
test("welcome is nonintrusive and appears only once per session", async ({
  page,
}) => {
  await page.clock.install();
  await mocks(page);
  await page.goto("/");
  await expect(
    page.getByRole("button", {
      name: "Chat with Davine @Eazzime",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator("h1").click();
  await page.clock.fastForward(23000);
  await expect(
    page.getByText("Have an idea in mind?", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss welcome" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Chat with Davine @Eazzime",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator("h1").click();
  await page.clock.fastForward(23000);
  await expect(
    page.getByText("Have an idea in mind?", { exact: true }),
  ).toHaveCount(0);
});
test("admin shell protects data and does not display a visitor chatbot", async ({
  page,
}) => {
  await mocks(page);
  await page.route("**/api/sales/admin", (route) =>
    route.fulfill({ status: 401, json: { error: "Please sign in." } }),
  );
  await page.goto("/admin/sales/");
  await expect(
    page.getByRole("heading", { name: "Sales team sign-in" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Chat with Davine @Eazzime",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});

test("administrator can review enquiries, save notes and manage content", async ({
  page,
}, testInfo) => {
  await mocks(page);
  const id = "11111111-1111-4111-8111-111111111111",
    owner = "22222222-2222-4222-8222-222222222222";
  const lead = {
    id,
    created_at: "2026-11-14T12:00:00Z",
    name: "Test Visitor",
    company: "Example Company",
    email: "visitor@example.com",
    phone: "",
    description: "A reporting warehouse project",
    service: "data-engineering",
    status: "New",
    budget: "10000",
    currency: "CAD",
    start_date: "January",
    timeline: "Six months",
    assigned_to: null,
    summary: "A data reporting enquiry",
    summary_kind: "ai",
    attribution: { utm_source: "newsletter", utm_campaign: "launch" },
    consent_at: "2026-11-14T12:00:00Z",
    consent_version: "test",
    expires_at: "2027-05-14T00:00:00Z",
  };
  const notes: Record<string, unknown>[] = [];
  let savedSettings = false;
  await page.route("**/api/sales/admin**", (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      if (body.action === "note")
        notes.push({
          id: "note",
          body: body.note,
          created_at: "2026-11-14T13:00:00Z",
          author_id: owner,
        });
      if (body.action === "settings") savedSettings = true;
      return route.fulfill({ json: { ok: true } });
    }
    if (new URL(route.request().url()).searchParams.has("id"))
      return route.fulfill({
        json: {
          lead,
          notes,
          mail: [
            {
              id: "m",
              kind: "sales",
              sent_at: "2026-11-14T12:00:00Z",
              attempts: 1,
            },
          ],
          conversations: [
            {
              id: "c",
              created_at: "2026-11-14T12:00:00Z",
              summary: "A reporting warehouse enquiry",
              summary_kind: "ai",
              details: { description: lead.description },
              messages: [
                { role: "user", content: "We need a data warehouse." },
              ],
            },
          ],
        },
      });
    return route.fulfill({
      json: {
        staff: { user_id: owner, display_name: "Test Admin", role: "admin" },
        team: [{ user_id: owner, display_name: "Test Admin", role: "admin" }],
        leads: [lead],
        hasMore: false,
        metrics: {
          total: 1,
          won: 0,
          groups: [
            {
              dimension: "service",
              label: "data-engineering",
              total: 1,
              won: 0,
              scheduled: 0,
            },
          ],
        },
        settings: { welcome: "Welcome to EazziMe", faqs: "", knowledge: "" },
      },
    });
  });
  await page.goto("/admin/sales/");
  await expect(page.getByRole("heading", { name: "Sales overview", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Sales workspace" })).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await page.getByRole("button", { name: "Review Test Visitor" }).click();
  await expect(
    page.getByRole("heading", { name: "Test Visitor", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Add a follow-up note")
    .fill("Arrange a discovery call.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(
    page.getByText("Arrange a discovery call.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Assistant settings", exact: true })
    .click();
  await page
    .getByLabel("Frequently asked questions and answers")
    .fill("Consultations are free and last 30 minutes.");
  await page.getByRole("button", { name: "Save assistant content" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Assistant content updated",
  );
  expect(savedSettings).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("admin.png"),
    fullPage: true,
  });
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});

test("admin handles missing backend HTML without exposing JSON parsing errors", async ({
  page,
}) => {
  await mocks(page);
  await page.route("**/api/sales/admin**", (route) =>
    route.fulfill({
      status: 404,
      contentType: "text/html",
      body: "<!doctype html><html>Not found</html>",
    }),
  );
  await page.goto("/admin/sales/");
  await expect(
    page.getByRole("alert").filter({ hasText: "The sales backend" }),
  ).toContainText("Netlify Dev");
  await expect(
    page.getByRole("heading", { name: "Sales team sign-in" }),
  ).toBeVisible();
  await expect(
    page.getByText("The string did not match the expected pattern.", {
      exact: true,
    }),
  ).toHaveCount(0);
});

test("admin handles non-JSON login failures and preserves credential feedback", async ({
  page,
}) => {
  await mocks(page);
  await page.route("**/api/sales/admin**", (route) =>
    route.fulfill({ status: 401, json: { error: "Please sign in." } }),
  );
  let invalidCredentials = false;
  await page.route("**/api/sales/login", (route) =>
    route.fulfill(
      invalidCredentials
        ? {
            status: 401,
            json: { error: "Unable to sign in. Check your credentials." },
          }
        : { status: 502, contentType: "text/html", body: "Bad gateway" },
    ),
  );
  await page.goto("/admin/sales/");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-only");
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "The sales backend" }),
  ).toBeVisible();
  invalidCredentials = true;
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to sign in." }),
  ).toBeVisible();
});
