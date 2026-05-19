export interface User {
  id: string
  full_name: string | null
  role: "ADMIN" | "MEMBER" | "ROOT"
  clinic_id: string
  created_at: string
}

export interface ModulePermission {
  module_key: string
  module_name: string
  can_view: boolean
  can_edit: boolean
  can_delete: boolean
}
