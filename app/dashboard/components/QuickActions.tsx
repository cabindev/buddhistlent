import Link from 'next/link';
import { PlusCircle, Database, BarChart3, Wine, Building2, Table } from 'lucide-react';

interface QuickActionsProps {
  isAdmin: boolean;
}

export default function QuickActions({ isAdmin }: QuickActionsProps) {
  const actions = [
    // Organization Actions (เมนูหลักปีนี้)
    {
      title: 'ลงทะเบียนหน่วยงาน',
      description: 'เพิ่มองค์กรที่ร่วมงดเหล้าเข้าพรรษา',
      href: '/dashboard/organization/create',
      icon: Building2,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      requireAdmin: false,
    },
    ...(isAdmin ? [{
      title: 'ข้อมูลองค์กร ร่วมเข้าพรรษา',
      description: 'จัดการข้อมูลองค์กรที่ส่งคืน',
      href: '/dashboard/organization/tables',
      icon: Table,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      requireAdmin: true,
    }] : []),
    ...(isAdmin ? [{
      title: 'แดชบอร์ดองค์กร',
      description: 'สถิติและรายงานองค์กร',
      href: '/dashboard/organization',
      icon: BarChart3,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      requireAdmin: true,
    }] : []),

    // SoberCheers Actions
    {
      title: 'เพิ่มข้อมูล SoberCheers',
      description: 'ลงทะเบียนงดเหล้าใหม่',
      href: '/soberCheers/create',
      icon: Wine,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      requireAdmin: false,
    },
    ...(isAdmin ? [{
      title: 'ข้อมูลงดเหล้าเข้าพรรษา',
      description: 'จัดการข้อมูลผู้งดเหล้า',
      href: '/dashboard/soberCheers/components/soberTable',
      icon: Database,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      requireAdmin: true,
    }] : []),
    ...(isAdmin ? [{
      title: 'แดชบอร์ด SoberCheers',
      description: 'สถิติและรายงาน',
      href: '/dashboard/soberCheers',
      icon: BarChart3,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      requireAdmin: true,
    }] : []),
  ];

  const filteredActions = actions.filter(action => !action.requireAdmin || isAdmin);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-gray-600" />
        การดำเนินการด่วน
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className={`group block p-4 rounded-lg border transition-all duration-200 ${action.bgColor} ${action.borderColor} ${action.hoverColor} hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded ${action.bgColor} border ${action.borderColor}`}>
                  <Icon className={`w-5 h-5 ${action.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${action.textColor} mb-1`}>{action.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
