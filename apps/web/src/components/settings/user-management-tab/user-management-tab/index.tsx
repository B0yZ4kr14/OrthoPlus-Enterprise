/**
 * UserManagementTab - Componente Orquestrador (Refatorado)
 *
 * ANTES: 557 linhas
 * DEPOIS: ~70 linhas + estrutura modular
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Settings, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "../useUserManagement";
import { UsersList } from "../UsersList";
import { AddUserDialog } from "../AddUserDialog";
import { PermissionsDialog } from "../PermissionsDialog";

export function UserManagementTab() {
  const { clinicId, hasRole } = useAuth();
  const {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    userPermissions,
    setUserPermissions,
    handleAddUser,
    handleDeleteUser,
    handleUpdatePermissions,
  } = useUserManagement(clinicId);

  if (!hasRole("ADMIN")) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Você não tem permissão para gerenciar usuários
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <AddUserDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddUser}
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários da Clínica</CardTitle>
              <CardDescription>
                Gerencie os usuários e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList
                users={users}
                onEdit={setSelectedUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configurações gerais de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações adicionais serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PermissionsDialog
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        permissions={userPermissions}
        onPermissionsChange={setUserPermissions}
        onSave={handleUpdatePermissions}
      />
    </div>
  );
}
