import type { NextRequest } from "next/server";
import * as ClerkServer from "@clerk/nextjs/server";

type AuthSession = {
  userId: string | null;
  redirectToSignIn: () => void;
};

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

function stubClerkMiddleware(
  handler: (auth: () => Promise<AuthSession>, req: NextRequest) => unknown,
) {
  return async (req: NextRequest) => {
    const auth = async (): Promise<AuthSession> => ({
      // Allow all requests in dev when Clerk isn't available.
      userId: "dev",
      redirectToSignIn: () => undefined,
    });

    return handler(auth, req);
  };
}

async function stubAuth(): Promise<{ userId: string | null }> {
  return { userId: "dev" };
}

type ClerkEmailAddress = { emailAddress: string };
type ClerkUser = {
  id: string;
  emailAddresses: ClerkEmailAddress[];
  firstName: string | null;
};

async function stubCurrentUser(): Promise<ClerkUser | null> {
  return {
    id: "dev",
    emailAddresses: [{ emailAddress: "dev@example.com" }],
    firstName: "Dev",
  };
}

export const clerkMiddleware = hasClerkKeys
  ? ClerkServer.clerkMiddleware
  : stubClerkMiddleware;
export const auth = hasClerkKeys ? ClerkServer.auth : stubAuth;
export const currentUser = hasClerkKeys ? ClerkServer.currentUser : stubCurrentUser;

type WebhookEmailAddress = {
  id: string;
  email_address: string;
};

type WebhookUserCreatedData = {
  id: string;
  email_addresses: WebhookEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
};

// Minimal placeholder type for webhook handling.
export type WebhookEvent =
  | { type: "user.created"; data: WebhookUserCreatedData }
  | { type: string; data: Record<string, unknown> };
