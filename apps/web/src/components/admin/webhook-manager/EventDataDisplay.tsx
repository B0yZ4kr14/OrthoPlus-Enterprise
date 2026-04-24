import type { EventData } from "./types";

interface EventDataDisplayProps {
  data: EventData;
}

export function EventDataDisplay({ data }: EventDataDisplayProps) {
  if (!data) return null;

  return (
    <div className="mt-2">
      {data.commits && Array.isArray(data.commits) && (
        <p className="text-sm">
          <span className="font-medium">{data.commits.length}</span> commit(s)
          recebido(s)
        </p>
      )}
      {data.pull_requests && data.pull_requests[0] && (
        <p className="text-sm">
          PR #{data.pull_requests[0].number}: {data.pull_requests[0].title}
        </p>
      )}
      {data.workflows && data.workflows[0] && (
        <p className="text-sm">
          Workflow: {data.workflows[0].name} - Status:{" "}
          {data.workflows[0].status}
        </p>
      )}
    </div>
  );
}
