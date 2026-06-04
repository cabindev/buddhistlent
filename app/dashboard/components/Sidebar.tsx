// app/dashboard/components/Sidebar.tsx
// หน้า Sidebar สำหรับจัดการเมนูหลักของระบบ งดเหล้าเข้าพรรษา - แก้ไข path ให้ถูกต้อง
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useDashboard } from '../context/DashboardContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  BarChart3,
  FileText,
  PlusCircle,
  User,
  LogOut,
  ChevronDown,
  Menu,
  PanelLeft,
  X,
  Wine,
  ClipboardList,
  UserCheck,
  Database,
  Building2,
  Settings,
  Table
} from 'lucide-react';

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard();
  const [isSoberMenuOpen, setIsSoberMenuOpen] = useState(false);
  const [isFormReturnMenuOpen, setIsFormReturnMenuOpen] = useState(false);
  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // เปิดเมนูอัตโนมัติตามหน้าที่กำลังเปิดอยู่
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/organization-category') || pathname?.startsWith('/dashboard/organization')) {
      setIsOrganizationMenuOpen(true);
    }
    if (pathname?.startsWith('/dashboard/soberCheers') || pathname?.startsWith('/soberCheers')) {
      setIsSoberMenuOpen(true);
    }
    if (pathname?.startsWith('/dashboard/formReturn') || pathname?.startsWith('/dashboard/form_return') || pathname?.startsWith('/form_return')) {
      setIsFormReturnMenuOpen(true);
    }
    if (pathname?.startsWith('/dashboard/setting')) {
      setIsSettingsMenuOpen(true);
    }
  }, [pathname]);

  // ปิด sidebar บนมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => {
    if (isMobileSidebarOpen) {
      toggleMobileSidebar(false);
    }
  }, [pathname]);

  // Organization Management menu
  const organizationMenu = {
    name: 'องค์กรเข้าร่วม เข้าพรรษา',
    href: '/dashboard/organization',
    icon: Building2,
    subMenus: [
      {
        name: 'Dashboard',
        href: '/dashboard/organization',
        icon: BarChart3,
        requireAdmin: true
      },
      {
        name: 'ข้อมูลองค์กร ร่วมเข้าพรรษา',
        href: '/dashboard/organization/tables',
        icon: Table,
        requireAdmin: true
      },
      {
        name: 'แกลเลอรี่องค์กร',
        href: '/dashboard/organization/gallery',
        icon: Building2,
        requireAdmin: true
      },
      {
        name: 'จัดการหมวดหมู่องค์กร',
        href: '/dashboard/organization-category',
        icon: Settings,
        requireAdmin: true
      },
      {
        name: 'เพิ่มองค์กรใหม่',
        href: '/dashboard/organization/create',
        icon: PlusCircle,
        requireAdmin: false
      }
    ]
  };

  // เมนูสำหรับ SoberCheers
  const soberCheersMenu = {
    name: 'Sober Cheers',
    href: '/dashboard/soberCheers',
    icon: Wine,
    subMenus: [
      {
        name: 'Dashboard',
        href: '/dashboard/soberCheers',
        icon: BarChart3,
        requireAdmin: true
      },
      {
        name: 'ข้อมูลผู้เข้าร่วม',
        href: '/dashboard/soberCheers/components/soberTable',
        icon: Database,
        requireAdmin: true
      },
      {
        name: 'ลงทะเบียน',
        href: '/soberCheers/create',
        icon: PlusCircle,
        requireAdmin: false
      },
    ]
  };

  // เมนูสำหรับ Form Return
  const formReturnMenu = {
    name: 'Form Return Management',
    href: '/dashboard/form_return',
    icon: ClipboardList,
    subMenus: [
      {
        name: 'Dashboard',
        href: '/dashboard/form_return',
        icon: BarChart3,
        requireAdmin: true
      },
      {
        name: 'ตารางข้อมูลการคืนฟอร์ม',
        href: '/dashboard/form_return/table',
        icon: Table,
        requireAdmin: true
      },
      {
        name: 'คืนข้อมูลงดเหล้าเข้าพรรษา',
        href: '/dashboard/formReturn',
        icon: FileText,
        requireAdmin: true
      }
    ]
  };

  // เมนูสำหรับ Settings
  const settingsMenu = {
    name: 'Settings',
    href: '/dashboard/setting',
    icon: Settings,
    subMenus: [
      {
        name: 'จัดการผู้ดูแลระบบ',
        href: '/dashboard/setting/admin',
        icon: UserCheck,
        requireAdmin: true
      }
    ]
  };
  
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Overlay สำหรับกดปิด sidebar บนมือถือ */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => toggleMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-200",
          sidebarCollapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-3 bg-gray-50">
          {!sidebarCollapsed ? (
            <div className="flex items-center">
              <Link href="/dashboard/soberCheers">
                <img
                  src="/x-right.png"
                  alt="Logo"
                  className="h-7 w-auto"
                />
              </Link>
              <Link href="/" className="ml-2">
                <span className="text-gray-800 font-medium text-sm">
                  BUDDHIST LENT 
                </span>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard/soberCheers" className="mx-auto">
              <div className="h-7 w-7 bg-orange-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            </Link>
          )}

          {/* ปุ่มปิดบนมือถือ */}
          <button
            onClick={() => toggleMobileSidebar(false)}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ปุ่มย่อ/ขยายบนจอใหญ่ */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 hidden lg:block"
            aria-label={sidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            {sidebarCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Sidebar menu */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* ย้าย: ระบบจัดการ งดเหล้าเข้าพรรษา ไว้บนสุด */}
          <div className="mt-2">
            {!sidebarCollapsed && (
              <h4 className="px-2 text-base text-center font-semibold text-gray-700 uppercase tracking-wide mb-2">
               ADMIN PANEL
              </h4>
            )}

            {/* Organization Management menu (ย้ายมาอยู่ถัดจาก ADMIN PANEL) */}
            <div className="px-2 mb-2">
              <button
                onClick={() => setIsOrganizationMenuOpen(!isOrganizationMenuOpen)}
                className={cn(
                  "group flex items-center w-full p-2 rounded text-sm transition-colors",
                  pathname?.startsWith("/dashboard/organization")
                    ? "bg-amber-50 text-amber-700 border-l-2 border-amber-500"
                    : "text-gray-700 hover:bg-gray-50",
                  sidebarCollapsed && "justify-center"
                )}
                title={sidebarCollapsed ? organizationMenu.name : ""}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    sidebarCollapsed ? "h-8 w-8" : "h-4 w-4"
                  )}
                >
                  <Building2 className={sidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full ml-2">
                    <span className="font-medium text-sm text-orange-600">{organizationMenu.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isOrganizationMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Organization submenu */}
              {(isOrganizationMenuOpen ||
                pathname?.startsWith("/dashboard/organization")) &&
                !sidebarCollapsed && (
                  <div className="mt-1 ml-2">
                    <ul className="space-y-1">
                      {organizationMenu.subMenus.map((subMenu) => {
                        if (subMenu.requireAdmin && !isAdmin) {
                          return null;
                        }

                        const Icon = subMenu.icon;
                        const isSubActive =
                          pathname === subMenu.href ||
                          (subMenu.href === '/dashboard/organization' && pathname === '/dashboard/organization') ||
                          (subMenu.href === '/dashboard/organization/tables' && pathname?.includes('/organization/tables'));

                        return (
                          <li key={subMenu.href}>
                            <Link
                              href={subMenu.href}
                              className={`flex items-center p-2 text-sm rounded transition-colors ${
                                isSubActive
                                  ? "bg-amber-100 text-amber-800"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              <span className="text-xs font-normal">{subMenu.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>

            {/* SoberCheers menu */}
            <div className="px-2 mb-2">
              <button
                onClick={() => setIsSoberMenuOpen(!isSoberMenuOpen)}
                className={cn(
                  "group flex items-center w-full p-2 rounded text-sm transition-colors",
                  pathname?.startsWith("/dashboard/soberCheers") ||
                    pathname?.startsWith("/soberCheers")
                    ? "bg-green-50 text-green-700 border-l-2 border-green-500"
                    : "text-gray-700 hover:bg-gray-50",
                  sidebarCollapsed && "justify-center"
                )}
                title={sidebarCollapsed ? soberCheersMenu.name : ""}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    sidebarCollapsed ? "h-8 w-8" : "h-4 w-4"
                  )}
                >
                  <Wine className={sidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full ml-2">
                    <span className="font-medium text-sm">{soberCheersMenu.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isSoberMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* SoberCheers submenu */}
              {(isSoberMenuOpen ||
                pathname?.startsWith("/dashboard/soberCheers") ||
                pathname?.startsWith("/soberCheers")) &&
                !sidebarCollapsed && (
                  <div className="mt-1 ml-2">
                    <ul className="space-y-1">
                      {soberCheersMenu.subMenus.map((subMenu) => {
                        if (subMenu.requireAdmin && !isAdmin) {
                          return null;
                        }

                        const Icon = subMenu.icon;
                        const isSubActive =
                          pathname === subMenu.href ||
                          pathname?.startsWith(subMenu.href);

                        return (
                          <li key={subMenu.href}>
                            <Link
                              href={subMenu.href}
                              className={`flex items-center p-2 text-sm rounded transition-colors ${
                                isSubActive
                                  ? "bg-green-100 text-green-800"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              <span className="text-xs font-normal">{subMenu.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>

            {/* Form Return menu */}
            <div className="px-2 mb-2">
              <button
                onClick={() => setIsFormReturnMenuOpen(!isFormReturnMenuOpen)}
                className={cn(
                  "group flex items-center w-full p-2 rounded text-sm transition-colors",
                  pathname?.startsWith("/dashboard/formReturn") ||
                    pathname?.startsWith("/dashboard/form_return") ||
                    pathname?.startsWith("/form_return")
                    ? "bg-purple-50 text-purple-700 border-l-2 border-purple-500"
                    : "text-gray-700 hover:bg-gray-50",
                  sidebarCollapsed && "justify-center"
                )}
                title={sidebarCollapsed ? formReturnMenu.name : ""}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    sidebarCollapsed ? "h-8 w-8" : "h-4 w-4"
                  )}
                >
                  <ClipboardList className={sidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full ml-2">
                    <span className="font-medium text-sm">{formReturnMenu.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isFormReturnMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Form Return submenu */}
              {(isFormReturnMenuOpen ||
                pathname?.startsWith("/dashboard/formReturn") ||
                pathname?.startsWith("/dashboard/form_return") ||
                pathname?.startsWith("/form_return")) &&
                !sidebarCollapsed && (
                  <div className="mt-1 ml-2">
                    <ul className="space-y-1">
                      {formReturnMenu.subMenus.map((subMenu) => {
                        if (subMenu.requireAdmin && !isAdmin) {
                          return null;
                        }

                        const Icon = subMenu.icon;
                        const isSubActive =
                          pathname === subMenu.href ||
                          pathname?.startsWith(subMenu.href);

                        return (
                          <li key={subMenu.href}>
                            <Link
                              href={subMenu.href}
                              className={`flex items-center p-2 text-sm rounded transition-colors ${
                                isSubActive
                                  ? "bg-purple-100 text-purple-800"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              <span className="text-xs font-normal">{subMenu.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>

            {/* Settings menu */}
            {isAdmin && (
              <div className="px-2 mb-2">
                <button
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className={cn(
                    "group flex items-center w-full p-2 rounded text-sm transition-colors",
                    pathname?.startsWith("/dashboard/setting")
                      ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500"
                      : "text-gray-700 hover:bg-gray-50",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? settingsMenu.name : ""}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      sidebarCollapsed ? "h-8 w-8" : "h-4 w-4"
                    )}
                  >
                    <Settings className={sidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full ml-2">
                      <span className="font-medium text-sm">{settingsMenu.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          isSettingsMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Settings submenu */}
                {(isSettingsMenuOpen ||
                  pathname?.startsWith("/dashboard/setting")) &&
                  !sidebarCollapsed && (
                    <div className="mt-1 ml-2">
                      <ul className="space-y-1">
                        {settingsMenu.subMenus.map((subMenu) => {
                          if (subMenu.requireAdmin && !isAdmin) {
                            return null;
                          }

                          const Icon = subMenu.icon;
                          const isSubActive =
                            pathname === subMenu.href ||
                            pathname?.startsWith(subMenu.href);

                          return (
                            <li key={subMenu.href}>
                              <Link
                                href={subMenu.href}
                                className={`flex items-center p-2 text-sm rounded transition-colors ${
                                  isSubActive
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <Icon className="w-4 h-4 mr-2" />
                                <span className="text-xs font-normal">{subMenu.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* User info & logout */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div
            className={cn(
              "flex items-center bg-white p-2 rounded border border-gray-200",
              sidebarCollapsed && "justify-center"
            )}
          >
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-900">
                  {user?.firstName || user?.name || ""} {user?.lastName || ""}
                </p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
                <p className="text-xs mt-1 bg-gray-100 text-gray-600 inline-block px-2 py-0.5 rounded border border-gray-200">
                  {user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                toast.loading('กำลังออกจากระบบ...');
                await signOut({ callbackUrl: "/" });
              } catch (error) {
                toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
                console.error('Sign out error:', error);
              }
            }}
            className={cn(
              "mt-2 flex items-center p-2 rounded w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm transition-colors",
              sidebarCollapsed && "justify-center"
            )}
            aria-label="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="ml-2 font-normal">ออกจากระบบ</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}