declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  interface AutoTableOptions {
    startY?: number;
    head?: (string | number)[][];
    body?: (string | number)[][];
    theme?: "striped" | "grid" | "plain";
    headStyles?: Record<string, unknown>;
    columnStyles?: Record<number, Record<string, unknown>>;
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  export default autoTable;
}
