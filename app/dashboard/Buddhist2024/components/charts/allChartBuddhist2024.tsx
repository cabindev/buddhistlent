// app/dashboard/Buddhist2024/components/charts/allChartBuddhist2024.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { getDashboardSummary2024 } from '../../actions/GetChartData';
import DashboardLoading from '../ui/DashboardLoading';
import GenderChart from './genderChart';
import ProvinceChart from './provinceChart';
import MotivationChart from './motivationChart';
import AgeGroupChart from './ageGroupChart';

interface CountCardProps {
  title: string;
  count: string;
  unit: string;
  color: string;
}

const CountCard: React.FC<CountCardProps> = ({ 
  title, 
  count, 
  unit, 
  color
}) => (
  <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:shadow-lg transition-all hover:shadow-emerald-100/50">
    <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">
      {title}
    </div>
    <div className="text-2xl font-semibold text-emerald-800 mb-1">
      {count}
    </div>
    <div className="text-xs text-emerald-700">
      {unit}
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  className = '', 
  description
}) => (
  <div className={`bg-white rounded-lg border border-emerald-100 hover:shadow-lg transition-all hover:shadow-emerald-100/50 ${className}`}>
    <div className="p-4 border-b border-emerald-50">
      <h3 className="text-sm font-medium text-emerald-800">{title}</h3>
      {description && (
        <p className="text-xs text-emerald-600 mt-1">{description}</p>
      )}
    </div>
    <div className="p-0">
      {children}
    </div>
  </div>
);

const DashboardBuddhist2024: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const result = await getDashboardSummary2024();
        if (result.success && result.data) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading || !dashboardData) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-emerald-800 mb-2">
              Buddhist Lent 2024 Dashboard
            </h1>
            <p className="text-sm text-emerald-600">
              แดชบอร์ดติดตามและวิเคราะห์ข้อมูลผู้เข้าร่วมกิจกรรมเข้าพรรษา พ.ศ. 2567 | Dashboard for tracking and analyzing Buddhist Lent activity participants 2024
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <CountCard
              title="ผู้ลงทะเบียนทั้งหมด | Total Registrations"
              count={`${dashboardData.totalParticipants.toLocaleString()}`}
              unit="คน | People"
              color="blue"
            />
            <CountCard
              title="จังหวัดที่เข้าร่วม | Participating Provinces"
              count={`${dashboardData.totalProvinces}`}
              unit="จังหวัด | Provinces"
              color="green"
            />
            <CountCard
              title="หมวดหมู่กลุ่ม | Group Categories"
              count={`${dashboardData.totalGroupCategories}`}
              unit="ประเภท | Types"
              color="purple"
            />
            <CountCard
              title="อายุเฉลี่ย | Average Age"
              count={`${dashboardData.avgAge}`}
              unit="ปี | Years"
              color="orange"
            />
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ChartCard
              title="การกระจายตามจังหวัด | Provincial Distribution"
              description="แสดงการกระจายผู้เข้าร่วมตามจังหวัดต่างๆ | Distribution of participants by provinces"
            >
              <ProvinceChart />
            </ChartCard>
            
            
            <ChartCard 
              title="การแบ่งตามเพศ | Gender Distribution"
              description="สัดส่วนผู้เข้าร่วมแยกตามเพศ | Participant ratio by gender"
            >
              <GenderChart />
            </ChartCard>
          </div>

          {/* Age and Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            <ChartCard 
              title="กลุ่มอายุผู้เข้าร่วม | Age Groups"
              description="การแบ่งกลุ่มตามช่วงอายุของผู้เข้าร่วมกิจกรรม | Age distribution of participants"
            >
              <AgeGroupChart />
            </ChartCard>
          </div>

          {/* Footer */}
          <div className="text-center py-6 border-t border-emerald-200 bg-white rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium text-emerald-700">
                Buddhist Lent 2024 Dashboard
              </p>
              <p className="text-xs text-emerald-600">
                พัฒนาเพื่อติดตามกิจกรรมเข้าพรรษา ประจำปี พ.ศ. 2567 | Developed for Buddhist Lent Activity Tracking 2024
              </p>
              <p className="text-xs text-emerald-500">
                ข้อมูลอัพเดทล่าสุด | Last Updated: {new Date().toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBuddhist2024;