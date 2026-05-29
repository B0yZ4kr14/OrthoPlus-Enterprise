import { cn } from "@/lib/utils";
import type { FormFieldProps } from "./types";
import { FieldLabel } from "./FieldLabel";
import { FieldMessage } from "./FieldMessage";
import { InputField } from "./InputField";
import { TextareaField } from "./TextareaField";
import { SelectField } from "./SelectField";

export function FormField(props: FormFieldProps) {
  const { label, name, error, success, helperText, required, className } =
    props;

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const renderInput = () => {
    if (props.type === "textarea") {
      return (
        <TextareaField
          id={name}
          name={name}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          rows={props.rows}
          maxLength={props.maxLength}
          hasError={hasError}
          hasSuccess={hasSuccess}
        />
      );
    }

    if (props.type === "select") {
      return (
        <SelectField
          id={name}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          placeholder={props.placeholder}
          options={props.options}
          hasError={hasError}
          hasSuccess={hasSuccess}
        />
      );
    }

    if (props.type === "custom") {
      return props.children;
    }

    return (
      <InputField
        id={name}
        name={name}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        maxLength={props.maxLength}
        hasError={hasError}
        hasSuccess={hasSuccess}
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel htmlFor={name} label={label} required={required} />
      {renderInput()}
      <FieldMessage error={error} success={success} helperText={helperText} />
    </div>
  );
}
