import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";

interface PatientCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function PatientCard({ title, icon, children }: PatientCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}
