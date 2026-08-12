import { ViewerNavbar } from '@/components/navbar/ViewerNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <ViewerNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
