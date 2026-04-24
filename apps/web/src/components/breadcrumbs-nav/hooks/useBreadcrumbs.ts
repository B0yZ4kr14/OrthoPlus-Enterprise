import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useBreadcrumbs() {
  const location = useLocation();

  const pathnames = useMemo(() => {
    return location.pathname.split("/").filter((x) => x);
  }, [location.pathname]);

  const isHidden = useMemo(() => {
    return pathnames.length === 0 || location.pathname === "/";
  }, [pathnames.length, location.pathname]);

  return {
    pathnames,
    isHidden,
  };
}
