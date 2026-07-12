import type { HTMLAttributes } from "react";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
};

export default function EmptyState({ title, description, className = "", children, ...props }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()} {...props}>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
