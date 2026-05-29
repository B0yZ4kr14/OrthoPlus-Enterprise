import { Breadcrumb, BreadcrumbList } from "@orthoplus/core-ui/breadcrumb";
import { useBreadcrumbs } from "./hooks/useBreadcrumbs";
import { BreadcrumbHome } from "./components/BreadcrumbHome";
import { BreadcrumbPathItem } from "./components/BreadcrumbItem";

export { ROUTE_LABELS } from "./constants/routeLabels";
export { useBreadcrumbs };
export { BreadcrumbHome, BreadcrumbPathItem };

export function Breadcrumbs() {
  const { pathnames, isHidden } = useBreadcrumbs();

  // Não mostrar breadcrumbs na página inicial
  if (isHidden) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm font-medium">
        <BreadcrumbHome />

        {pathnames.map((pathname, index) => (
          <BreadcrumbPathItem
            key={pathname}
            pathname={pathname}
            index={index}
            pathnames={pathnames}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
