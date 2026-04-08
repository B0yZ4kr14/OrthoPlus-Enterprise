import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@orthoplus/core-ui/alert";
import { Sparkles } from "lucide-react";

interface ModuleSuggestionsProps {
  suggestions: string[];
}

export function ModuleSuggestions({ suggestions }: ModuleSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertTitle>Sugestões Inteligentes de Módulos</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <p className="text-sm font-medium">
            Baseado no perfil da sua clínica, recomendamos:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
