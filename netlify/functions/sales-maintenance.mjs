import { createStore } from "../lib/sales-core.mjs";
import { deliverMail } from "../lib/mail.mjs";
export const config = { schedule: "*/15 * * * *" };
export default async () => {
  const db = createStore();
  // Deletion cascades to transcripts, notes, notification jobs and booking events.
  await db(
    `sales_leads?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`,
    { method: "DELETE" },
  );
  await deliverMail(db);
  return new Response(null, { status: 204 });
};
