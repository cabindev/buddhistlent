'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { data as regions } from '@/app/data/regions';
import { createSoberCheers } from '../actions/Post';
import { getActiveOrganizationCategories } from '@/app/dashboard/organization-category/actions/Get';
import type { OrganizationCategory } from '@/types/organization';

const DRINKER = ['ดื่ม (ย้อนหลังไป 1 ปี)', 'เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี'];

const MOTIVATIONS = [
  'เพื่อลูกและครอบครัว', 'เพื่อสุขภาพของตนเอง', 'ได้บุญ/รักษาศีล',
  'ผู้นำชุมชนชักชวน', 'คนรักและเพื่อนชวน', 'ประหยัดเงิน',
  'เพื่อเป็นแบบอย่างที่ดีให้กับคนอื่น',
];

function calcAge(birthday: string) {
  if (!birthday) return null;
  const today = new Date();
  const b = new Date(birthday);
  let age = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--;
  return age > 0 ? age : null;
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-5 h-5 rounded-full bg-green-400 text-gray-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{n}</span>
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const base = "w-full px-3 py-2.5 text-sm text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white placeholder-gray-300 transition";
const inputCls = `${base} border border-gray-200`;
const selectCls = `${base} border border-gray-200 cursor-pointer`;

const filledInput = (value: string | number) =>
  value !== '' && value !== 0
    ? `${base} border border-green-400 bg-green-50`
    : inputCls;

const filledSelect = (value: string | number) =>
  value !== '' && value !== 0
    ? `${base} border border-green-400 bg-green-50 cursor-pointer`
    : selectCls;

const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function BirthdayPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [yBE, setYBE] = useState(''); // พ.ศ.

  useEffect(() => {
    if (value) {
      const [yy, mm, dd] = value.split('-');
      setYBE(String(parseInt(yy) + 543));
      setM(String(parseInt(mm)));
      setD(String(parseInt(dd)));
    }
  }, []);

  const update = (nd: string, nm: string, ny: string) => {
    if (nd && nm && ny) {
      const yCE = parseInt(ny) - 543;
      onChange(`${yCE}-${nm.padStart(2,'0')}-${nd.padStart(2,'0')}`);
    } else {
      onChange('');
    }
  };

  const yCE = yBE ? parseInt(yBE) - 543 : undefined;
  const maxDay = m && yCE ? new Date(yCE, parseInt(m), 0).getDate() : 31;
  const currentYearBE = new Date().getFullYear() + 543;
  const years = Array.from({ length: currentYearBE - 2472 }, (_, i) => currentYearBE - i);

  const selBase = "flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer transition";
  const sel = (v: string) => v
    ? `${selBase} border border-green-400 bg-green-50 text-gray-900`
    : `${selBase} border border-gray-200 bg-white text-gray-900`;

  return (
    <div className="flex gap-2">
      <select value={d} onChange={e => { setD(e.target.value); update(e.target.value, m, yBE); }} className={sel(d)}>
        <option value="">วัน</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <select value={m} onChange={e => { setM(e.target.value); update(d, e.target.value, yBE); }} className={sel(m)}>
        <option value="">เดือน</option>
        {MONTHS_TH.map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
      </select>
      <select value={yBE} onChange={e => { setYBE(e.target.value); update(d, m, e.target.value); }} className={`${sel(yBE)} flex-[1.4]`}>
        <option value="">ปี (พ.ศ.)</option>
        {years.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}

export default function CreateSoberCheers() {
  const router = useRouter();
  const districtRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', birthday: '',
    addressLine1: '', district: '', amphoe: '', province: '', zipcode: '', type: '',
    phone: '', job: '', alcoholConsumption: '',
    drinkingFrequency: '', intentPeriod: '', monthlyExpense: '',
    healthImpact: 'ไม่มีผลกระทบ',
  });
  const [motivations, setMotivations] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orgCategories, setOrgCategories] = useState<OrganizationCategory[]>([]);

  // โหลดรายการสังกัด (OrganizationCategory) จาก DB
  useEffect(() => {
    getActiveOrganizationCategories().then(setOrgCategories).catch(() => setOrgCategories([]));
  }, []);

  // จัดกลุ่มสังกัดตามประเภท
  const orgGroups = orgCategories.reduce((acc, c) => {
    (acc[c.categoryType] ??= []).push(c);
    return acc;
  }, {} as Record<string, OrganizationCategory[]>);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const age = calcAge(form.birthday);
  const isDrinker = DRINKER.includes(form.alcoholConsumption);

  // District autocomplete
  const handleDistrictChange = (val: string) => {
    set('district', val);
    setAutoFilled(false);
    setSuggestions(val.length > 0 ? regions.filter(r => r.district.toLowerCase().startsWith(val.toLowerCase())).slice(0, 8) : []);
  };

  const pickSuggestion = (s: any) => {
    setForm(f => ({ ...f, district: s.district, amphoe: s.amphoe, province: s.province, zipcode: s.zipcode.toString(), type: s.type }));
    setSuggestions([]);
    setAutoFilled(true);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (districtRef.current && !districtRef.current.contains(e.target as Node)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleMotivation = (m: string) =>
    setMotivations(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.gender) return setError('กรุณาเลือกเพศ');
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) return setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');

    setSubmitting(true);
    try {
      const result = await createSoberCheers({
        ...form,
        motivations,
        drinkingFrequency: isDrinker ? form.drinkingFrequency || null : null,
        intentPeriod: isDrinker ? form.intentPeriod || null : null,
        monthlyExpense: isDrinker && form.monthlyExpense ? parseInt(form.monthlyExpense.replace(/,/g, '')) : null,
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/soberCheers'), 1500);
      } else {
        setError(result.message);
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-gray-700 font-medium">ลงทะเบียนสำเร็จ</p>
          <p className="text-sm text-gray-400">กำลังกลับสู่หน้าหลัก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} type="button"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">งดเหล้าเข้าพรรษา สิ่งดีๆจะเกิดขึ้น</h1>
            <p className="text-[10px] text-gray-400">Buddhistlent · ปี {new Date().getFullYear() + 543}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 pb-28">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">

          {/* Section 1 — ข้อมูลส่วนตัว */}
          <div className="p-6">
            <Section n={1} title="ข้อมูลส่วนตัว">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อ" required>
                  <input className={filledInput(form.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="ชื่อ" required />
                </Field>
                <Field label="นามสกุล" required>
                  <input className={filledInput(form.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="นามสกุล" required />
                </Field>
              </div>

              <Field label="เพศ" required>
                <div className="flex gap-2 mt-0.5">
                  {['ชาย', 'หญิง', 'LGBTQ'].map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        form.gender === g
                          ? 'bg-green-400 border-green-400 text-gray-900 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                      }`}
                    >{g}</button>
                  ))}
                </div>
              </Field>

              <Field label="วันเกิด (พ.ศ.)" required>
                <BirthdayPicker value={form.birthday} onChange={v => set('birthday', v)} />
                {age !== null && (
                  <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> อายุ {age} ปี
                  </p>
                )}
              </Field>
            </Section>
          </div>

          {/* Section 2 — ที่อยู่ */}
          <div className="p-6">
            <Section n={2} title="ที่อยู่">
              <Field label="ที่อยู่ (บ้านเลขที่/หมู่บ้าน)" required>
                <input className={filledInput(form.addressLine1)} value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} placeholder="บ้านเลขที่ หมู่..." required />
              </Field>

              <Field label="ตำบล/แขวง" required hint="พิมพ์ชื่อตำบลโดยไม่ต้องมีคำนำหน้า ระบบจะแนะนำข้อมูลอัตโนมัติ">
                <div className="relative" ref={districtRef}>
                  <input className={filledInput(form.district)} value={form.district} onChange={e => handleDistrictChange(e.target.value)} placeholder="พิมพ์ชื่อตำบล..." required />
                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {suggestions.map((s, i) => (
                        <li key={i} onClick={() => pickSuggestion(s)}
                          className="px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0">
                          <span className="font-medium">{s.district}</span>
                          <span className="text-gray-400"> · {s.amphoe} · {s.province} {s.zipcode}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="อำเภอ/เขต" required>
                  <input className={filledInput(form.amphoe)} value={form.amphoe} onChange={e => set('amphoe', e.target.value)} placeholder="อำเภอ" required />
                </Field>
                <Field label="จังหวัด" required>
                  <input className={filledInput(form.province)} value={form.province} onChange={e => set('province', e.target.value)} placeholder="จังหวัด" required />
                </Field>
              </div>

              <Field label="รหัสไปรษณีย์" required>
                <input className={`${filledInput(form.zipcode)} max-w-[140px]`}
                  value={form.zipcode} onChange={e => set('zipcode', e.target.value)} placeholder="00000" maxLength={5} required />
              </Field>
            </Section>
          </div>

          {/* Section 3 — ข้อมูลติดต่อ */}
          <div className="p-6">
            <Section n={3} title="ข้อมูลติดต่อ">
              <Field label="เบอร์โทรศัพท์" hint="ไม่บังคับ — ตัวเลข 10 หลัก">
                <input className={`${filledInput(form.phone)} max-w-[200px]`} type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="0812345678" maxLength={10} />
              </Field>

              <Field label="สังกัด" required hint="หน่วยงาน/องค์กรที่ท่านสังกัด">
                <div className="space-y-3">
                  {Object.entries(orgGroups).map(([type, items]) => (
                    <div key={type}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">{type}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map(c => (
                          <button key={c.id} type="button" onClick={() => set('job', c.name)}
                            className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${
                              form.job === c.name
                                ? 'bg-green-50 border-green-400'
                                : 'border-gray-200 hover:border-green-200'
                            }`}>
                            <span className={`block text-sm font-semibold leading-tight ${form.job === c.name ? 'text-green-800' : 'text-gray-800'}`}>
                              {c.shortName || c.name}
                            </span>
                            {c.shortName && (
                              <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">{c.name}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => set('job', 'อื่น ๆ')}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      form.job === 'อื่น ๆ'
                        ? 'bg-green-50 border-green-400 text-green-800'
                        : 'border-gray-200 text-gray-600 hover:border-green-200'
                    }`}>
                    อื่น ๆ
                  </button>
                </div>
              </Field>
            </Section>
          </div>

          {/* Section 4 — การดื่มแอลกอฮอล์ */}
          <div className="p-6">
            <Section n={4} title="การดื่มแอลกอฮอล์">
              <Field label="สถานะการดื่ม" required>
                <select className={filledSelect(form.alcoholConsumption)} value={form.alcoholConsumption} onChange={e => set('alcoholConsumption', e.target.value)} required>
                  <option value="" disabled>เลือกคำตอบ</option>
                  <option value="ดื่ม (ย้อนหลังไป 1 ปี)">ดื่ม (ย้อนหลังไป 1 ปี)</option>
                  <option value="เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี">เลิกดื่มมาแล้วมากกว่า 1 ปี แต่ยังไม่ถึง 3 ปี</option>
                  <option value="เลิกดื่มมาแล้วมากกว่า 3 ปี">เลิกดื่มมาแล้วมากกว่า 3 ปี</option>
                  <option value="ไม่เคยดื่มเลยตลอดชีวิต">ไม่เคยดื่มเลยตลอดชีวิต</option>
                </select>
              </Field>

              {isDrinker && (
                <div className="space-y-4 pl-4 border-l-2 border-green-200">
                  <Field label="ความถี่การดื่ม" required>
                    <select className={filledSelect(form.drinkingFrequency)} value={form.drinkingFrequency} onChange={e => set('drinkingFrequency', e.target.value)} required>
                      <option value="" disabled>เลือกคำตอบ</option>
                      <option value="ทุกวัน (7 วัน/สัปดาห์)">ทุกวัน (7 วัน/สัปดาห์)</option>
                      <option value="เกือบทุกวัน (3-5 วัน/สัปดาห์)">เกือบทุกวัน (3-5 วัน/สัปดาห์)</option>
                      <option value="ทุกสัปดาห์ (1-2 วัน/สัปดาห์)">ทุกสัปดาห์ (1-2 วัน/สัปดาห์)</option>
                      <option value="ทุกเดือน (1-3 วัน/เดือน)">ทุกเดือน (1-3 วัน/เดือน)</option>
                      <option value="นาน ๆ ครั้ง (8-11 วัน/ปี)">นาน ๆ ครั้ง (8-11 วัน/ปี)</option>
                    </select>
                  </Field>

                  <Field label="ค่าใช้จ่าย/เดือน (บาท)" required>
                    <input className={`${filledInput(form.monthlyExpense)} max-w-[200px]`} type="text" value={form.monthlyExpense}
                      onChange={e => set('monthlyExpense', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="500" required />
                  </Field>

                  <Field label="ตั้งใจงดดื่ม" required>
                    <select className={filledSelect(form.intentPeriod)} value={form.intentPeriod} onChange={e => set('intentPeriod', e.target.value)} required>
                      <option value="" disabled>เลือกคำตอบ</option>
                      <option value="1 เดือน">1 เดือน</option>
                      <option value="2 เดือน">2 เดือน</option>
                      <option value="3 เดือน">3 เดือน</option>
                      <option value="ตลอดชีวิต">ตลอดชีวิต</option>
                      <option value="ลดปริมาณการดื่ม">ลดปริมาณการดื่ม</option>
                    </select>
                  </Field>
                </div>
              )}
            </Section>
          </div>

          {/* Section 5 — แรงจูงใจ */}
          <div className="p-6">
            <Section n={5} title="แรงจูงใจในการงดเหล้า">
              <div className="grid grid-cols-2 gap-2">
                {MOTIVATIONS.map(m => (
                  <button key={m} type="button" onClick={() => toggleMotivation(m)}
                    className={`px-3 py-2.5 text-sm rounded-lg border text-left transition-colors ${
                      motivations.includes(m)
                        ? 'bg-green-50 border-green-400 text-green-800 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-green-200'
                    }`}
                  >
                    {motivations.includes(m) && <span className="mr-1">✓</span>}
                    {m}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Section 6 — ผลกระทบ */}
          <div className="p-6">
            <Section n={6} title="ผลกระทบต่อสุขภาพ">
              <div className="space-y-2">
                {[
                  { value: 'ไม่มีผลกระทบ', desc: '' },
                  { value: 'มีผลกระทบแต่ไม่ต้องการช่วยเหลือ', desc: '' },
                  { value: 'มีผลกระทบและควรได้รับการช่วยเหลือจากแพทย์หรือผู้เชี่ยวชาญด้านการบำบัดสุรา', desc: '' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('healthImpact', opt.value)}
                    className={`w-full px-4 py-3 text-sm rounded-lg border text-left transition-colors ${
                      form.healthImpact === opt.value
                        ? 'bg-green-50 border-green-400 text-green-800 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-green-200'
                    }`}
                  >
                    {form.healthImpact === opt.value && <span className="mr-2">✓</span>}
                    {opt.value}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {error && (
            <div className="p-6">
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex gap-2">
          <button type="button" onClick={() => router.back()} disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="button" onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={submitting}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-900 bg-green-400 hover:bg-green-500 rounded-xl transition-colors disabled:opacity-50">
            {submitting ? (
              <><LoaderCircle className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : 'ลงทะเบียน'}
          </button>
        </div>
      </div>
    </div>
  );
}
