// Temporary local stub to allow builds when @radix-ui/react-label is not installed.
// Replace import back to "@radix-ui/react-label" once the package is installed.

export function Root({
  children,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label {...props}>
      {children}
    </label>
  );
}
