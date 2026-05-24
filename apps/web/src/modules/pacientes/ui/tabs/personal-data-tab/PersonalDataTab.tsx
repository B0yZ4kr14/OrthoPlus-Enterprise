import { Card } from "@orthoplus/core-ui/card";
import type { PersonalDataTabProps } from "./types";
import { personalDataFields } from "./formConfig";
import { TextField } from "./TextField";
import { DateField } from "./DateField";
import { SelectField } from "./SelectField";

export function PersonalDataTab({ form }: PersonalDataTabProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personalDataFields.map((field) => {
          if (field.type === "date") {
            return (
              <DateField
                key={field.name}
                form={form}
                name={field.name}
                label={field.label}
                required={field.required}
              />
            );
          }

          if (field.type === "select") {
            return (
              <SelectField
                key={field.name}
                form={form}
                name={field.name}
                label={field.label}
                options={field.options || []}
                description={field.description}
              />
            );
          }

          return (
            <TextField
              key={field.name}
              form={form}
              name={field.name}
              label={field.label}
              required={field.required}
              placeholder={field.placeholder}
              mask={field.mask}
            />
          );
        })}
      </div>
    </Card>
  );
}
