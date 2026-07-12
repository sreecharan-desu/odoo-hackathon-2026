import type { ReactElement } from "react";

export type FieldRenderProps = {
  id: string;
  errorId?: string;
  hintId?: string;
  describedBy?: string;
  invalid: boolean;
};

type FieldShellProps = {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: (props: FieldRenderProps) => ReactElement;
};

export default function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required ? <span className="form-field__required">*</span> : null}
      </label>
      {children({ id, errorId, hintId, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <span className="form-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <p className="error form-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type { FieldShellProps };
