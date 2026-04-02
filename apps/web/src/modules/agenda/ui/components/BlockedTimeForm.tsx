import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Calendar } from "@orthoplus/core-ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orthoplus/core-ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { cn } from "@/lib/utils";

const blockedTimeSchema = z.object({
  dentistId: z.string().min(1, "Selecione um dentista"),
  startDate: z.date({ required_error: "Selecione a data de início" }),
  startTime: z.string().min(1, "Informe o horário de início"),
  endDate: z.date({ required_error: "Selecione a data de término" }),
  endTime: z.string().min(1, "Informe o horário de término"),
  reason: z.string().min(1, "Informe o motivo do bloqueio"),
});

type BlockedTimeFormData = z.infer<typeof blockedTimeSchema>;

interface BlockedTimeFormProps {
  onSubmit: (data: {
    dentistId: string;
    startDatetime: Date;
    endDatetime: Date;
    reason: string;
  }) => void;
  isLoading?: boolean;
}

export function BlockedTimeForm({ onSubmit, isLoading }: BlockedTimeFormProps) {
  const form = useForm<BlockedTimeFormData>({
    resolver: zodResolver(blockedTimeSchema),
  });

  const handleSubmit = (data: BlockedTimeFormData) => {
    const [startHours, startMinutes] = data.startTime.split(":");
    const startDatetime = new Date(data.startDate);
    startDatetime.setHours(parseInt(startHours), parseInt(startMinutes));

    const [endHours, endMinutes] = data.endTime.split(":");
    const endDatetime = new Date(data.endDate);
    endDatetime.setHours(parseInt(endHours), parseInt(endMinutes));

    onSubmit({
      dentistId: data.dentistId,
      startDatetime,
      endDatetime,
      reason: data.reason,
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Início</FormLabel>
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Término</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecione</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo do Bloqueio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Férias, Congresso, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Bloqueando..." : "Bloquear Horário"}
        </Button>
      </form>
    </Form>
  );
}
