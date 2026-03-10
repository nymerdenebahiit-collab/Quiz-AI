import type { ReactNode } from "react";

// Temporary local stubs to allow builds when @radix-ui/react-dialog is not installed.
// Replace import back to "@radix-ui/react-dialog" once the package is installed.

export function Root({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}

export function Trigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button {...props}>
      {children}
    </button>
  );
}

export function Portal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Close({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button {...props}>
      {children}
    </button>
  );
}

export function Overlay({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}

export function Content({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}

export function Title({
  children,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 {...props}>
      {children}
    </h2>
  );
}

export function Description({
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p {...props}>
      {children}
    </p>
  );
}
