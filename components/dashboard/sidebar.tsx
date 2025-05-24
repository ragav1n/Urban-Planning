"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Scale, Map, LogOut, Building2, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/sign-in")
  }

  const menuItems = [
    { icon: FileText, label: "Compliance Reports", href: "/dashboard/reports" },
    { icon: Upload, label: "Grievance Uploading", href: "/dashboard/grievance" },
    { icon: Scale, label: "Regulation Checker", href: "/dashboard/regulations" },
    { icon: Map, label: "Optimal Zoning", href: "/dashboard/zoning" },
  ]

  return (
    <div
      className={cn(
        "relative h-full bg-gray-900 border-r border-gray-800 group/sidebar flex-shrink-0",
        isCollapsed ? "w-[70px]" : "w-64",
        "transition-all duration-300 ease-in-out",
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard"
            className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between", "w-full")}
          >
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-500 shrink-0" />
              <span
                className={cn(
                  "font-bold text-xl text-white ml-2",
                  "transition-all duration-300 ease-in-out",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto",
                )}
              >
                UrbanPlan
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link key={index} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center text-gray-200 hover:bg-gray-800 hover:text-white rounded-xl",
                    "transition-all duration-300 ease-in-out group/item",
                    isCollapsed ? "justify-center px-3" : "justify-start px-4",
                    isActive && "bg-gray-800 text-white",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-purple-500")} />
                  <span
                    className={cn(
                      "ml-3 whitespace-nowrap",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto",
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-6 bg-gray-800 rounded-full p-1.5 border border-gray-700",
            "hover:bg-gray-700 transition-colors",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-400" />
          )}
        </button>

        {/* Sign Out */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className={cn(
              "w-full flex items-center text-red-400 hover:bg-red-500/10 rounded-xl",
              "transition-all duration-300 ease-in-out group/item",
              isCollapsed ? "justify-center px-3" : "justify-start px-4",
            )}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "ml-3 whitespace-nowrap",
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto",
              )}
            >
              Sign Out
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
