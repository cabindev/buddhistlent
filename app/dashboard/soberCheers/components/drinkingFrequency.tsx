'use client';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getDrinkingFrequencyChartData } from '../actions/GetChartData';

interface DrinkingFrequencyData {
 name: string;
 value: number;
}

const DrinkingFrequencyChart: React.FC<{ year?: number }> = ({ year }) => {
 const [frequencyData, setFrequencyData] = useState<DrinkingFrequencyData[]>([]);
 const [totalCount, setTotalCount] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       const result = await getDrinkingFrequencyChartData(year);
       if (result.success && result.data) {
         // เรียงข้อมูลจากมากไปน้อย
         const sortedData = result.data.sort((a, b) => b.value - a.value);
         setFrequencyData(sortedData);
         setTotalCount(sortedData.reduce((sum, item) => sum + item.value, 0));
       }
     } catch (error) {
       console.error('Error fetching drinking frequency data:', error);
     } finally {
       setLoading(false);
     }
   };
   fetchData();
 }, []);

 const calculatePercentage = (count: number, total: number) => {
   if (total === 0) return '0.0';
   return ((count / total) * 100).toFixed(1);
 };

 if (loading) {
   return (
     <div className="h-96 flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
       <span className="ml-3 text-gray-600">กำลังโหลดข้อมูลความถี่การดื่ม...</span>
     </div>
   );
 }

 if (!frequencyData.length) {
   return (
     <div className="h-96 flex items-center justify-center">
       <div className="text-center text-gray-500">
         <div className="text-lg mb-2">📊</div>
         <div>ไม่พบข้อมูลความถี่การดื่ม</div>
       </div>
     </div>
   );
 }

 // เตรียมข้อมูลสำหรับ Pie Chart
 const chartData = frequencyData.map((item, index) => {
   const shortLabel = item.name.length > 25 ? `${item.name.substring(0, 22)}...` : item.name;
   return {
     name: shortLabel,
     fullName: item.name,
     value: item.value,
     percentage: calculatePercentage(item.value, totalCount)
   };
 });

 const option = {
   title: {
     text: 'ความถี่การดื่มแอลกอฮอล์',
     left: 'center',
     top: 20,
     textStyle: {
       fontSize: 16,
       fontWeight: 'bold',
       color: '#374151'
     }
   },
   tooltip: {
     trigger: 'item',
     formatter: (params: any) => {
       const percentage = calculatePercentage(params.value, totalCount);
       const fullName = chartData.find(item => item.name === params.name)?.fullName || params.name;
       
       return `
         <div style="max-width: 250px;">
           <strong>${fullName}</strong><br/>
           จำนวน: ${params.value.toLocaleString()} คน<br/>
           สัดส่วน: ${percentage}%
         </div>
       `;
     }
   },
   legend: {
     show: false
   },
   series: [
     {
       name: 'ความถี่การดื่ม',
       type: 'pie',
       radius: ['35%', '65%'],
       center: ['50%', '55%'],
       data: chartData.map(item => ({
         name: item.name,
         value: item.value
       })),
       emphasis: {
         itemStyle: {
           shadowBlur: 10,
           shadowOffsetX: 0,
           shadowColor: 'rgba(0, 0, 0, 0.5)'
         }
       },
       itemStyle: {
         borderRadius: 6,
         borderColor: '#fff',
         borderWidth: 2
       },
       label: {
         show: true,
         position: 'outside',
         formatter: (params: any) => {
           const percentage = calculatePercentage(params.value, totalCount);
           return `${params.name}\n${percentage}%`;
         },
         fontSize: 11,
         fontWeight: 'normal',
         color: '#374151',
         distanceToLabelLine: 10,
         alignTo: 'edge',
         margin: 20
       },
       labelLine: {
         show: true,
         length: 15,
         length2: 20,
         smooth: 0.2,
         lineStyle: {
           color: '#9CA3AF',
           width: 1
         }
       },
       avoidLabelOverlap: true,
       labelLayout: {
         hideOverlap: true
       }
     }
   ],
   color: ['#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b7280', '#4b5563']
 };

 return (
   <div className="bg-white">
     {/* Header Stats */}
     <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
       <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 สถิติความถี่การดื่มแอลกอฮอล์</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
         <div className="bg-white p-3 rounded-lg border border-orange-100">
           <div className="text-2xl font-bold text-orange-600">{totalCount.toLocaleString()}</div>
           <div className="text-sm text-gray-600">ผู้ตอบแบบสอบถาม</div>
         </div>
         <div className="bg-white p-3 rounded-lg border border-orange-100">
           <div className="text-2xl font-bold text-blue-600">{frequencyData.length}</div>
           <div className="text-sm text-gray-600">ระดับความถี่</div>
         </div>
         <div className="bg-white p-3 rounded-lg border border-orange-100">
           <div className="text-2xl font-bold text-green-600">
             {Math.round(totalCount / frequencyData.length).toLocaleString()}
           </div>
           <div className="text-sm text-gray-600">ค่าเฉลี่ย/ระดับ</div>
         </div>
       </div>
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
       {/* Chart - ขยายขนาดให้ใหญ่ขึ้น */}
       <div className="xl:col-span-2">
         <div className="bg-gray-50 rounded-lg p-4">
           <div className="h-96">
             <ReactECharts
               option={option}
               style={{ height: '100%', width: '100%' }}
             />
           </div>
         </div>
       </div>

       {/* Data Legend & Details */}
       <div className="xl:col-span-1 space-y-4">
         {/* Custom Legend */}
         <div className="bg-gray-50 rounded-lg p-4">
           <h4 className="text-sm font-semibold text-gray-700 mb-3">รายละเอียดข้อมูล</h4>
           <div className="space-y-2 max-h-80 overflow-y-auto">
             {frequencyData.map((item, index) => {
               const colors = ['#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b7280', '#4b5563'];
               const color = colors[index % colors.length];
               const percentage = calculatePercentage(item.value, totalCount);
               
               return (
                 <div key={item.name} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white transition-colors">
                   <div 
                     className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                     style={{ backgroundColor: color }}
                   ></div>
                   <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-gray-900 break-words leading-tight">
                       {item.name}
                     </div>
                     <div className="text-xs text-gray-600 mt-1">
                       {item.value.toLocaleString()} คน ({percentage}%)
                     </div>
                     {/* Progress bar */}
                     <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                       <div 
                         className="h-1.5 rounded-full transition-all duration-300"
                         style={{ 
                           width: `${percentage}%`,
                           backgroundColor: color
                         }}
                       ></div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Summary Stats */}
         <div className="bg-gray-50 rounded-lg p-4">
           <h4 className="text-sm font-semibold text-gray-700 mb-3">สรุปสถิติ</h4>
           <div className="space-y-3 text-sm">
             <div className="flex justify-between">
               <span className="text-gray-600">ประเภทความถี่:</span>
               <span className="font-medium">{frequencyData.length} ประเภท</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">ค่าเฉลี่ย/ประเภท:</span>
               <span className="font-medium">
                 {Math.round(totalCount / frequencyData.length).toLocaleString()} คน
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">ความถี่สูงสุด:</span>
               <span className="font-medium">
                 {frequencyData[0]?.value.toLocaleString() || 0} คน
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">ความถี่ต่ำสุด:</span>
               <span className="font-medium">
                 {frequencyData[frequencyData.length - 1]?.value.toLocaleString() || 0} คน
               </span>
             </div>
           </div>
         </div>

         {/* Top 3 Summary */}
         {frequencyData.length >= 3 && (
           <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
             <h4 className="text-sm font-semibold text-orange-800 mb-3">🏆 อันดับต้น 3</h4>
             <div className="space-y-2">
               {frequencyData.slice(0, 3).map((item, index) => {
                 const medals = ['🥇', '🥈', '🥉'];
                 const percentage = calculatePercentage(item.value, totalCount);
                 
                 return (
                   <div key={item.name} className="flex items-center justify-between bg-white p-2 rounded-lg">
                     <div className="flex items-center space-x-2">
                       <span>{medals[index]}</span>
                       <span className="text-sm text-gray-700 truncate max-w-32">
                         {item.name.length > 15 ? `${item.name.substring(0, 13)}...` : item.name}
                       </span>
                     </div>
                     <div className="text-right">
                       <div className="text-sm font-bold text-orange-700">
                         {item.value.toLocaleString()}
                       </div>
                       <div className="text-xs text-orange-600">
                         {percentage}%
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
             <div className="mt-3 pt-3 border-t border-orange-200 text-xs text-orange-700 text-center">
               รวม 3 อันดับแรก: {calculatePercentage(
                 frequencyData.slice(0, 3).reduce((sum, item) => sum + item.value, 0), 
                 totalCount
               )}% ของทั้งหมด
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default DrinkingFrequencyChart;