// ClientCount.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBuilding } from 'react-icons/fa';

const ClientCount: React.FC = () => {
  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientsCount = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/form_return?count=true');
        setClientsCount(res.data.totalForms);
      } catch (error) {
        console.error('Error fetching clients count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientsCount();
  }, []);

  return (
    <div className="p-5">
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl shadow-lg border border-amber-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FaBuilding className="text-white text-2xl" />
            </div>
            <div className="text-amber-700 font-medium text-lg mb-2">
              องค์กร: คืนข้อมูลเข้าพรรษา
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
              ) : (
                `${clientsCount?.toLocaleString() || 0} หน่วยงาน`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCount;