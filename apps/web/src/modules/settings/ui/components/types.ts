export interface ModuleData {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  blocking_dependencies: string[];
}
