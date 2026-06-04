'use client';

import React, { useState, useEffect } from 'react';
import { getTotalCount } from '@/app/dashboard/soberCheers/actions/GetChartData';

interface TotalCountProps {
  updateTrigger: number;
}

export function TotalCount({ updateTrigger }: TotalCountProps) {
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
  
    const fetchTotalCount = async () => {
      setIsUpdating(true);
      try {
        const result = await getTotalCount();
        if (result.success && result.data !== undefined) setTotalCount(result.data);
      } catch (error) {
        console.error('Failed to fetch total count:', error);
      } finally {
        setIsUpdating(false);
      }
    };
  
    useEffect(() => {
      fetchTotalCount();
    }, [updateTrigger]);
  
    return (
      <span className={`badge badge-neutral badge-lg font-semibold text-sm ${isUpdating ? 'animate-pulse' : ''}`}>
        {totalCount !== null ? `${totalCount.toLocaleString()} คน` : 'กำลังโหลด...'}
      </span>
    );
  }