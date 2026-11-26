import { Dashboard } from '@/components/demo/dashboard';
import { PhoneHome } from '@/components/demo/phone-home';
import { useIsWide } from '@/components/demo/ui';

export default function HomeScreen() {
  return useIsWide() ? <Dashboard /> : <PhoneHome />;
}
