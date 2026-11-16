export async function deliverMail(db, env = process.env, send = fetch) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return;
  const jobs = await db("rpc/claim_sales_mail", { method: "POST", body: "{}" });
  await Promise.allSettled(
    jobs.map(async (job) => {
      const [lead] = await db(`sales_leads?id=eq.${job.lead_id}&select=*`);
      if (!lead) return;
      const sales = job.kind === "sales";
      const response = await send("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `sales-${job.id}`,
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: [sales ? env.SALES_EMAIL || "info@eazzime.com" : lead.email],
          reply_to: sales ? lead.email : env.SALES_EMAIL || "info@eazzime.com",
          subject: sales
            ? "New EazziMe chatbot enquiry"
            : "We received your EazziMe enquiry",
          text: sales
            ? `A new website chatbot enquiry is ready for review.\n\nName: ${lead.name}\nCompany: ${lead.company}\nEmail: ${lead.email}\nService: ${lead.service || "To discuss"}\nBudget: ${lead.budget} ${lead.currency}\nTimeline: ${lead.timeline}\n\n${lead.summary}\n\nReview in your sales dashboard: ${env.URL || "https://eazzime.com"}/admin/sales/`
            : "Thank you for contacting EazziMe Technologies Inc. We have received your enquiry. Our team will review it and follow up with you.\n\nIf you have anything to add, reply to this email. A consultation is only confirmed when you receive a separate calendar confirmation.\n\nEazziMe Technologies Inc.\ninfo@eazzime.com",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok || !(await response.json()).id) return;
      await db(`sales_outbox?id=eq.${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          sent_at: new Date().toISOString(),
          locked_until: null,
        }),
      });
    }),
  );
}
