// components/form-return/TambonSearch.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RegionData } from '@/types/form-return';
import { data as regionsData } from '@/app/data/regions';

interface TambonSearchProps {
  onSelectLocation: (location: RegionData) => void;
  initialLocation?: RegionData;
  className?: string;
}

export default function TambonSearch({
  onSelectLocation,
  initialLocation,
  className = '',
}: TambonSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<RegionData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<RegionData | null>(
    initialLocation || null
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      try {
        const query = searchQuery.toLowerCase();
        
        // ✅ ตรวจสอบว่า regionsData เป็น array และมีข้อมูล
        if (!Array.isArray(regionsData)) {
          console.error('regionsData is not an array:', regionsData);
          setResults([]);
          setIsDropdownOpen(false);
          setIsLoading(false);
          return;
        }

        const filteredData = regionsData.filter((item) => {
          // ✅ เพิ่มการตรวจสอบว่า item มีข้อมูลครบถ้วน
          if (!item || typeof item !== 'object') return false;
          
          const district = item.district?.toLowerCase() || '';
          const amphoe = item.amphoe?.toLowerCase() || '';
          const province = item.province?.toLowerCase() || '';
          
          return district.includes(query) ||
                 amphoe.includes(query) ||
                 province.includes(query);
        });

        // ✅ ตรวจสอบก่อนใช้ slice
        const safeResults = Array.isArray(filteredData) ? filteredData.slice(0, 10) : [];
        setResults(safeResults);
        setIsDropdownOpen(safeResults.length > 0);
        
      } catch (error) {
        console.error('Error filtering data:', error);
        setResults([]);
        setIsDropdownOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [searchQuery]);

  const handleSelectLocation = useCallback(
    (location: RegionData) => {
      setSelectedLocation(location);
      setSearchQuery('');
      setIsDropdownOpen(false);
      
      // ✅ แปลง zipcode เป็น string ก่อนส่งไปยัง parent component
      const locationForForm = {
        ...location,
        zipcode: location.zipcode.toString() // แปลง number เป็น string
      };
      
      onSelectLocation(locationForForm as any); // cast เพื่อให้ type match
    },
    [onSelectLocation]
  );

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery('');
  };

  const handleInputFocus = () => {
    if (searchQuery && results.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tambon-search-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative tambon-search-container ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          placeholder="ค้นหาตำบล อำเภอ หรือจังหวัด..."
          value={searchQuery}
          onChange={(e) => {
            if (selectedLocation) setSelectedLocation(null);
            setSearchQuery(e.target.value);
          }}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-10 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            ตำบล{selectedLocation.district} อำเภอ{selectedLocation.amphoe} จังหวัด{selectedLocation.province}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">รหัสไปรษณีย์ {selectedLocation.zipcode} · {selectedLocation.type}</p>
        </div>
      )}

      {/* Dropdown Results */}
      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto border border-slate-200">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((item, index) => (
                <li
                  key={`${item.district_code}-${item.amphoe_code}-${item.province_code}-${index}`}
                  onClick={() => handleSelectLocation(item)}
                  className="cursor-pointer hover:bg-yellow-50 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start">
                    <svg className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        ตำบล{item.district} อำเภอ{item.amphoe}
                      </p>
                      <p className="text-xs text-slate-600">
                        จังหวัด{item.province} {item.zipcode} ({item.type})
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <svg className="h-8 w-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-slate-500">ไม่พบผลลัพธ์</p>
              <p className="text-xs text-slate-400 mt-1">ลองค้นหาด้วยคำอื่น</p>
            </div>
          )}
        </div>
      )}

      {!selectedLocation && (
        <p className="mt-2 text-xs text-slate-400">กรุณาค้นหาและเลือกตำบลที่ต้องการ</p>
      )}
    </div>
  );
}