'use client';

import ThemeRegistry from '@/components/ThemeRegistry';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeRegistry>{children}</ThemeRegistry>;
} 