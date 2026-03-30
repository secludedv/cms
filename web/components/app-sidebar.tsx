"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  HardHat,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/lib/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Managers",
      href: "/admin/managers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Engineers",
      href: "/admin/engineers",
      icon: <HardHat className="h-4 w-4" />,
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      title: "Complaints",
      href: "/admin/complaints",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      title: "Register Admin",
      href: "/admin/register-admin",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ],
  MANAGER: [
    {
      title: "Customers",
      href: "/manager",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      title: "Engineers",
      href: "/manager/engineers",
      icon: <HardHat className="h-4 w-4" />,
    },
    {
      title: "Complaints",
      href: "/manager/complaints",
      icon: <ClipboardList className="h-4 w-4" />,
    },
  ],
  ENGINEER: [
    {
      title: "My Assignments",
      href: "/engineer",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      title: "History",
      href: "/engineer/history",
      icon: <History className="h-4 w-4" />,
    },
  ],
  CUSTOMER: [
    {
      title: "My Complaints",
      href: "/customer",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      title: "New Complaint",
      href: "/customer/complaints/new",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      title: "Profile",
      href: "/customer/profile",
      icon: <User className="h-4 w-4" />,
    },
  ],
};

export function AppSidebar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role;
  const items = role ? NAV_ITEMS[role] ?? [] : [];
  const roleRoot = role ? `/${role.toLowerCase()}` : "";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">CMS</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          Complaint Management
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.href === roleRoot
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {loading ? "Loading..." : user?.role}
            </p>
          </div>
        </div>
        {!loading && user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
