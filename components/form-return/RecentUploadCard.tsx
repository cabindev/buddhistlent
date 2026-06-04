// components/form-return/RecentUploadCard.tsx
import ProductionImage from '@/components/ui/ProductionImage';
import { FormReturnData } from '@/types/form-return';

interface RecentUploadCardProps {
  formReturn: FormReturnData;
}

export default function RecentUploadCard({ formReturn }: RecentUploadCardProps) {
  // ✅ Helper function สำหรับ format date
  const formatDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return 'ไม่ระบุ';
    
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'ไม่ระบุ';
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            เพิ่งอัพโหลด
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {formReturn.firstName} {formReturn.lastName}
          </h3>
          <p className="text-slate-700 mb-3">{formReturn.organizationName}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
            <div>
              <span className="font-medium">เบอร์โทร:</span>
              <p>{formReturn.phoneNumber}</p>
            </div>
            <div>
              <span className="font-medium">จำนวนผู้ลงนาม:</span>
              <p className="text-green-600 font-semibold">{formReturn.numberOfSigners?.toLocaleString() || 0} คน</p>
            </div>
            <div>
              <span className="font-medium">จังหวัด:</span>
              <p>{formReturn.province}</p>
            </div>
            <div>
              <span className="font-medium">วันที่ส่ง:</span>
              <p>{formatDate(formReturn.createdAt)}</p>
            </div>
          </div>

          {/* Images Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-2">รูปภาพที่ 1</p>
              {formReturn.image1 ? (
                <ProductionImage
                  src={formReturn.image1}
                  alt={`${formReturn.organizationName} - รูปที่ 1`}
                  width={150}
                  height={100}
                  className="rounded-lg border border-slate-200 w-full h-24 object-cover"
                />
              ) : (
                <div className="rounded-lg border border-slate-200 w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-2">รูปภาพที่ 2</p>
              {formReturn.image2 ? (
                <ProductionImage
                  src={formReturn.image2}
                  alt={`${formReturn.organizationName} - รูปที่ 2`}
                  width={150}
                  height={100}
                  className="rounded-lg border border-slate-200 w-full h-24 object-cover"
                />
              ) : (
                <div className="rounded-lg border border-slate-200 w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}