import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { NotificationBridge } from '@/components/demo/notification-bridge';
import { DemoProvider } from '@/demo/demo-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // The demo uses the light LinguaLink palette on every device.
  return (
    <ThemeProvider value={DefaultTheme}>
      <DemoProvider>
        <AnimatedSplashOverlay />
        <NotificationBridge />
        <AppTabs />
      </DemoProvider>
    </ThemeProvider>
  );
}
