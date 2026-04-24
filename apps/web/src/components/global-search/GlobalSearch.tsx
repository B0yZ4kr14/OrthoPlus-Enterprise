import { memo } from "react";
import { useGlobalSearch } from "./useGlobalSearch";
import { SearchTrigger } from "./SearchTrigger";
import { SearchDialog } from "./SearchDialog";

const GlobalSearch = memo(function GlobalSearch() {
  const { open, setOpen, search, setSearch, results, loading } = useGlobalSearch();

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        search={search}
        onSearchChange={setSearch}
        results={results}
        loading={loading}
      />
    </>
  );
});

export default GlobalSearch;
