declare module "html5-qrcode" {
  interface Html5QrcodeScannerConfig {
    fps?: number;
    qrbox?: { width: number; height: number } | number;
    formatsToSupport?: number[];
  }

  class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: Html5QrcodeScannerConfig,
      verbose: boolean,
    );
    render(
      successCallback: (decodedText: string, decodedResult: unknown) => void,
      errorCallback?: (errorMessage: string) => void,
    ): void;
    clear(): Promise<void>;
  }

  export { Html5QrcodeScanner };
}
