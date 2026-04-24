export type KruxStatus = "idle" | "scanning" | "signed";

export interface KruxState {
  status: KruxStatus;
  signedPSBT: string;
}
