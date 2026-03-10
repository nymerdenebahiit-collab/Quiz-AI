import type { ReactNode } from "react";

// Temporary local stub to allow builds when @radix-ui/react-slot is not installed.
// Replace import back to "@radix-ui/react-slot" once the package is installed.

type SlotProps = {
  children?: ReactNode;
} & React.ComponentProps<"span">;

export function Slot({ children, ...props }: SlotProps) {
  return (
    <span {...props}>
      {children}
    </span>
  );
}
