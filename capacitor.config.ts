import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ab203c0d07a2432588930110d34090b0',
  appName: 'ortho-plus-modules',
  webDir: 'dist',
  server: {
    url: 'https://orthoplus.i9corp.com.br',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      // Configurações do scanner
      supportedFormats: ['QR_CODE', 'EAN_13', 'EAN_8', 'CODE_128', 'CODE_39', 'CODE_93', 'UPC_A', 'UPC_E'],
    },
  },
};

export default config;
