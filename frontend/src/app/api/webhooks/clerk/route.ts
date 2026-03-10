import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { upsertUserByClerkId } from "@/lib/file-db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) return new Response("Server error", { status: 500 });

  const payload = await req.text();

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing headers", { status: 400 });
  }

  let event: WebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "user.created") {
    return new Response("Ignored", { status: 200 });
  }

  const data = event.data as {
    id?: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };

  const { id, email_addresses, primary_email_address_id, first_name, last_name } =
    data;

  if (!id || !Array.isArray(email_addresses)) {
    return new Response("Invalid payload", { status: 400 });
  }

  const email = email_addresses.find(
    (e) => e.id === primary_email_address_id
  )?.email_address;

  if (!email) return new Response("No email", { status: 400 });

  try {
    await upsertUserByClerkId({
      clerkId: id,
      email,
      name: [first_name, last_name].filter(Boolean).join(" "),
    });
  } catch (err) {
    console.error("DB error:", err);

    return new Response("DB error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
