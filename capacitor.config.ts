import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bingeboard.app',
  appName: 'BingeBoard',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // For development - remove in production
    // url: 'http://192.168.1.234:5000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerStyle: "small",
      spinnerColor: "#ef4444"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000"
    },
    Keyboard: {
      resize: "ionic"
    },
    App: {
      launchUrl: "bingeboard://",
      deepLinkingEnabled: true
    },
    Browser: {
      presentationStyle: "popover"
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#ef4444"
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'BingeBoard',
    preferredContentMode: 'mobile'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'AAB'
    },
    allowMixedContent: false
  }
};

export default config;
