import { useState } from "react";
import type { InputHTMLAttributes } from "react";

import FieldShell from "./FieldShell";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
};

export default function PasswordField({
  id,
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <div className="form-field__password-wrap">
          <input
            {...props}
            id={fieldId}
            type={visible ? "text" : "password"}
            required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`form-field__input${invalid ? " form-field__input--error" : ""} ${className}`.trim()}
          />
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      )}
    </FieldShell>
  );
}
