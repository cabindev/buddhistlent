'use client'

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { updateFormReturn, getFormReturnById } from '../actions/UpdateDelete';
import { getFormReturnFilterOptionsByYear } from '../actions/GetTableData';

interface FormReturnItem {
  id: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phoneNumber: string;
  numberOfSigners: number;
  createdAt: Date;
}

interface FilterOptions {
  provinces: string[];
  organizationNames: string[];
  types: string[];
  districts: string[];
  amphoes: string[];
  years: number[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
  onSuccess: () => void;
}

export default function EditModal({ isOpen, onClose, recordId, onSuccess }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<FormReturnItem>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    if (isOpen && recordId) {
      loadRecord();
      loadFilterOptions();
    }
  }, [isOpen, recordId]);

  const loadRecord = async () => {
    if (!recordId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFormReturnById(recordId);
      if (result.success && result.data) {
        setFormData(result.data);
      } else {
        setError(result.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Load filter options for year 2025 only
      const result = await getFormReturnFilterOptionsByYear(2025);
      if (result.success && result.data) {
        setFilterOptions(result.data);
      }
    } catch (err) {
      console.error('Error loading filter options for 2025:', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!recordId || !formData) return;

    setSaving(true);
    setError(null);

    try {
      const updateData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        organizationName: formData.organizationName || '',
        addressLine1: formData.addressLine1 || '',
        district: formData.district || '',
        amphoe: formData.amphoe || '',
        province: formData.province || '',
        zipcode: formData.zipcode || '',
        type: formData.type || '',
        phoneNumber: formData.phoneNumber || '',
        numberOfSigners: formData.numberOfSigners || 0,
      };

      const result = await updateFormReturn(recordId, updateData);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-light text-gray-800">แก้ไขข้อมูลการคืนฟอร์ม</h2>
            <p className="text-xs text-amber-600 mt-1">
              📅 ตัวเลือกแสดงเฉพาะข้อมูลปี 2025 (พ.ศ. 2568)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-amber-500 mr-2" />
              <span className="text-gray-600 font-light">กำลังโหลดข้อมูล...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  นามสกุล
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Organization Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-light text-gray-700 mb-1">
                  ชื่อองค์กร
                </label>
                {filterOptions ? (
                  <select
                    value={formData.organizationName || ''}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">เลือกองค์กร (ปี 2025)...</option>
                    {filterOptions.organizationNames.map((orgName) => (
                      <option key={orgName} value={orgName}>
                        {orgName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.organizationName || ''}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                    placeholder="กำลังโหลดรายการองค์กร..."
                    disabled
                  />
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-light text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <input
                  type="text"
                  value={formData.addressLine1 || ''}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  ตำบล
                </label>
                {filterOptions ? (
                  <select
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">เลือกตำบล (ปี 2025)...</option>
                    {filterOptions.districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  />
                )}
              </div>

              {/* Amphoe */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  อำเภอ
                </label>
                {filterOptions ? (
                  <select
                    value={formData.amphoe || ''}
                    onChange={(e) => handleInputChange('amphoe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">เลือกอำเภอ (ปี 2025)...</option>
                    {filterOptions.amphoes.map((amphoe) => (
                      <option key={amphoe} value={amphoe}>
                        {amphoe}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.amphoe || ''}
                    onChange={(e) => handleInputChange('amphoe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  />
                )}
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  จังหวัด
                </label>
                {filterOptions ? (
                  <select
                    value={formData.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">เลือกจังหวัด (ปี 2025)...</option>
                    {filterOptions.provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  />
                )}
              </div>

              {/* Zipcode */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  value={formData.zipcode || ''}
                  onChange={(e) => handleInputChange('zipcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  ประเภท
                </label>
                {filterOptions ? (
                  <select
                    value={formData.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">เลือกประเภท (ปี 2025)...</option>
                    {filterOptions.types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  />
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Number of Signers */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-1">
                  จำนวนผู้ลงชื่อ
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numberOfSigners || 0}
                  onChange={(e) => handleInputChange('numberOfSigners', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-light focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-light transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 font-light"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2 text-sm" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <FaSave className="mr-2 text-sm" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}