import type { HTMLAttributes } from "react";

export type BadgeStatus =
  | "Available"
  | "On Trip"
  | "In Shop"
  | "Maintenance"
  | "Retired"
  | "Completed"
  | "Dispatched"
  | "Cancelled"
  | "Draft"
  | "Active"
  | "Inactive"
  | "Off Duty"
  | "Suspended";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: BadgeStatus | string;
};

export default function StatusBadge({ status, className = "", ...props }: StatusBadgeProps) {
  let style: React.CSSProperties = {
    background: "var(--color-surface-2)",
    color: "var(--color-muted)",
    border: "1px solid var(--color-border)",
  };

  switch (status) {
    case "Available":
    case "Active":
    case "Completed":
      style = {
        background: "var(--color-positive-bg)",
        color: "var(--color-positive)",
        border: "1px solid var(--color-positive)",
      };
      break;
    case "On Trip":
    case "Dispatched":
      style = {
        background: "var(--status-on-trip-bg)",
        color: "var(--status-on-trip)",
        border: "1px dashed var(--status-on-trip)",
      };
      break;
    case "In Shop":
    case "Maintenance":
    case "Suspended":
    case "Cancelled":
    case "Inactive":
      style = {
        background: "var(--color-danger-bg)",
        color: "var(--color-danger)",
        border: "1px solid var(--color-danger)",
      };
      break;
    case "Off Duty":
    case "Retired":
    case "Draft":
    default:
      style = {
        background: "var(--color-surface-2)",
        color: "var(--color-muted)",
        border: "1px solid var(--color-border)",
      };
      break;
  }

  return (
    <span
      className={`status-badge ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.72rem",
        fontWeight: 700,
        minWidth: "75px",
        textAlign: "center",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {status}
    </span>
  );
}
