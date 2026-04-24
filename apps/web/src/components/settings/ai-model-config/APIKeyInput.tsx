// cspell:disable
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import type { AIModelConfig } from "./types";

interface APIKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
  url: string;
  urlLabel: string;
}

export function APIKeyInput({
  label,
  placeholder,
  value,
  show,
  onChange,
  onToggleShow,
  url,
  urlLabel,
}: APIKeyInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button variant="outline" size="icon" onClick={onToggleShow}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Obtenha em:{" "}
        <a href={url} target="_blank" rel="noopener" className="underline">
          {urlLabel}
        </a>
      </p>
    </div>
  );
}
