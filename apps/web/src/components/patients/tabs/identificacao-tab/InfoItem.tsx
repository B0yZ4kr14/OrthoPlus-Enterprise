interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  fullWidth?: boolean;
}

export function InfoItem({ label, value, mono, fullWidth }: InfoItemProps) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className={`text-lg ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
