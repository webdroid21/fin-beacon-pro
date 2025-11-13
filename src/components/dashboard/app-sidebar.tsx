"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Wallet,
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
    title: "Accounts",
    url: "/dashboard/accounts",
    icon: Wallet,
    items: [
      {
        title: "All Accounts",
        url: "/dashboard/accounts",
      },
      {
        title: "Add Account",
        url: "/dashboard/accounts/new",
      },
      {
        title: "Transfer Funds",
        url: "/dashboard/accounts/transfer",
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
        title: "Add Entry",
        url: "/dashboard/expenses/new",
      },
    ],
  },
  {
    title: "Budgets",
    url: "/dashboard/budgets",
    icon: TrendingUp,
    items: [
      {
        title: "All Budgets",
        url: "/dashboard/budgets",
      },
      {
        title: "Create Budget",
        url: "/dashboard/budgets/new",
      },
    ],
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
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="size-8"
                />
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
