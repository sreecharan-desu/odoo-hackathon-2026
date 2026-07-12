import type { SelectHTMLAttributes } from "react";

import FieldShell from "./FieldShell";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string | null;
  hint?: string;
};

export default function SelectField({
  id,
  label,
  options,
  placeholder,
  error,
  hint,
  required,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {({ id: fieldId, describedBy, invalid }) => (
        <select
          {...props}
          id={fieldId}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`form-field__select${invalid ? " form-field__select--error" : ""} ${className}`.trim()}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
