'use client';

import React, { useState, useEffect, FormEvent, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';

interface CampaignFormData {
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string;
  addressLine1: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  type: string;
  phone: string;
  job: string;
  alcoholConsumption: string;
  drinkingFrequency: string | null;
  intentPeriod: string | null;
  monthlyExpense: string | null;
  motivations: string[];
  healthImpact: string;
}

export default function EditCampaignBuddhistLent({ params }: { params: Promise<{ id: string }> }) {
  // ใช้ use() hook สำหรับ Client Component
  const { id } = use(params);
  
  const [formData, setFormData] = useState<CampaignFormData>({
    firstName: '',
    lastName: '',
    gender: '',
    birthday: '',
    addressLine1: '',
    district: '',
    amphoe: '',
    province: '',
    zipcode: '',
    type: '',
    phone: '',
    job: '',
    alcoholConsumption: '',
    drinkingFrequency: null,
    intentPeriod: null,
    monthlyExpense: null,
    motivations: [],
    healthImpact: '',
  });
  const [age, setAge] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCampaign = async () => {
        if (id) {
            try {
                const res = await axios.get(`/api/campaign-buddhist-lent/${id}`);
                const campaign = res.data;

                let motivationsArray = [];
                if (typeof campaign.motivations === 'string') {
                    try {
                        motivationsArray = JSON.parse(campaign.motivations);
                    } catch (e) {
                        console.error('Error parsing motivations:', e);
                        motivationsArray = campaign.motivations ? [campaign.motivations] : [];
                    }
                } else if (Array.isArray(campaign.motivations)) {
                    motivationsArray = campaign.motivations;
                }

                setFormData({
                    ...campaign,
                    birthday: campaign.birthday ? campaign.birthday.split('T')[0] : '',
                    monthlyExpense: campaign.monthlyExpense?.toLocaleString() || '',
                    motivations: motivationsArray,
                });

                if (campaign.birthday) {
                    setAge(calculateAge(campaign.birthday));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load campaign data');
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchCampaign();
}, [id]); // เปลี่ยนจาก params.id เป็น id

  
  
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'birthday') {
      setAge(calculateAge(value));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, district: value }));

    if (value.length > 0) {
      const filteredSuggestions = data
        .filter((region) => region.district.startsWith(value))
        .slice(0, 10);
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
    setSuggestions([]);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      motivations: checked
        ? [...prev.motivations, value]
        : prev.motivations.filter(item => item !== value)
    }));
  };

  const formatMonthlyExpense = (value: string) => {
    const number = parseInt(value.replace(/,/g, ''));
    return isNaN(number) ? '' : number.toLocaleString();
  };

  const handleMonthlyExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setFormData(prev => ({
        ...prev,
        monthlyExpense: formatMonthlyExpense(value)
      }));
    }
  };

  const isValidPhoneNumber = (phone: string) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
      setPhoneError(null);
    }
    if (value.length === 10 && !isValidPhoneNumber(value)) {
      setPhoneError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(null);

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
        setPhoneError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
        return;
    }

    try {
        const dataToSend = {
            ...formData,
            monthlyExpense: formData.monthlyExpense ? parseInt(formData.monthlyExpense.replace(/,/g, '')) : null,
            motivations: JSON.stringify(formData.motivations), // ส่งกลับเป็น JSON string
        };
        await axios.put(`/api/campaign-buddhist-lent/${id}`, dataToSend); // เปลี่ยนจาก params.id เป็น id
        router.push('/profile');
    } catch (error: any) {
        console.error('Error updating campaign:', error);
        setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
};

  // ... ส่วน JSX ที่เหลือเหมือนเดิม
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {/* ส่วน JSX ที่เหลือเหมือนเดิมทุกอย่าง - ไม่ต้องเปลี่ยน */}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-semibold mb-6 text-center text-amber-600">
              แก้ไขข้อมูล : กิจกรรมงดเหล้าเข้าพรรษา
            </h1>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  ชื่อ
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  สกุล
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                เพศ
              </label>
              <div className="mt-2 space-x-4">
                {["ชาย", "หญิง", "LGBTQ"].map((genderOption) => (
                  <label
                    key={genderOption}
                    className="inline-flex items-center"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={genderOption}
                      checked={formData.gender === genderOption}
                      onChange={handleChange}
                      required
                      className="form-radio h-4 w-4 text-amber-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2">{genderOption}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-700"
              >
                วันเกิด/วัน/เดือน/ปี ค.ศ
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              {age !== null && (
                <p className="mt-1 text-sm text-gray-500">อายุ: {age} ปี</p>
              )}
            </div>

            <div>
              <label
                htmlFor="addressLine1"
                className="block text-sm font-medium text-gray-700"
              >
                ที่อยู่ (เลขที่/หมู่บ้าน)
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={formData.addressLine1}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-700"
              >
                ตำบล/แขวง
              </label>
              <input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleDistrictChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              {suggestions.length > 0 && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="cursor-pointer p-2 hover:bg-amber-100"
                    >
                      {suggestion.district} - {suggestion.amphoe},{" "}
                      {suggestion.province}, {suggestion.zipcode}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label
                htmlFor="amphoe"
                className="block text-sm font-medium text-gray-700"
              >
                อำเภอ/เขต
              </label>
              <input
                id="amphoe"
                name="amphoe"
                type="text"
                value={formData.amphoe}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="province"
                className="block text-sm font-medium text-gray-700"
              >
                จังหวัด
              </label>
              <input
                id="province"
                name="province"
                type="text"
                value={formData.province}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="zipcode"
                className="block text-sm font-medium text-gray-700"
              >
                รหัสไปรษณีย์
              </label>
              <input
                id="zipcode"
                name="zipcode"
                type="text"
                value={formData.zipcode}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                เบอร์โทรศัพท์ (ไม่บังคับ)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="job"
                className="block text-sm font-medium text-gray-700"
              >
                อาชีพ
              </label>
              <select
                id="job"
                name="job"
                value={formData.job}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="" disabled>
                  เลือกอาชีพ
                </option>
                <option value="ประกอบธุรกิจส่วนตัว">ประกอบธุรกิจส่วนตัว</option>
                <option value="ข้าราชการ/ลูกจ้างหน่วยงานราชการ">
                  ข้าราชการ/ลูกจ้างหน่วยงานราชการ
                </option>
                <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                <option value="พนักงานเอกชน/ลูกจ้างเอกชน">
                  พนักงานเอกชน/ลูกจ้างเอกชน
                </option>
                <option value="ค้าขาย/งานบริการ">ค้าขาย/งานบริการ</option>
                <option value="เกษตรกรรม">เกษตรกรรม</option>
                <option value="รับจ้างทั่วไป">รับจ้างทั่วไป</option>
                <option value="นักเรียน/นักศึกษา">นักเรียน/นักศึกษา</option>
                <option value="ข้าราชการเกษียณ">ข้าราชการเกษียณ</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="alcoholConsumption"
                className="block text-sm font-medium text-gray-700"
              >
                ท่านดื่มเครื่องดื่มแอลกอฮอล์หรือไม่
              </label>
              <select
                id="alcoholConsumption"
                name="alcoholConsumption"
                value={formData.alcoholConsumption}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="" disabled>
                  เลือกคำตอบ
                </option>
                <option value="ดื่ม (ย้อนหลังไป 1 ปี)">
                  ดื่ม (ย้อนหลังไป 1 ปี)
                </option>
                <option value="เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี">
                  เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี
                </option>
                <option value="เลิกดื่มมาแล้วมากกว่า 3 ปี">
                  เลิกดื่มมาแล้วมากกว่า 3 ปี
                </option>
                <option value="ไม่เคยดื่มเลยตลอดชีวิต">
                  ไม่เคยดื่มเลยตลอดชีวิต
                </option>
              </select>
            </div>

            {(formData.alcoholConsumption === "ดื่ม (ย้อนหลังไป 1 ปี)" ||
              formData.alcoholConsumption ===
                "เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี") && (
              <>
                <div>
                  <label
                    htmlFor="drinkingFrequency"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ท่านดื่มบ่อยแค่ไหน
                  </label>
                  <select
                    id="drinkingFrequency"
                    name="drinkingFrequency"
                    value={formData.drinkingFrequency || ""}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  >
                    <option value="" disabled>
                      เลือกคำตอบ
                    </option>
                    <option value="ทุกวัน (7 วัน/สัปดาห์)">
                      ทุกวัน (7 วัน/สัปดาห์)
                    </option>
                    <option value="เกือบทุกวัน (3-5 วัน/สัปดาห์)">
                      เกือบทุกวัน (3-5 วัน/สัปดาห์)
                    </option>
                    <option value="ทุกสัปดาห์ (1-2 วัน/สัปดาห์)">
                      ทุกสัปดาห์ (1-2 วัน/สัปดาห์)
                    </option>
                    <option value="ทุกเดือน (1-3 วัน/เดือน)">
                      ทุกเดือน (1-3 วัน/เดือน)
                    </option>
                    <option value="นาน ๆ ครั้ง (8-11 วัน/ปี)">
                      นาน ๆ ครั้ง (8-11 วัน/ปี)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="monthlyExpense"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ค่าใช้จ่ายในการดื่มต่อเดือน (บาท)
                  </label>
                  <input
                    id="monthlyExpense"
                    name="monthlyExpense"
                    type="text"
                    value={formData.monthlyExpense || ""}
                    onChange={handleMonthlyExpenseChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intentPeriod"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ตั้งใจงดดื่มแบบไหน
                  </label>
                  <select
                    id="intentPeriod"
                    name="intentPeriod"
                    value={formData.intentPeriod || ""}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  >
                    <option value="" disabled>
                      เลือกคำตอบ
                    </option>
                    <option value="1 เดือน">1 เดือน</option>
                    <option value="2 เดือน">2 เดือน</option>
                    <option value="3 เดือน">3 เดือน</option>
                    <option value="ตลอดชีวิต">ตลอดชีวิต</option>
                    <option value="ลดปริมาณการดื่ม">ลดปริมาณการดื่ม</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label
                htmlFor="motivations"
                className="block text-sm font-medium text-gray-700"
              >
                แรงจูงใจในการงดเหล้า (เลือกได้หลายข้อ)
              </label>
              <div className="mt-2 space-y-2">
                {[
                  "เพื่อลูกและครอบครัว",
                  "เพื่อสุขภาพของตนเอง",
                  "ได้บุญ/รักษาศีล",
                  "ผู้นำชุมชนชักชวน",
                  "คนรักและเพื่อนชวน",
                  "ประหยัดเงิน",
                  "เพื่อเป็นแบบอย่างที่ดีให้กับคนอื่น",
                ].map((motivation, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`motivation${index + 1}`}
                      type="checkbox"
                      value={motivation}
                      checked={formData.motivations.includes(motivation)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label
                      htmlFor={`motivation${index + 1}`}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      {motivation}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="healthImpact"
                className="block text-sm font-medium text-gray-700"
              >
                ผลกระทบต่อสุขภาพ
              </label>
              <select
                id="healthImpact"
                name="healthImpact"
                value={formData.healthImpact}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="" disabled>
                  เลือกคำตอบ
                </option>
                <option value="ไม่มีผลกระทบ">ไม่มีผลกระทบ</option>
                <option value="มีผลกระทบแต่ไม่ต้องการช่วยเหลือ">
                  มีผลกระทบแต่ไม่ต้องการช่วยเหลือ
                </option>
                <option value="มีผลกระทบและควรได้รับการช่วยเหลือจากแพทย์หรือผู้เชี่ยวชาญด้านการบำบัดสุรา">
                  มีผลกระทบและควรได้รับการช่วยเหลือจากแพทย์หรือผู้เชี่ยวชาญด้านการบำบัดสุรา
                </option>
              </select>
            </div>

            {error && <div className="text-red-500 mt-2">{error}</div>}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-200"
            >
              บันทึกการแก้ไข
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}