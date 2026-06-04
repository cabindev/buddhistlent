'use client'

import React, { useState } from 'react';
import { FaTimes, FaTrash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { deleteFormReturn } from '../actions/UpdateDelete';

interface FormReturnItem {
  id: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  createdAt: Date;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FormReturnItem | null;
  onSuccess: () => void;
}

export default function DeleteModal({ isOpen, onClose, record, onSuccess }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!record) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteFormReturn(record.id);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <h2 className="text-lg font-light text-gray-800">ยืนยันการลบข้อมูล</h2>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-gray-600 font-light mb-3">
              คุณต้องการลบข้อมูลการคืนฟอร์มนี้หรือไม่?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ชื่อ-นามสกุล:</span>
                  <span className="ml-2 text-gray-600">{record.firstName} {record.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">องค์กร:</span>
                  <span className="ml-2 text-gray-600">{record.organizationName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">วันที่บันทึก:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(record.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-600">{record.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm font-light">
              ⚠️ การลบข้อมูลนี้ไม่สามารถกู้คืนได้ กรุณาตรวจสอบอีกครั้งก่อนดำเนินการ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-light transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 font-light"
          >
            {deleting ? (
              <>
                <FaSpinner className="animate-spin mr-2 text-sm" />
                กำลังลบ...
              </>
            ) : (
              <>
                <FaTrash className="mr-2 text-sm" />
                ลบข้อมูล
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}