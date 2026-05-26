import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border/60 group-[.toaster]:shadow-card group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-interactive group-[.toaster]:text-interactive-foreground group-[.toaster]:rounded-lg group-[.toaster]:text-xs group-[.toaster]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toaster]:text-muted-foreground group-[.toaster]:rounded-lg group-[.toaster]:text-xs group-[.toaster]:font-medium",
          success:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-emerald-500 group-[.toaster]:bg-emerald-50/50",
          error:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500 group-[.toaster]:bg-red-50/50",
          warning:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500 group-[.toaster]:bg-amber-50/50",
          info:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-sky-500 group-[.toaster]:bg-sky-50/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
