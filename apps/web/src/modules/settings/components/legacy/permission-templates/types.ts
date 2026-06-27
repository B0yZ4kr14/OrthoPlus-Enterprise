// cspell:disable
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  module_keys: string[];
}

export interface User {
  id: string;
  full_name: string;
}
