import type { ForgotPasswordProps } from "./types";
import { useForgotPassword } from "./useForgotPassword";
import { EmailSentView } from "./EmailSentView";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { form, isLoading, emailSent, handleSubmit } = useForgotPassword();

  if (emailSent) {
    return <EmailSentView email={form.getValues("email")} onBack={onBack} />;
  }

  return (
    <ForgotPasswordForm
      form={form}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}
