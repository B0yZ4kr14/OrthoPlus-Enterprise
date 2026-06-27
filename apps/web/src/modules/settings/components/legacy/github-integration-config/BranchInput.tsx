import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface BranchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function BranchInput({ value, onChange }: BranchInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="branch">Branch Principal</Label>
      <Input
        id="branch"
        placeholder="main"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
