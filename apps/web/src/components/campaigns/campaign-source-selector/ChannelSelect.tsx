import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { SourceSelect } from "./SourceSelect";
import type { CaptureChannel } from "./types";

interface ChannelSelectProps {
  value: string;
  channels: CaptureChannel[];
  selectedChannel: CaptureChannel | null;
  sourceValue: string;
  onChannelChange: (value: string) => void;
  onSourceChange: (value: string) => void;
}

export function ChannelSelect({
  value,
  channels,
  selectedChannel,
  sourceValue,
  onChannelChange,
  onSourceChange,
}: ChannelSelectProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel">Canal de Captação</Label>
        <Select value={value} onValueChange={onChannelChange}>
          <SelectTrigger id="channel">
            <SelectValue placeholder="Selecione um canal" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChannel && (
        <SourceSelect
          value={sourceValue}
          sources={selectedChannel.sources}
          onChange={onSourceChange}
        />
      )}
    </div>
  );
}
