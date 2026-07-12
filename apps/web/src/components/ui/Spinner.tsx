import type { HTMLAttributes } from "react";

export default function Spinner({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`spinner ${className}`.trim()} aria-label="Loading" {...props} />
  );
}
