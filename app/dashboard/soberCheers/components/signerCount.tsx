// SignerCount.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';

const SignerCount: React.FC = () => {
  const [sumSigners, setSumSigners] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSumSigners = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/form_return?sumSigners=true');
        setSumSigners(res.data.sumSigners);
      } catch (error) {
        console.error('Error fetching sum of signers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSumSigners();
  }, []);

  return (
    <div className="p-5">
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-purple-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="text-purple-700 font-medium text-lg mb-2">
              ยอดรวมคนเข้าร่วม: คืนข้อมูลเข้าพรรษา
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
              ) : (
                `${sumSigners?.toLocaleString() || 0} คน`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignerCount;