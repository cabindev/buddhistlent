"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface CampaignBuddhistLent {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  phone: string;
  job: string;
  alcoholConsumption: string;
  drinkingFrequency: string;
  intentPeriod: string;
  monthlyExpense: number;
  motivation: string[];
  healthImpact: string;
}

export default function ListCampaignBuddhistLent() {
  const [campaigns, setCampaigns] = useState<CampaignBuddhistLent[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, [search, sort, page, rowsPerPage]);

  const fetchCampaigns = async () => {
    try {
      const query = new URLSearchParams({ 
        search, 
        sort, 
        page: page.toString(), 
        limit: rowsPerPage.toString() 
      }).toString();
      const res = await axios.get(`/api/campaign-buddhist-lent?${query}`);
      const data = res.data;

      if (data && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
        setTotalItems(data.totalItems);
      } else {
        console.error('Invalid campaigns data:', data);
        setCampaigns([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      setCampaigns([]);
      setTotalItems(0);
    }
  };

  const deleteCampaign = async (id: number) => {
    try {
      await axios.delete(`/api/campaign-buddhist-lent/${id}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete the campaign', error);
    }
  };

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="hero bg-gradient-to-r from-amber-500 to-amber-700 text-white py-10 mb-8 rounded-lg shadow-lg relative overflow-hidden">
        <div className="relative z-10 hero-content text-center">
          <h1 className="text-4xl font-bold drop-shadow-lg">
            กิจกรรม : 'งดเหล้าเข้าพรรษา เปลี่ยนคุณเป็นคนใหม่ใน 90 วัน'
          </h1>
          <p className="mt-4 text-lg">
          'ฤดูกาลสุขปลอดเหล้า งดเหล้าเข้าพรรษา'
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="ค้นหาตามชื่อ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
        />
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-amber-200">
          <thead className="bg-amber-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">ชื่อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">วันเกิด</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">ที่อยู่</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">เบอร์โทร</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">งาน</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-amber-100">
            {campaigns.map((campaign, index) => (
              <tr key={campaign.id} className="hover:bg-amber-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.firstName} {campaign.lastName}
                    </div>
                    {index === 0 && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                        ล่าสุด
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{new Date(campaign.birthday).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-500">{campaign.addressLine1}, {campaign.district}, {campaign.amphoe}, {campaign.province}, {campaign.zipcode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{campaign.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{campaign.job}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/form_campaign_buddhist_lent/edit/${campaign.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    แก้ไข
                  </Link>
                  {/* <button onClick={() => deleteCampaign(campaign.id)} className="text-red-600 hover:text-red-900">
                    ลบ
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {campaigns.map((campaign, index) => (
          <div key={campaign.id} className="bg-white shadow-md rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-amber-700">
                {campaign.firstName} {campaign.lastName}
              </div>
              {index === 0 && (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                  ล่าสุด
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <p>วันเกิด: {new Date(campaign.birthday).toLocaleDateString()}</p>
              <p>ที่อยู่: {campaign.addressLine1}, {campaign.district}, {campaign.amphoe}, {campaign.province}, {campaign.zipcode}</p>
              <p>เบอร์โทร: {campaign.phone}</p>
              <p>งาน: {campaign.job}</p>
            </div>
            <div className="mt-4 flex space-x-4">
              <Link href={`/form_campaign_buddhist_lent/edit/${campaign.id}`} className="text-indigo-600 hover:text-indigo-900">
                แก้ไข
              </Link>
              {/* <button onClick={() => deleteCampaign(campaign.id)} className="text-red-600 hover:text-red-900">
                ลบ
              </button> */}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            className="mx-2 px-2 py-1 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">รายการต่อหน้า</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            {page * rowsPerPage - rowsPerPage + 1}-{Math.min(page * rowsPerPage, totalItems)} จาก {totalItems}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* <Link
        href="/form_campaign_buddhist_lent/create"
        className="mt-8 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
      >
        สร้างแคมเปญใหม่
      </Link> */}
    </div>
  );
}