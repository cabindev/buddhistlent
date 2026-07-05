// app/dashboard/soberCheers/components/ProvinceMap.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { getProvincesWithData } from '../actions/GetChartData';
import dynamic from 'next/dynamic';

interface ProvinceData {
  province: string;
  count: number;
}

// Dynamic import สำหรับ Leaflet
const Map = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, GeoJSON } = mod;
    return function MapComponent({ 
      provinceData, 
      style, 
      onEachFeature,
      geoData 
    }: {
      provinceData: ProvinceData[];
      style: (feature: any) => any;
      onEachFeature: (feature: any, layer: any) => void;
      geoData: any;
    }) {
      return (
        <MapContainer 
          center={[13.7563, 100.5018]} 
          zoom={6} 
          className="w-full h-full rounded-lg"
          style={{ minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <GeoJSON
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      );
    };
  }),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    )
  }
);

const ProvinceMap: React.FC<{ year?: number; zone?: string }> = ({ year, zone }) => {
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [provinceResult, geoResponse] = await Promise.all([
          getProvincesWithData(year, zone),
          import('../../../data/thailand.json'),
        ]);

        if (provinceResult.success && provinceResult.data) {
          setProvinceData(provinceResult.data);
        }
        setGeoData(geoResponse.default);
} catch (e) {
       setError('ไม่สามารถโหลดข้อมูลแผนที่ได้');
       console.error('Error fetching data:', e);
     } finally {
       setIsLoading(false);
     }
   };

   fetchData();
 }, []);

 const getColor = (count: number) => {
   if (count === 0) return '#f3f4f6';
   if (count > 1000) return '#052e16';
   if (count > 500) return '#14532D';
   if (count > 200) return '#166534';
   if (count > 100) return '#15803D';
   if (count > 50) return '#16A34A';
   if (count > 20) return '#22C55E';
   return '#86EFAC';
 };

 const getColorIntensity = (count: number) => {
   const maxCount = Math.max(...provinceData.map(p => p.count));
   return Math.min(0.8, (count / maxCount) * 0.8 + 0.2);
 };

 const style = (feature: any) => {
   const provinceName = feature.properties.name_th;
   const provinceDataItem = provinceData.find(item => item.province === provinceName);
   const count = provinceDataItem ? provinceDataItem.count : 0;
   
   return {
     fillColor: getColor(count),
     weight: selectedProvince === provinceName ? 3 : 1,
     opacity: 1,
     color: selectedProvince === provinceName ? '#16A34A' : '#ffffff',
     dashArray: selectedProvince === provinceName ? '0' : '2',
     fillOpacity: getColorIntensity(count)
   };
 };

 const onEachFeature = (feature: any, layer: any) => {
   const provinceName = feature.properties.name_th;
   const provinceDataItem = provinceData.find(item => item.province === provinceName);
   const count = provinceDataItem ? provinceDataItem.count : 0;
   
   layer.bindTooltip(
     `<div class="text-center p-2">
       <div class="font-medium text-green-700">${provinceName}</div>
       <div class="text-lg font-medium">${count.toLocaleString()} คน</div>
       <div class="text-xs text-gray-600">ผู้ลงทะเบียน</div>
     </div>`,
     { 
       permanent: false, 
       direction: 'center',
       className: 'custom-tooltip'
     }
   );

   layer.on({
     mouseover: () => {
       setSelectedProvince(provinceName);
       layer.setStyle({
         weight: 3,
         color: '#16A34A',
         dashArray: '0',
         fillOpacity: 0.9
       });
     },
     mouseout: () => {
       setSelectedProvince(null);
       layer.setStyle({
         weight: 1,
         color: '#ffffff',
         dashArray: '2',
         fillOpacity: getColorIntensity(count)
       });
     }
   });
 };

 const sortedProvinces = [...provinceData]
   .sort((a, b) => b.count - a.count)
   .slice(0, 10);

 if (isLoading) {
   return (
     <div className="bg-white rounded-lg shadow-sm p-6">
       <div className="animate-pulse">
         <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
         <div className="h-96 bg-gray-200 rounded"></div>
       </div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="bg-white rounded-lg shadow-sm p-6">
       <div className="text-center text-red-500 py-8">
         <p>{error}</p>
         <button 
           onClick={() => window.location.reload()}
           className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
         >
           ลองใหม่
         </button>
       </div>
     </div>
   );
 }

 return (
   <div className="bg-white rounded-lg shadow-sm overflow-hidden">
     <div className="p-4 border-b border-gray-200">
       <div className="flex items-center justify-between">
         <div>
           <h3 className="text-lg font-medium text-gray-900">
             แผนที่การกระจายตามจังหวัด
           </h3>
           <p className="text-sm text-gray-600">
             การแสดงผลข้อมูลบนแผนที่ประเทศไทย
           </p>
         </div>
         <div className="text-right">
           <div className="text-sm font-medium text-green-600">
             {provinceData.reduce((sum, p) => sum + p.count, 0).toLocaleString()}
           </div>
           <div className="text-xs text-gray-600">ผู้ลงทะเบียนทั้งหมด</div>
         </div>
       </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
       {/* Map */}
       <div className="lg:col-span-3">
         <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden border border-gray-200">
           <Map 
             provinceData={provinceData} 
             style={style} 
             onEachFeature={onEachFeature}
             geoData={geoData}
           />
         </div>
         
         {/* Legend */}
         <div className="mt-4 p-3 bg-gray-50 rounded-lg">
           <h4 className="text-sm font-medium text-gray-700 mb-2">สีแสดงจำนวนผู้ลงทะเบียน</h4>
           <div className="flex flex-wrap items-center gap-4 text-xs">
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#f3f4f6' }}></div>
               <span>0 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#86EFAC' }}></div>
               <span>1-20 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#22C55E' }}></div>
               <span>21-50 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#16A34A' }}></div>
               <span>51-100 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#15803D' }}></div>
               <span>101-200 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#166534' }}></div>
               <span>201-500 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#14532D' }}></div>
               <span>501-1000 คน</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#052e16' }}></div>
               <span>1000+ คน</span>
             </div>
           </div>
         </div>
       </div>

       {/* Top 10 Provinces */}
       <div className="lg:col-span-1">
         <div className="bg-gray-50 rounded-lg p-4">
           <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
             Top 10 จังหวัด
           </h4>
           <div className="space-y-2">
             {sortedProvinces.map((province, index) => {
               const isSelected = selectedProvince === province.province;
               return (
                 <div
                   key={province.province}
                   className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                     isSelected ? 'bg-green-50 border border-green-200' : 'bg-white hover:bg-gray-100'
                   }`}
                 >
                   <div className="flex items-center">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                       index === 0 ? 'bg-green-600 text-white' :
                       index === 1 ? 'bg-green-400 text-white' :
                       index === 2 ? 'bg-green-200 text-black' :
                       'bg-green-50 text-green-700'
                     }`}>
                       {index + 1}
                     </div>
                     <div>
                       <div className={`text-sm font-medium ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                         {province.province}
                       </div>
                       <div className="text-xs text-gray-600">
                         {province.count.toLocaleString()} คน
                       </div>
                     </div>
                   </div>
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(province.count) }}></div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Summary Stats */}
         <div className="mt-4 space-y-3">
           <div className="bg-white p-3 rounded-lg border border-gray-200">
             <div className="text-sm text-gray-600">จังหวัดที่มีผู้ลงทะเบียน</div>
             <div className="text-base font-medium text-gray-900">
               {provinceData.filter(p => p.count > 0).length}
             </div>
             <div className="text-xs text-gray-500">จาก {provinceData.length} จังหวัด</div>
           </div>
           
           <div className="bg-white p-3 rounded-lg border border-gray-200">
             <div className="text-sm text-gray-600">ค่าเฉลี่ยต่อจังหวัด</div>
             <div className="text-base font-medium text-gray-900">
               {Math.round(provinceData.reduce((sum, p) => sum + p.count, 0) / provinceData.length).toLocaleString()}
             </div>
             <div className="text-xs text-gray-500">คน/จังหวัด</div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default ProvinceMap;