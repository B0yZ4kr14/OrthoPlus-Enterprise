export interface BackendConfig {
  type: "ubuntu-server";
  url: string;
  status: "online" | "offline" | "checking";
  latency: number | null;
}

export interface StatusConfig {
  variant: "default" | "destructive" | "outline";
  icon: "wifi" | "wifi-off" | "clock";
  text: string;
}
