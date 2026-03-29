"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlusCircle, FileText, ShoppingBag, Settings
} from "lucide-react";

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
    { href: "/dashboard/create", label: "Yangi yaratish", icon: PlusCircle },
    { href: "/dashboard/invitations", label: "Taklifnomalarim", icon: FileText },
    { href: "/dashboard/orders", label: "Buyurtmalarim", icon: ShoppingBag },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin panel", icon: Settings });
  }

  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
              isActive 
                ? "bg-purple-50 text-purple-700 font-bold shadow-sm" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-purple-600" : "group-hover:text-gray-900"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/dashboard/create", icon: PlusCircle },
    { href: "/dashboard/invitations", icon: FileText },
    { href: "/dashboard/orders", icon: ShoppingBag },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", icon: Settings });
  }

  return (
    <div className="flex items-center gap-2">
      {navItems.slice(0, 4).map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`p-2 transition-all rounded-lg ${
              isActive 
                ? "text-purple-600 bg-purple-50 shadow-sm" 
                : "text-gray-500 hover:text-purple-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        )
      })}
    </div>
  );
}
