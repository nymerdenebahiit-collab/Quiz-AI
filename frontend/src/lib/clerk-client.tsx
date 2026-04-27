"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import * as Clerk from "@clerk/nextjs";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const LOCAL_AUTH_STORAGE_KEY = "quiz_ai_local_auth";

type LocalUser = {
  id: string;
  firstName: string;
};

type LocalAuthContextValue = {
  user: LocalUser | null;
  isLoaded: boolean;
  openSignIn: () => void;
  signOut: () => void;
};

const LocalAuthContext = createContext<LocalAuthContextValue>({
  user: null,
  isLoaded: false,
  openSignIn: () => undefined,
  signOut: () => undefined,
});

function StubClerkProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalUser;
        if (parsed?.id) {
          setUser(parsed);
        }
      }
    } catch {
      // Ignore invalid local auth state.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const value = useMemo<LocalAuthContextValue>(
    () => ({
      user,
      isLoaded,
      openSignIn: () => {
        const localUser: LocalUser = {
          id: "local-user",
          firstName: "Local",
        };
        setUser(localUser);
        localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(localUser));
      },
      signOut: () => {
        setUser(null);
        localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      },
    }),
    [isLoaded, user]
  );

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

function StubSignedIn({ children }: { children: ReactNode }) {
  const { user } = useContext(LocalAuthContext);
  return user ? <>{children}</> : null;
}

function StubSignedOut({ children }: { children: ReactNode }) {
  const { user } = useContext(LocalAuthContext);
  return user ? null : <>{children}</>;
}

function StubSignInButton() {
  const { openSignIn } = useContext(LocalAuthContext);

  return (
    <button
      className="px-4 h-10 rounded-full border"
      onClick={openSignIn}
      type="button"
    >
      Sign In
    </button>
  );
}

function StubSignUpButton({ children }: { children?: ReactNode }) {
  const { openSignIn } = useContext(LocalAuthContext);

  if (children) {
    return (
      <div onClick={openSignIn} className="contents">
        {children}
      </div>
    );
  }

  return (
    <button onClick={openSignIn} type="button">
      Sign Up
    </button>
  );
}

function StubUserButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, signOut } = useContext(LocalAuthContext);

  return (
    <div className="relative">
      <button
        className="px-3 h-8 rounded-full border text-sm"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {user?.firstName ?? "User"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md p-2 z-50">
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            type="button"
          >
            Profile
          </button>
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            type="button"
          >
            Settings
          </button>
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-red-600"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function useStubClerk() {
  const { openSignIn } = useContext(LocalAuthContext);
  return { openSignIn };
}

function useStubUser() {
  const { user, isLoaded } = useContext(LocalAuthContext);
  return {
    user: user ? { id: user.id } : null,
    isLoaded,
  };
}

export const ClerkProvider = hasClerkKey ? Clerk.ClerkProvider : StubClerkProvider;
export const SignedIn = hasClerkKey ? Clerk.SignedIn : StubSignedIn;
export const SignedOut = hasClerkKey ? Clerk.SignedOut : StubSignedOut;
export const SignInButton = hasClerkKey ? Clerk.SignInButton : StubSignInButton;
export const SignUpButton = hasClerkKey ? Clerk.SignUpButton : StubSignUpButton;
export const UserButton = hasClerkKey ? Clerk.UserButton : StubUserButton;
export const useClerk = hasClerkKey ? Clerk.useClerk : useStubClerk;
export const useUser = hasClerkKey ? Clerk.useUser : useStubUser;
