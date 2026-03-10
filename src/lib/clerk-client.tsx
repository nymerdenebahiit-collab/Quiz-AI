import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

// Temporary local stubs to allow builds when @clerk/nextjs is not installed.
// Replace imports back to "@clerk/nextjs" once the package is installed.

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  // Always render children in dev when Clerk isn't available.
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  // Never render signed-out UI when Clerk isn't available.
  return null;
}

export function SignInButton({ children }: { children?: ReactNode }) {
  return <button className="px-4 h-10 rounded-full border">Sign In</button>;
}

export function SignUpButton({ children }: { children?: ReactNode }) {
  return children ? <>{children}</> : <button>Sign Up</button>;
}

export function UserButton() {
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

export function useClerk() {
  return {
    openSignIn: () => undefined,
  };
}

export function useUser() {
  return {
    user: { id: "dev" },
    isLoaded: true,
  };
}
