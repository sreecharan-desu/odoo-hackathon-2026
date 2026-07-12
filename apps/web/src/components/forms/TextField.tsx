import type { InputHTMLAttributes } from "react";

import FieldShell from "./FieldShell";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
};

export default function TextField({
  id,
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <input
          {...props}
          id={fieldId}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`form-field__input${invalid ? " form-field__input--error" : ""} ${className}`.trim()}
        />
      )}
    </FieldShell>
  );
}
