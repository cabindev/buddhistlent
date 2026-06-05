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
    <nav className="relative z-50 border-b" style={{ background: '#0f0e0c', borderColor: '#2a2620' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">

          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-sm font-semibold" style={{ color: '#f0ead8' }}>Buddhist Lent</span>
            </Link>
            <div className="hidden md:block w-px h-4" style={{ background: '#2a2620' }} />
            <Link href="https://sdnthailand.com/" className="hidden md:flex items-center text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }}>
              Home
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:gap-5">
            {status === "loading" ? (
              <div className="w-16 h-5 rounded animate-pulse" style={{ background: '#2a2620' }} />
            ) : (
              <>
                {isAdmin && (
                  <Link href="/dashboard" className="flex items-center text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }}>
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Dashboard
                  </Link>
                )}

                <div className="relative dropdown-menu">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsFormReturnMenuOpen(!isFormReturnMenuOpen); setIsUserMenuOpen(false); }}
                    className="flex items-center text-xs transition-opacity hover:opacity-60"
                    style={{ color: '#6b6457' }}
                  >
                    <ClipboardList className="w-3 h-3 mr-1" />
                    คืนข้อมูล
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>

                  {isFormReturnMenuOpen && (
                    <div className="absolute left-0 mt-2 w-60 rounded-xl shadow-2xl border py-2 z-50" style={{ background: '#1a1814', borderColor: '#2a2620' }}>
                      {formReturnMenuItems.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="flex items-start px-3 py-2.5 text-xs transition-opacity hover:opacity-60"
                          style={{ color: '#f0ead8' }}
                          onClick={() => setIsFormReturnMenuOpen(false)}
                        >
                          <div className="mr-2 mt-0.5" style={{ color: '#c8893a' }}>{item.icon}</div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: '#6b6457' }}>{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: '#2a2620' }} />
            ) : session && session.user ? (
              <div className="relative dropdown-menu">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); setIsFormReturnMenuOpen(false); }}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={session.user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                    alt="User profile"
                    className="w-8 h-8 rounded-full object-cover border transition-opacity hover:opacity-70"
                    style={{ borderColor: '#2a2620' }}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border py-2 z-50" style={{ background: '#1a1814', borderColor: '#2a2620' }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: '#2a2620' }}>
                      <p className="text-xs font-medium" style={{ color: '#f0ead8' }}>{session.user.firstName}</p>
                      <p className="text-[10px] truncate" style={{ color: '#6b6457' }}>{session.user.email}</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link key={item.key} href={item.href} className="flex items-center px-3 py-2 text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }} onClick={() => setIsUserMenuOpen(false)}>
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: '#2a2620' }}>
                      <button
                        type="button"
                        onClick={() => { signOut({ callbackUrl: "/" }); setIsUserMenuOpen(false); }}
                        className="flex items-center w-full px-3 py-2 text-xs text-red-500 transition-opacity hover:opacity-60"
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
                className="text-xs px-3 py-1.5 rounded-md border transition-opacity hover:opacity-70"
                style={{ color: '#f0ead8', borderColor: '#2a2620' }}
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Mobile button */}
          <div className="sm:hidden flex items-center">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 transition-opacity hover:opacity-60" style={{ color: '#6b6457' }}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t py-3 space-y-1" style={{ borderColor: '#2a2620' }}>
            <Link href="https://sdnthailand.com/" className="flex items-center px-3 py-2 text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }} onClick={() => setIsMenuOpen(false)}>
              <Home className="w-3 h-3 mr-2" />Home
            </Link>
            {isAdmin && (
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }} onClick={() => setIsMenuOpen(false)}>
                <BarChart3 className="w-3 h-3 mr-2" />Dashboard
              </Link>
            )}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: '#3a3530' }}>Form Return</p>
            </div>
            {formReturnMenuItems.map((item) => (
              <Link key={item.key} href={item.href} className="flex items-center px-5 py-2 text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }} onClick={() => setIsMenuOpen(false)}>
                <div className="mr-2" style={{ color: '#c8893a' }}>{item.icon}</div>
                {item.label}
              </Link>
            ))}
            {session && session.user ? (
              <>
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: '#3a3530' }}>บัญชีผู้ใช้</p>
                </div>
                <div className="flex items-center px-3 py-2 mx-3 rounded-lg" style={{ background: '#1a1814' }}>
                  <img src={session.user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="ml-2">
                    <p className="text-xs font-medium" style={{ color: '#f0ead8' }}>{session.user.firstName}</p>
                    <p className="text-[10px] truncate" style={{ color: '#6b6457' }}>{session.user.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { signOut({ callbackUrl: "/" }); setIsMenuOpen(false); }} className="flex items-center w-full px-5 py-2 text-xs text-red-500 transition-opacity hover:opacity-60">
                  <LogOut className="w-3 h-3 mr-2" />Sign out
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { router.push("/auth/signin"); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs transition-opacity hover:opacity-60" style={{ color: '#6b6457' }}>
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}