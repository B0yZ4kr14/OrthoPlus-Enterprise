import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Edit, Trash2, Shield } from "lucide-react";
import type { User } from "./types";
import { ROLE_OPTIONS } from "./types";

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UsersList({ users, onEdit, onDelete }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-medium text-primary">
                  {user.full_name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium">{user.full_name || "Sem nome"}</p>
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                >
                  {ROLE_OPTIONS.find((r) => r.value === user.role)?.label ||
                    user.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label="Editar usuário">
                <Shield className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label="Excluir usuário">
                <Edit className="h-4 w-4" />
              </Button>
              <Button type="button"
                variant="ghost"
                size="icon"
                aria-label="Excluir usuário"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
