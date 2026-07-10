import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variantClass = variant === "primary" ? "button" : "button button--ghost";
  return <button className={`${variantClass} ${className}`.trim()} {...props} />;
}
