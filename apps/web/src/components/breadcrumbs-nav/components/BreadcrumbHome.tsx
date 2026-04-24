import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@orthoplus/core-ui/breadcrumb";

export function BreadcrumbHome() {
  return (
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 hover:text-foreground transition-all duration-200 p-1.5 rounded-lg hover:bg-accent/50"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
}
