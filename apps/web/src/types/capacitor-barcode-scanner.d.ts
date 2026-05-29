declare module "@capacitor-community/barcode-scanner" {
  export interface PermissionStatus {
    granted: boolean;
    denied: boolean;
    restricted: boolean;
    unknown: boolean;
  }

  export interface ScanResult {
    hasContent: boolean;
    content?: string;
    format?: string;
  }

  export class BarcodeScanner {
    static checkPermission(options?: {
      force?: boolean;
    }): Promise<PermissionStatus>;
    static hideBackground(): Promise<void>;
    static showBackground(): Promise<void>;
    static startScan(): Promise<ScanResult>;
    static stopScan(): Promise<void>;
  }
}
