// cspell:disable
import type { CupomContentProps } from "./types";
import { CupomHeader } from "./components/CupomHeader";
import { CupomItemsTable } from "./components/CupomItemsTable";
import { CupomTotal } from "./components/CupomTotal";
import { CupomFooter } from "./components/CupomFooter";

export * from "./types";
export {
  CupomHeader,
  CupomItemsTable,
  CupomTotal,
  CupomFooter,
};
export { useCurrencyFormatter } from "./hooks/useCurrencyFormatter";

export function CupomContent({ items, valorTotal }: CupomContentProps) {
  return (
    <>
      <CupomHeader />
      <CupomItemsTable items={items} />
      <CupomTotal valorTotal={valorTotal} />
      <CupomFooter />
    </>
  );
}
