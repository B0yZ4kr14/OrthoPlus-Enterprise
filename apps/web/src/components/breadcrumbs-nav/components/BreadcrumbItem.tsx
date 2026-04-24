import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  BreadcrumbItem as BreadcrumbItemBase,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@orthoplus/core-ui/breadcrumb";
import { ROUTE_LABELS } from "../constants/routeLabels";

interface BreadcrumbPathItemProps {
  pathname: string;
  index: number;
  pathnames: string[];
}

export function BreadcrumbPathItem({
  pathname,
  index,
  pathnames,
}: BreadcrumbPathItemProps) {
  const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
  const isLast = index === pathnames.length - 1;
  const label =
    ROUTE_LABELS[pathname] ||
    pathname.charAt(0).toUpperCase() + pathname.slice(1);

  return (
    <BreadcrumbItemBase key={routeTo}>
      <BreadcrumbSeparator>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </BreadcrumbSeparator>
      {isLast ? (
        <BreadcrumbPage className="font-semibold text-foreground px-2 py-1 rounded-lg bg-primary/10">
          {label}
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink asChild>
          <Link
            to={routeTo}
            className="hover:text-foreground transition-all duration-200 px-2 py-1 rounded-lg hover:bg-accent/50"
          >
            {label}
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItemBase>
  );
}
