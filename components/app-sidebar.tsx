"use client"

import * as React from "react"
import {
  LayoutGrid,
  Star,
  History,
  Settings,
  PlusCircle,
  Telescope,
  PanelLeft,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "My Orbits",
      url: "/orbits",
      icon: Telescope,
    },
  ],
  navSecondary: [
    {
      title: "Orbit Score",
      url: "/score",
      icon: Star,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  
  const handleLogout = async () => {
    // Mock logout - simply redirect
    router.push("/");
  }
  
  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="flex flex-col justify-center py-4 h-[73px] border-b border-[var(--orbit-border)] bg-transparent px-0">
        <div className="flex items-center justify-between w-full px-2">
          
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (state === "collapsed") toggleSidebar();
              }}
              className={`group/logo shrink-0 relative w-8 h-8 flex items-center justify-center rounded-md transition-colors ${state === "collapsed" ? "hover:bg-white/10 cursor-pointer" : "cursor-default"}`}
              aria-label="Orbit Logo"
            >
              <Image 
                src="/orbit_logo.png" 
                alt="Orbit Logo" 
                width={24} 
                height={24} 
                className={`absolute inset-0 m-auto transition-opacity duration-200 ${state === "collapsed" ? "opacity-100 group-hover/logo:opacity-0" : "opacity-100"}`} 
              />
              <PanelLeft 
                className={`absolute inset-0 m-auto text-white transition-opacity duration-200 w-5 h-5 ${state === "collapsed" ? "opacity-0 group-hover/logo:opacity-100" : "hidden"}`} 
              />
            </button>
            <span className="ml-2 font-semibold text-lg tracking-wide truncate group-data-[collapsible=icon]:hidden text-white select-none">
              Orbit
            </span>
          </div>

          <button 
            onClick={toggleSidebar}
            className="group-data-[collapsible=icon]:hidden flex shrink-0 items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-[18px] h-[18px]" />
          </button>

        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-orbit-text-muted mb-2 font-semibold group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = item.url !== "#" && pathname.startsWith(item.url);
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive} 
                    tooltip={item.title}
                    className={isActive 
                      ? "!bg-[var(--orbit-brand-bg)] !text-white hover:!bg-[var(--orbit-brand-bg)] hover:!text-white" 
                      : "!bg-transparent text-[var(--orbit-text-secondary)] hover:!text-white hover:!bg-white/5"}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator className="my-2 bg-[var(--orbit-border)]" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-orbit-text-muted mb-2 font-semibold group-data-[collapsible=icon]:hidden">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => {
                const isActive = item.url !== "#" && pathname.startsWith(item.url);
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive} 
                    tooltip={item.title}
                    className={isActive 
                      ? "!bg-[var(--orbit-brand-bg)] !text-white hover:!bg-[var(--orbit-brand-bg)] hover:!text-white" 
                      : "!bg-transparent text-[var(--orbit-text-secondary)] hover:!text-white hover:!bg-white/5"}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip="Log out"
              className="!bg-transparent text-[var(--orbit-text-secondary)] hover:!text-[var(--orbit-danger)] hover:!bg-[var(--orbit-danger-bg)]"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
