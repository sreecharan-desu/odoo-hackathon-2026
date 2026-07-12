import type { HTMLAttributes } from "react";

export type BadgeStatus = "Available" | "On Trip" | "In Shop" | "Maintenance" | "Retired";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: BadgeStatus;
};

export default function StatusBadge({ status, className = "", ...props }: StatusBadgeProps) {
  let bgColor = "var(--color-muted)";
  let textColor = "#ffffff";
  
  switch (status) {
    case "Available":
      bgColor = "var(--color-success)";
      break;
    case "On Trip":
      bgColor = "var(--color-primary)";
      break;
    case "Maintenance":
    case "In Shop":
      bgColor = "var(--color-error)";
      break;
    case "Retired":
      bgColor = "var(--color-muted)";
      break;
  }

  return (
    <span
      className={`status-badge ${className}`.trim()}
      style={{ backgroundColor: bgColor, color: textColor }}
      {...props}
    >
      {status}
    </span>
  );
}
