'use client';

import { AlertaProvider } from '@/contexts/AlertaContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AlertaProvider>{children}</AlertaProvider>;
}
