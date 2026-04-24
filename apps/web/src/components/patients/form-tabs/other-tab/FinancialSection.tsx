import { PaymentMethodSelect } from "./PaymentMethodSelect";
import { StatusSelect } from "./StatusSelect";
import type { OtherTabProps } from "./types";

export function FinancialSection({ form }: OtherTabProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Financeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentMethodSelect form={form} />
        <StatusSelect form={form} />
      </div>
    </div>
  );
}
