import * as React from "react"
import { Bell, User } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function OrbitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-h-screen">
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 h-[73px] border-b border-[var(--orbit-border)] bg-[var(--orbit-bg-app)] shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden text-[var(--orbit-text-secondary)] hover:text-white hover:bg-white/5 [&_svg]:size-[18px]" />
          </div>
          <div className="flex items-center gap-3">
            <button className="orbit-icon-btn rounded-full bg-transparent border-none hover:bg-[var(--orbit-brand-bg)] text-[var(--orbit-text-secondary)] hover:text-[var(--orbit-brand-light)] transition-colors">
              <Bell size={18} />
            </button>
            <button className="orbit-icon-btn rounded-full bg-[var(--orbit-bg-card)] border-[0.5px] border-[var(--orbit-border-strong)] hover:border-[var(--orbit-brand-light)] transition-colors">
              <User size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[var(--orbit-bg-app)]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
