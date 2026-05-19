interface UserFiltersProps {
  children?: React.ReactNode
}

export function UserFilters({ children }: UserFiltersProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie funcionários, roles e permissões por módulo
        </p>
      </div>
      {children}
    </div>
  )
}
