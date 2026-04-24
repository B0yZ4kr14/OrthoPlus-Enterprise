// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { User } from "./types";

interface UserSelectProps {
  value: string;
  users: User[];
  onChange: (value: string) => void;
}

export function UserSelect({ value, users, onChange }: UserSelectProps) {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block">Selecionar Usuário</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Escolha um usuário MEMBER" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
