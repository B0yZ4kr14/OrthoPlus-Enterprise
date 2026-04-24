import { Button } from "@orthoplus/core-ui/button";

interface RunButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function RunButton({ loading, onClick }: RunButtonProps) {
  return (
    <div className="flex items-end">
      <Button onClick={onClick} disabled={loading} className="w-full">
        {loading ? "Calculando..." : "Simular"}
      </Button>
    </div>
  );
}
