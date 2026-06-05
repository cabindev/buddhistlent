'use client';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, User, LogOut, Menu, BarChart3, ClipboardList, ChevronDown, X, Plus } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormReturnMenuOpen, setIsFormReturnMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-menu')) {
        setIsFormReturnMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isAdmin = session?.user?.role === 'admin';
  if (pathname?.startsWith('/dashboard') || pathname === '/profile') return null;

  const formReturnItems = [
    { key: 'view',   label: 'คืนข้อมูลงดเหล้าเข้าพรรษา', desc: 'รายการคืนข้อมูล',       href: '/form_return',        icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { key: 'create', label: 'เพิ่มข้อมูลงดเหล้าเข้าพรรษา', desc: 'สร้างฟอร์มคืนข้อมูลใหม่', href: '/form_return/create', icon: <Plus className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="relative z-50 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex justify-between h-14">

          {/* Brand */}
          <div className="flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-gray-900 tracking-wide">Buddhist Lent</Link>
            <div className="hidden md:block w-px h-4 bg-gray-200" />
            <Link href="https://sdnthailand.com/" className="hidden md:flex items-center text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Home
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex sm:items-center sm:gap-5">
            {status === 'loading' ? (
              <div className="w-16 h-4 rounded bg-gray-100 animate-pulse" />
            ) : (
              <>
                {isAdmin && (
                  <Link href="/dashboard" className="flex items-center text-xs text-gray-400 hover:text-gray-700 transition-colors gap-1">
                    <BarChart3 className="w-3 h-3" />Dashboard
                  </Link>
                )}
                <div className="relative dropdown-menu">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsFormReturnMenuOpen(!isFormReturnMenuOpen); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <ClipboardList className="w-3 h-3" />คืนข้อมูล<ChevronDown className="w-3 h-3" />
                  </button>
                  {isFormReturnMenuOpen && (
                    <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
                      {formReturnItems.map((item) => (
                        <Link key={item.key} href={item.href} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setIsFormReturnMenuOpen(false)}>
                          <span className="text-gray-400 mt-0.5">{item.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{item.label}</p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : session?.user ? (
              <div className="relative dropdown-menu">
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); setIsFormReturnMenuOpen(false); }}>
                  <img src={session.user.image || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'} alt="profile" className="w-8 h-8 rounded-full object-cover border border-gray-200 hover:border-gray-400 transition-colors" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-800">{session.user.firstName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <Link href="https://sdnthailand.com/" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                      <Home className="w-3.5 h-3.5 text-gray-400" />Home
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                      <User className="w-3.5 h-3.5 text-gray-400" />Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button type="button" onClick={() => { signOut({ callbackUrl: '/' }); setIsUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => router.push('/auth/signin')} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-md hover:border-gray-400 hover:text-gray-700 transition-colors">
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex items-center">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 space-y-0.5">
            <Link href="https://sdnthailand.com/" className="flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              <Home className="w-3.5 h-3.5 text-gray-400" />Home
            </Link>
            {isAdmin && (
              <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                <BarChart3 className="w-3.5 h-3.5 text-gray-400" />Dashboard
              </Link>
            )}
            <p className="px-2 pt-3 pb-1 text-[10px] text-gray-300 tracking-widest uppercase">Form Return</p>
            {formReturnItems.map((item) => (
              <Link key={item.key} href={item.href} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <span className="text-gray-400">{item.icon}</span>{item.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <p className="px-2 pt-3 pb-1 text-[10px] text-gray-300 tracking-widest uppercase">Account</p>
                <div className="flex items-center gap-3 px-2 py-2">
                  <img src={session.user.image || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{session.user.firstName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />Sign out
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { router.push('/auth/signin'); setIsMenuOpen(false); }} className="w-full text-left px-2 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
