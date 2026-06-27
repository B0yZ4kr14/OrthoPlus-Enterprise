interface LastSyncInfoProps {
  lastSyncAt?: string;
}

export function LastSyncInfo({ lastSyncAt }: LastSyncInfoProps) {
  if (!lastSyncAt) return null;

  return (
    <div className="p-3 bg-muted rounded-lg text-sm">
      <span className="text-muted-foreground">Última sincronização:</span>{" "}
      {new Date(lastSyncAt).toLocaleString("pt-BR")}
    </div>
  );
}
