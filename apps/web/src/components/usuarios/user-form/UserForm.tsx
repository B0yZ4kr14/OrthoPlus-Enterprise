// cspell:disable
import { Form } from "@orthoplus/core-ui/form";
import { useUserForm } from "./useUserForm";
import { FormFields } from "./FormFields";
import { FormActions } from "./FormActions";
import type { UserFormProps } from "./types";

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { form, isLoading, onSubmit } = useUserForm({ user, onSuccess, onCancel });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <FormFields user={user} />
        <FormActions isLoading={isLoading} isEditing={!!user} onCancel={onCancel} />
      </form>
    </Form>
  );
}
