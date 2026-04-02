import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@orthoplus/core-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

const scheduleSchema = z.object({
  dentistId: z.string().min(1, "Selecione um dentista"),
  dayOfWeek: z.string().min(1, "Selecione o dia da semana"),
  startTime: z.string().min(1, "Informe o horário de início"),
  endTime: z.string().min(1, "Informe o horário de término"),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface DentistScheduleFormProps {
  onSubmit: (data: {
    dentistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

export function DentistScheduleForm({
  onSubmit,
  isLoading,
}: DentistScheduleFormProps) {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  });

  const handleSubmit = (data: ScheduleFormData) => {
    onSubmit({
      dentistId: data.dentistId,
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: data.startTime,
      endTime: data.endTime,
      breakStart: data.breakStart,
      breakEnd: data.breakEnd,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="dentistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dentista</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dentista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dentist-1">Dr. João Silva</SelectItem>
                  <SelectItem value="dentist-2">Dra. Maria Santos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia da Semana</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="breakStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início Intervalo (opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="breakEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim Intervalo (opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Horário"}
        </Button>
      </form>
    </Form>
  );
}
