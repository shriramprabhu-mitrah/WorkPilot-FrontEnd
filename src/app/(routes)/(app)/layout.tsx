import { Sidebar } from '@/src/app/components/common/sidebar';
import { Navbar } from '@/src/app/components/common/navbar';
import { colors } from '@/src/styles/colors';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.gray50 }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: colors.gray50 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
