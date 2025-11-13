"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Receipt,
  TrendingUp,
  BarChart3,
  Settings,
  DollarSign,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: FileText,
    items: [
      {
        title: "All Invoices",
        url: "/dashboard/invoices",
      },
      {
        title: "Create New",
        url: "/dashboard/invoices/new",
      },
      {
        title: "Drafts",
        url: "/dashboard/invoices?status=draft",
      },
      {
        title: "Pending",
        url: "/dashboard/invoices?status=pending",
      },
    ],
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
    items: [
      {
        title: "All Payments",
        url: "/dashboard/payments",
      },
      {
        title: "Record Payment",
        url: "/dashboard/payments/new",
      },
    ],
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: Users,
    items: [
      {
        title: "All Clients",
        url: "/dashboard/clients",
      },
      {
        title: "Add Client",
        url: "/dashboard/clients/new",
      },
    ],
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: Receipt,
    items: [
      {
        title: "All Expenses",
        url: "/dashboard/expenses",
      },
      {
        title: "Add Expense",
        url: "/dashboard/expenses/new",
      },
    ],
  },
  {
    title: "Budgets",
    url: "/dashboard/budgets",
    icon: TrendingUp,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    url: "#",
    icon: HelpCircle,
  },
  {
    title: "Feedback",
    url: "#",
    icon: MessageSquare,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userProfile } = useAuth();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <DollarSign className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userProfile?.businessProfile?.name || "Fin Beacon Pro"}
                  </span>
                  <span className="truncate text-xs">
                    {userProfile?.businessProfile?.industry || "Finance Management"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
