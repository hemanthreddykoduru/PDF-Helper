import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hemanth.pdfhelper',
  appName: 'PDF Helper',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;
