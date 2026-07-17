import { Sidebar } from "@/src/app/components/common/sidebar";
import { Navbar } from "@/src/app/components/common/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </div>
  );
}
