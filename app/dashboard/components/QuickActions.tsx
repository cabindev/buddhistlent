import Link from 'next/link';
import { ArrowUpRight, Database, BarChart3, Wine, Building2, Table, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  isAdmin: boolean;
}

interface Action {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAdmin?: boolean;
}

interface Group {
  label: string;
  sub: string;
  accent: string;       // text + icon color
  ring: string;         // hover border color
  iconBg: string;       // icon circle bg
  actions: Action[];
}

export default function QuickActions({ isAdmin }: QuickActionsProps) {
  const groups: Group[] = [
    {
      label: 'องค์กร / หน่วยงาน',
      sub: 'เมนูหลักปีนี้',
      accent: 'text-amber-600',
      ring: 'hover:border-amber-300',
      iconBg: 'bg-amber-50',
      actions: [
        { title: 'ลงทะเบียนหน่วยงาน', description: 'เพิ่มองค์กรที่ร่วมงดเหล้าเข้าพรรษา', href: '/dashboard/organization/create', icon: Building2 },
        { title: 'ข้อมูลองค์กร ร่วมเข้าพรรษา', description: 'จัดการข้อมูลองค์กรที่ส่งคืน', href: '/dashboard/organization/tables', icon: Table, requireAdmin: true },
        { title: 'แดชบอร์ดองค์กร', description: 'สถิติและรายงานองค์กร', href: '/dashboard/organization', icon: BarChart3, requireAdmin: true },
      ],
    },
    {
      label: 'Sober Cheers',
      sub: 'ผู้ลงทะเบียนงดเหล้า',
      accent: 'text-green-600',
      ring: 'hover:border-green-300',
      iconBg: 'bg-green-50',
      actions: [
        { title: 'เพิ่มข้อมูล SoberCheers', description: 'ลงทะเบียนงดเหล้าใหม่', href: '/soberCheers/create', icon: UserPlus },
        { title: 'ข้อมูลผู้เข้าร่วม', description: 'จัดการข้อมูลผู้งดเหล้า', href: '/dashboard/soberCheers/components/soberTable', icon: Database, requireAdmin: true },
        { title: 'แดชบอร์ด SoberCheers', description: 'สถิติและรายงาน', href: '/dashboard/soberCheers', icon: BarChart3, requireAdmin: true },
      ],
    },
  ];

  return (
    <div className="space-y-7">
      {groups.map((group) => {
        const actions = group.actions.filter(a => !a.requireAdmin || isAdmin);
        if (actions.length === 0) return null;

        return (
          <div key={group.label}>
            <div className="flex items-baseline gap-2 mb-3 px-1">
              <h2 className="text-sm font-semibold text-gray-800">{group.label}</h2>
              <span className="text-xs text-gray-400">· {group.sub}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group relative bg-white rounded-2xl border border-gray-100 p-5 transition-all hover:shadow-md ${group.ring} active:scale-[0.99]`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${group.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${group.accent}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{action.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
