'use client';

import React, { useState, useEffect } from 'react';
import { data } from '@/app/data/regions';
import { getSoberCheersById } from '@/app/soberCheers/actions/Get';
import { updateSoberCheers } from '@/app/soberCheers/actions/Update';

interface EditSoberCheersModalProps {
  soberCheerId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface SoberCheersFormData {
  firstName: string;
  lastName: string;
  birthday: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
}

export default function EditSoberCheersModal({ soberCheerId, isOpen, onClose, onUpdate }: EditSoberCheersModalProps) {
  const [formData, setFormData] = useState<SoberCheersFormData>({
    firstName: '',
    lastName: '',
    birthday: '',
    addressLine1: '',
    district: '',
    amphoe: '',
    province: '',
    zipcode: '',
    type: '',
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSoberCheersData();
    }
  }, [isOpen, soberCheerId]);

  const fetchSoberCheersData = async () => {
    try {
      const result = await getSoberCheersById(soberCheerId);
      if (result.success && result.data) {
        setFormData({
          ...result.data,
          birthday: new Date(result.data.birthday).toISOString().split('T')[0],
        });
      } else {
        setError('ไม่พบข้อมูล');
      }
    } catch (error) {
      console.error('Failed to fetch SoberCheers data', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, district: value }));
    setAutoFilledFields([]);
  
    if (value.length > 0) {
      const filteredSuggestions = data
        .filter((region) => region.district.toLowerCase().startsWith(value.toLowerCase()));
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      district: suggestion.district,
      amphoe: suggestion.amphoe,
      province: suggestion.province,
      zipcode: suggestion.zipcode.toString(),
      type: suggestion.type,
    }));
    setAutoFilledFields(['amphoe', 'province', 'zipcode', 'type']);
    setSuggestions([]);
  };

  const calculateAge = (birthday: string): number => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await updateSoberCheers(soberCheerId, formData);
      if (result.success) {
        onUpdate();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Error occurred:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-amber-600">
          แก้ไขข้อมูล SOBER CHEERs
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">ชื่อ</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">สกุล</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">วันเกิด</label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">อายุ: {calculateAge(formData.birthday)} ปี</p>
          </div>

          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">ที่อยู่</label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">ตำบล/แขวง</label>
            <input
              id="district"
              name="district"
              type="text"
              value={formData.district}
              onChange={handleDistrictChange}
              required
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            />
            {suggestions.length > 0 && (
              <ul className="border border-gray-300 mt-1 max-h-40 overflow-auto rounded-md">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer p-2 hover:bg-amber-100 text-sm"
                  >
                    {suggestion.district} - {suggestion.amphoe}, {suggestion.province}, {suggestion.zipcode}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amphoe" className="block text-sm font-medium text-gray-700">อำเภอ/เขต</label>
              <input
                id="amphoe"
                name="amphoe"
                type="text"
                value={formData.amphoe}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-2 py-1 border rounded-md shadow-sm text-sm ${
                  autoFilledFields.includes('amphoe') ? 'bg-green-100 border-green-50' : 'border-gray-300'
                }`}
                
              />
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">จังหวัด</label>
              <input
                id="province"
                name="province"
                type="text"
                value={formData.province}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-2 py-1 border rounded-md shadow-sm text-sm ${
                  autoFilledFields.includes('province') ? 'bg-green-100 border-green-50' : 'border-gray-300'
                }`}
                
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
              <input
                id="zipcode"
                name="zipcode"
                type="text"
                value={formData.zipcode}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-2 py-1 border rounded-md shadow-sm text-sm ${
                  autoFilledFields.includes('zipcode') ? 'bg-green-100 border-green-50' : 'border-gray-300'
                }`}
                
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">ภาค</label>
              <input
                id="type"
                name="type"
                type="text"
                value={formData.type}
                onChange={handleChange}
                className={`mt-1 block w-full px-2 py-1 border rounded-md shadow-sm text-sm ${
                  autoFilledFields.includes('type') ? 'bg-green-100 border-green-50' : 'border-gray-300'
                }`}
                
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}