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
  Plus,
  Users,
  UserCircle,
  Shield,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orthoplus/core-ui/dropdown-menu";
import { UserForm } from "@/components/usuarios/UserForm";
import { Avatar, AvatarFallback, AvatarImage } from "@orthoplus/core-ui/avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsuariosPage } from "@/hooks/api/useUsuariosPage";

export default function Usuarios() {
  const { clinicId, isAdmin } = useAuth();
  const {
    filteredUsers,
    isLoading,
    selectedUser,
    isDialogOpen,
    setIsDialogOpen,
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleDialogClose,
    isDeleting,
    isToggling,
  } = useUsuariosPage(clinicId ?? undefined);

  const getRoleBadge = (role: "ADMIN" | "MEMBER") => {
    if (role === "ADMIN") {
      return (
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          Administrador
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <UserCircle className="h-3 w-3" />
        Membro
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Apenas administradores podem gerenciar usuários.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={KeyRound}
        title="Usuários"
        description="Gerenciamento de acessos e permissões"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" onClick={() => handleDialogClose()} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? "Editar Usuário" : "Novo Usuário"}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser
                    ? "Atualize as informações do usuário"
                    : "Preencha os dados para criar um novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                user={selectedUser}
                onSuccess={handleDialogClose}
                onCancel={handleDialogClose}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Usuários"
          value={filteredUsers.length}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Administradores"
          value={filteredUsers.filter((u) => u.app_role === "ADMIN").length}
          icon={Shield}
          variant="warning"
        />
        <StatsCard
          title="Usuários Ativos"
          value={filteredUsers.filter((u) => u.is_active).length}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <Card variant="elevated" className="glass-card">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.full_name}</p>
                        {getRoleBadge(user.app_role)}
                        {user.is_active ? (
                          <Badge
                            variant="outline"
                            className="gap-1 text-success"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 text-muted-foreground"
                          >
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.last_sign_in_at && (
                          <p className="text-sm text-muted-foreground">
                            Último acesso:{" "}
                            {new Date(user.last_sign_in_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Ações do usuário">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleActive(user.id, user.is_active)
                        }
                        disabled={isToggling}
                      >
                        {user.is_active ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
