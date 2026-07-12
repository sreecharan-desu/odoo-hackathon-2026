import type { InputHTMLAttributes } from "react";

import FieldShell from "./FieldShell";

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
};

export default function NumberField({
  id,
  label,
  error,
  hint,
  required,
  min = 0,
  step = "any",
  className = "",
  ...props
}: NumberFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <input
          {...props}
          id={fieldId}
          type="number"
          min={min}
          step={step}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`form-field__input${invalid ? " form-field__input--error" : ""} ${className}`.trim()}
        />
      )}
    </FieldShell>
  );
}
