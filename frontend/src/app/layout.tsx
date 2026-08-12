import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/themes/theme-provider';

export const metadata: Metadata = {
  title: 'HealthTech Knowledge Base',
  description: 'AI powered healthcare knowledge system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
