import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import * as Clerk from "@clerk/nextjs";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function StubClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function StubSignedIn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function StubSignedOut({ children }: { children: ReactNode }) {
  return null;
}

function StubSignInButton() {
  return <button className="px-4 h-10 rounded-full border">Sign In</button>;
}

function StubSignUpButton({ children }: { children?: ReactNode }) {
  return children ? <>{children}</> : <button>Sign Up</button>;
}

function StubUserButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        className="px-3 h-8 rounded-full border text-sm"
        onClick={() => setOpen((v) => !v)}
      >
        User
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md p-2 z-50">
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
          >
            Profile
          </button>
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
          >
            Settings
          </button>
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function stubUseClerk() {
  return {
    openSignIn: () => undefined,
  };
}

function stubUseUser() {
  return {
    user: { id: "dev" },
    isLoaded: true,
  };
}

export const ClerkProvider = hasClerkKey
  ? Clerk.ClerkProvider
  : StubClerkProvider;
export const SignedIn = hasClerkKey ? Clerk.SignedIn : StubSignedIn;
export const SignedOut = hasClerkKey ? Clerk.SignedOut : StubSignedOut;
export const SignInButton = hasClerkKey ? Clerk.SignInButton : StubSignInButton;
export const SignUpButton = hasClerkKey ? Clerk.SignUpButton : StubSignUpButton;
export const UserButton = hasClerkKey ? Clerk.UserButton : StubUserButton;
export const useClerk = hasClerkKey ? Clerk.useClerk : stubUseClerk;
export const useUser = hasClerkKey ? Clerk.useUser : stubUseUser;
