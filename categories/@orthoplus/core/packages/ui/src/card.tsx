import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const cardVariants = cva(
  "rounded-xl border border-border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        elevated:
          "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        interactive:
          "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-interactive/30 cursor-pointer",
        gradient:
          "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        metric:
          "shadow-[var(--shadow-card)] border-l-4 border-l-interactive/60 hover:border-l-interactive hover:shadow-[var(--shadow-card-hover)]",
      },
      depth: {
        subtle:  "shadow-[var(--shadow-xs)]",
        normal:  "shadow-[var(--shadow-card)]",
        intense: "shadow-[var(--shadow-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      depth: "normal",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, depth, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, depth }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
