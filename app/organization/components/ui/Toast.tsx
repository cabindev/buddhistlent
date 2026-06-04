// app/organization/components/ui/Toast.tsx 
'use client';

import { toast, Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const SuccessToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-center p-4 bg-white border border-green-200 rounded-lg shadow-lg max-w-md">
    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const ErrorToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-center p-4 bg-white border border-red-200 rounded-lg shadow-lg max-w-md">
    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const InfoToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-center p-4 bg-white border border-blue-200 rounded-lg shadow-lg max-w-md">
    <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const WarningToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-center p-4 bg-white border border-orange-200 rounded-lg shadow-lg max-w-md">
    <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
      <X className="h-4 w-4" />
    </button>
  </div>
);

// Toast functions สำหรับการแจ้งเตือนต่างๆ
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => <SuccessToast message={message} onClose={() => toast.dismiss(t.id)} />,
    { duration: 3000, position: 'top-right', ...options }
  );
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => <ErrorToast message={message} onClose={() => toast.dismiss(t.id)} />,
    { duration: 5000, position: 'top-right', ...options }
  );
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => <InfoToast message={message} onClose={() => toast.dismiss(t.id)} />,
    { duration: 3000, position: 'top-right', ...options }
  );
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => <WarningToast message={message} onClose={() => toast.dismiss(t.id)} />,
    { duration: 4000, position: 'top-right', ...options }
  );
};

// Toast เฉพาะสำหรับการแจ้งเตือนเบอร์โทรที่ซ้ำกัน
export const showPhoneDuplicateToast = (phoneNumber: string) => {
  return toast.custom(
    (t) => (
      <div className="p-4 bg-white border border-red-200 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">เบอร์โทรถูกใช้แล้ว</p>
            <p className="text-sm text-gray-600">
              เบอร์โทร <span className="font-medium">{phoneNumber}</span> ถูกใช้งานแล้ว<br />
              กรุณาใช้เบอร์โทรอื่น หรือติดต่อผู้ดูแลระบบ
            </p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="ml-3 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration: 8000, position: 'top-center' }
  );
};

// Toast สำหรับการส่งข้อมูลสำเร็จ พิเศษสำหรับระบบงดเหล้าเข้าพรรษา
export const showSubmitSuccessToast = (organizationName?: string) => {
  const message = organizationName 
    ? `ส่งข้อมูลองค์กร ${organizationName} เรียบร้อยแล้ว` 
    : 'ส่งข้อมูลองค์กรเรียบร้อยแล้ว';
    
  return toast.custom(
    (t) => (
      <div className="p-4 bg-white border border-green-200 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 mb-1">ส่งข้อมูลสำเร็จ! 🙏</p>
            <p className="text-sm text-gray-600">{message}</p>
            <p className="text-xs text-gray-500 mt-1">
              ข้อมูลจะถูกตรวจสอบและประมวลผลต่อไป
            </p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="ml-3 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration: 5000, position: 'top-center' }
  );
};

// Toast สำหรับการแก้ไขข้อมูลสำเร็จ
export const showUpdateSuccessToast = (organizationName?: string) => {
  const message = organizationName 
    ? `แก้ไขข้อมูลองค์กร ${organizationName} เรียบร้อยแล้ว` 
    : 'แก้ไขข้อมูลองค์กรเรียบร้อยแล้ว';
    
  return showSuccessToast(message);
};

// Toast Container component หลัก
export const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: { 
          background: 'transparent', 
          boxShadow: 'none', 
          padding: 0 
        },
      }}
    />
  );
};