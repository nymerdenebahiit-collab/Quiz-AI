import type { NextRequest } from "next/server";

// Temporary local stubs to allow builds when @clerk/nextjs is not installed.
// Replace imports back to "@clerk/nextjs/server" once the package is installed.

type AuthSession = {
  userId: string | null;
  redirectToSignIn: () => void;
};

export function clerkMiddleware(
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

export async function auth(): Promise<{ userId: string | null }> {
  return { userId: "dev" };
}

type ClerkEmailAddress = { emailAddress: string };
type ClerkUser = {
  id: string;
  emailAddresses: ClerkEmailAddress[];
  firstName: string | null;
};

export async function currentUser(): Promise<ClerkUser | null> {
  return {
    id: "dev",
    emailAddresses: [{ emailAddress: "dev@example.com" }],
    firstName: "Dev",
  };
}

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
