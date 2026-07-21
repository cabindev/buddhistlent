// TotalCount.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { getTotalCount } from '../actions/GetChartData';

const TotalCount: React.FC<{ year?: number }> = ({ year }) => {
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTotalRegistered = async () => {
    try {
      setLoading(true);
      const result = await getTotalCount(year);
      if (result.success && result.data !== undefined) setTotalRegistered(result.data);
    } catch (error) {
      console.error('Error fetching total registered:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalRegistered();
    const intervalId = setInterval(fetchTotalRegistered, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-5">
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-[oklch(97%_0.196_126.665)] to-[oklch(95%_0.196_126.665)] p-6 rounded-xl shadow-lg border border-[oklch(93%_0.196_126.665)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FaUser className="text-white text-2xl" />
            </div>
            <div className="text-[oklch(56%_0.196_126.665)] font-medium text-lg mb-2">
              จำนวนผู้ลงทะเบียน
            </div>
            <div className="text-xl font-medium text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
              ) : (
                totalRegistered.toLocaleString()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCount;