interface StrengthBarProps {
  score: number;
  color: string;
  minimal?: boolean;
}

export function StrengthBar({ score, color, minimal }: StrengthBarProps) {
  const heightClass = minimal ? "h-1" : "h-2";
  const bgClass = minimal ? "bg-muted" : "bg-muted/50";

  return (
    <div className={`flex gap-1 ${minimal ? "" : "space-y-2"}`}>
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${heightClass} flex-1 rounded transition-all duration-300 ${
              i < score ? color : bgClass
            }`}
          />
        ))}
      </div>
    </div>
  );
}
