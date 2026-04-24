import { Badge } from "@orthoplus/core-ui/badge";

interface LeadTagsProps {
  tags: string[];
}

export function LeadTags({ tags }: LeadTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
