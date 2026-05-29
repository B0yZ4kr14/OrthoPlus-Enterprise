import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Edit, Trash2, Shield, Settings } from "lucide-react";
import type { User } from "./types";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onUpdateRole: (userId: string, role: "ADMIN" | "MEMBER") => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({
  users,
  loading,
  onUpdateRole,
  onEdit,
  onDelete,
}: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários da Clínica</CardTitle>
        <CardDescription>
          Total de {users.length} usuário(s) cadastrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário cadastrado
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">
                          {user.full_name || "Sem nome"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user.id}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role === "ADMIN" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Settings className="h-3 w-3 mr-1" />
                            Membro
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value: "ADMIN" | "MEMBER") =>
                          onUpdateRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Membro</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
