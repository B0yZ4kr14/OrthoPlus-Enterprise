import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Keyboard } from "lucide-react";
import type { KeyboardShortcutsDialogProps } from "./types";
import { useShortcuts } from "./useShortcuts";
import { CategorySection } from "./CategorySection";
import { DialogFooter } from "./DialogFooter";

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const { categories, getShortcutsByCategory } = useShortcuts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente pelo sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              shortcuts={getShortcutsByCategory(category)}
            />
          ))}
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
