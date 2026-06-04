// app/components/Navbar.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  User, 
  LogOut, 
  Menu, 
  BarChart3, 
  Users, 
  UserCog, 
  Plus,
  ClipboardList,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormReturnMenuOpen, setIsFormReturnMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ปิดเมนูเมื่อคลิกนอก dropdown - ต้องเรียกก่อน early return
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu')) {
        setIsFormReturnMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isAdmin = session?.user?.role === 'admin';
  
  // ซ่อน Navbar ในหน้า dashboard และ profile - ตรวจสอบหลังจาก Hooks ทั้งหมด
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isProfilePage = pathname === '/profile';
  
  if (isDashboardPage || isProfilePage) {
    return null;
  }

  const formReturnMenuItems = [
    {
      key: 'viewFormReturn',
      label: 'คืนข้อมูลงดเหล้าเข้าพรรษา',
      href: '/form_return',
      icon: <ClipboardList className="w-4 h-4" />,
      description: 'รายการคืนข้อมูล'
    },
    {
      key: 'createFormReturn',
      label: 'เพิ่มข้อมูลงดเหล้าเข้าพรรษา',
      href: '/form_return/create',
      icon: <Plus className="w-4 h-4" />,
      description: 'สร้างฟอร์มคืนข้อมูลใหม่'
    }
  ];

  const userMenuItems = [
    {
      key: 'home',
      label: 'Home',
      href: 'https://sdnthailand.com/',
      icon: <Home className="w-4 h-4" />
    },
    {
      key: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-4 h-4" />
    }
  ];

  return (
    <nav className="relative z-50 bg-orange-600 border-b border-orange-700/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo และ Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <span className="text-sm font-semibold text-white cursor-pointer">
                Buddhist Lent
              </span>
            </Link>

            <div className="hidden md:block w-px h-4 bg-orange-400/50"></div>

            <Link
              href="https://sdnthailand.com/"
              className="hidden md:flex items-center text-xs text-orange-100 hover:text-white transition-colors"
            >
              Home
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {status === "loading" ? (
              <div className="w-16 h-6 bg-orange-500/50 rounded animate-pulse"></div>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className="flex items-center text-xs text-orange-100 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-orange-700/40"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Dashboard
                  </Link>
                )}

                <div className="relative dropdown-menu">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFormReturnMenuOpen(!isFormReturnMenuOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center text-xs text-orange-100 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-orange-700/40"
                  >
                    <ClipboardList className="w-3 h-3 mr-1" />
                    คืนข้อมูลงดเหล้าเข้าพรรษา
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>

                  {isFormReturnMenuOpen && (
                    <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-orange-100 py-2 z-50">
                      {formReturnMenuItems.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="flex items-start px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                          onClick={() => setIsFormReturnMenuOpen(false)}
                        >
                          <div className="mr-2 mt-0.5 text-orange-500">{item.icon}</div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User Menu */}
            {status === "loading" ? (
              <div className="w-10 h-10 bg-orange-500/50 rounded-full animate-pulse"></div>
            ) : session && session.user ? (
              <div className="relative dropdown-menu">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsFormReturnMenuOpen(false);
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={session.user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                    alt="User profile"
                    className="w-9 h-9 rounded-full cursor-pointer object-cover border-2 border-orange-300 hover:border-white transition-colors"
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-orange-100 py-2 z-50">
                    <div className="px-3 py-2 border-b border-orange-100">
                      <p className="text-xs font-medium text-slate-800">{session.user.firstName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
                    </div>

                    {userMenuItems.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-orange-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => { signOut({ callbackUrl: "/" }); setIsUserMenuOpen(false); }}
                        className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3 h-3" />
                        <span className="ml-2">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/auth/signin")}
                className="inline-flex items-center border border-orange-300 hover:border-white bg-orange-700/40 hover:bg-orange-700/60 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200"
              >
                <User className="w-3 h-3 mr-1" />
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            {status === "loading" ? (
              <div className="w-5 h-5 bg-orange-500/50 rounded animate-pulse"></div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-orange-100 hover:text-white transition-colors p-1"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-orange-700/40 bg-orange-700 py-3">
            <div className="space-y-1">
              <Link
                href="https://sdnthailand.com/"
                className="flex items-center px-3 py-2 text-xs text-orange-100 hover:bg-orange-600/60 hover:text-white rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-3 h-3 mr-2" />
                Home
              </Link>

              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-xs text-orange-100 hover:bg-orange-600/60 hover:text-white rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="w-3 h-3 mr-2" />
                  Dashboard
                </Link>
              )}

              <div className="px-3 py-2 mt-2">
                <p className="text-[10px] font-medium text-orange-300 uppercase tracking-wider">Form Return</p>
              </div>
              {formReturnMenuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center px-5 py-2 text-xs text-orange-100 hover:bg-orange-600/60 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="mr-2">{item.icon}</div>
                  {item.label}
                </Link>
              ))}

              {session && session.user ? (
                <>
                  <div className="px-3 py-2 mt-3">
                    <p className="text-[10px] font-medium text-orange-300 uppercase tracking-wider">บัญชีผู้ใช้</p>
                  </div>
                  <div className="flex items-center px-3 py-2 bg-orange-600/40 rounded-lg mx-3">
                    <img
                      src={session.user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                      alt="User profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-300"
                    />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-white">{session.user.firstName}</p>
                      <p className="text-[10px] text-orange-200 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-5 py-2 text-xs text-orange-100 hover:bg-orange-600/60 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-3 h-3 mr-2" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => { signOut({ callbackUrl: "/" }); setIsMenuOpen(false); }}
                    className="flex items-center w-full px-5 py-2 text-xs text-red-300 hover:bg-orange-600/60 hover:text-red-200 transition-colors"
                  >
                    <LogOut className="w-3 h-3 mr-2" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { router.push("/auth/signin"); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-orange-100 hover:bg-orange-600/60 hover:text-white transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}