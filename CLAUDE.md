# Healthy Sobriety — Buddhist Lent Campaign Platform

## Project Overview
แอปพลิเคชัน Next.js สำหรับบริหารจัดการแคมเปญงดเหล้าเข้าพรรษา ประกอบด้วย 4 โมดูลหลัก:
1. **SoberCheers** — ลงทะเบียนงดเหล้า (32,533+ คน, รองรับหลายปี 2024/2026/...)
2. **Organization** — ข้อมูลองค์กรเข้าร่วม (รองรับหลายปี 2025/2026/...)
3. **Form Return** — ฟอร์มส่งคืนข้อมูล (รองรับหลายปี)
4. **Campaign Buddhist Lent** — แคมเปญที่ต้อง login

**Production URL**: https://healthy-sobriety.sdnthailand.com  
**Local DB**: `Buddhist-T2` (MySQL, MAMP)

---

## Technology Stack
- **Framework**: Next.js 16.2.7 (App Router, Turbopack)
- **Runtime**: React 19.2.7, TypeScript 5.x
- **Database**: MySQL — Prisma 6.x
- **Authentication**: NextAuth.js 4.x (JWT, role-based)
- **UI**: Tailwind CSS 3, DaisyUI 4, Radix UI
- **Charts**: ECharts 5 (`echarts-for-react`), Chart.js 4
- **Icons**: lucide-react (standard throughout), react-icons (legacy บางส่วน)
- **Maps**: Leaflet + React Leaflet 5
- **Email**: Nodemailer 7.x + EmailJS
- **Image compression**: `browser-image-compression`
- **Export**: `react-csv`, `xlsx`, `file-saver`
- **Loading**: `<Loading>` shared component (`components/ui/Loading.tsx`) — ใช้ `<LoaderCircle>` lucide-react

---

## Development Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint

npx prisma generate              # Regenerate client หลังแก้ schema
npx prisma migrate dev --name x  # สร้าง migration ใหม่
npx prisma db push               # Push schema โดยตรง (dev)
npx prisma studio                # GUI ดูข้อมูล
```

---

## Project Structure

```
app/
├── page.tsx                          # Landing page
├── layout.tsx                        # Root layout (suppressHydrationWarning)
├── globals.css                       # @import leaflet ต้องอยู่ก่อน @tailwind base
│
├── soberCheers/                      # Public — ลงทะเบียนงดเหล้า (all years)
│   ├── page.tsx                      # List + year filter client-side
│   ├── loading.tsx
│   ├── create/page.tsx               # ฟอร์มใหม่: sections, pill buttons, toggle motivations
│   ├── edit/[id]/page.tsx            # ฟอร์ม edit เหมือน create ทุกประการ
│   ├── actions/                      # ✅ Server Actions
│   │   ├── Get.ts   — getAllSoberCheers, getById, getCount, getTypeRegions,
│   │   │              getAllSoberCheersForTable(year?)
│   │   ├── Post.ts  — createSoberCheers
│   │   ├── Update.ts — updateSoberCheers
│   │   └── Delete.ts — deleteSoberCheers
│   └── components/
│       ├── editSoberCheersModal.tsx
│       └── totalCount.tsx
│
├── organization/                     # Public — ข้อมูลองค์กร
│   ├── page.tsx / loading.tsx / create/ edit/[id]/ view/[id]/
│   ├── actions/                      # ✅ Server Actions
│   │   ├── Get.ts   — getAllOrganizations(year?), getAvailableOrganizationYears()
│   │   ├── Post.ts / Update.ts / Delete.ts / Upload.ts
│   └── components/ + components/ui/
│
├── form_return/                      # Public — ฟอร์มส่งคืนข้อมูล
│   ├── page.tsx / loading.tsx / create/ edit/[id]/ success/
│   └── actions/  get.ts / post.ts / update.ts / delete.ts
│
├── form_campaign_buddhist_lent/      # Public — ลงทะเบียนแคมเปญ (CampaignBuddhistLent)
│
├── auth/                             # signin/ signup/ forgot-password/ reset-password/ form_signup/
│
├── dashboard/                        # Admin only (middleware ป้องกัน role=admin)
│   ├── page.tsx / layout.tsx / loading.tsx
│   ├── components/
│   │   ├── Sidebar.tsx               # เมนู: Sober Cheers (ไม่มีปี), Organization, Form Return, Settings
│   │   ├── DashboardCharts.tsx / DashboardStats.tsx / QuickActions.tsx / TopNav.tsx
│   ├── context/                      # DashboardContext, TopNavContext
│   │
│   ├── soberCheers/                  # Dashboard SoberCheers — รองรับ year tabs
│   │   ├── page.tsx / loading.tsx
│   │   ├── actions/
│   │   │   └── GetChartData.ts       # ✅ ทุก function รับ year?: number
│   │   │                             #    + getAvailableSoberCheersYears()
│   │   └── components/
│   │       ├── allChartSobers.tsx    # Year tabs + pass year ไปทุก chart component
│   │       ├── [chart components]    # ทุกตัวรับ { year?: number } prop
│   │       └── soberTable/page.tsx   # Year tabs + getAllSoberCheersForTable(year)
│   │
│   ├── organization/                 # Dashboard Organization — year tabs
│   │   ├── page.tsx / loading.tsx
│   │   ├── tables/page.tsx / gallery/page.tsx  # Year tabs + export
│   │   ├── create/ edit/[id]/ view/[id]/
│   │   ├── actions/
│   │   │   ├── GetChartData.ts       # ✅ ทุก function รับ year? + getAvailableYears()
│   │   │   └── GetTableData.ts
│   │   └── components/charts/AllChartsOrganization.tsx
│   │
│   ├── Buddhist2024/                 # Dashboard Buddhist Lent 2024 (CampaignBuddhistLent)
│   │
│   ├── form_return/                  # Dashboard Form Return — unified year tabs
│   │   ├── page.tsx                  # Unified dashboard (ใช้ allChartFormReturn.tsx)
│   │   ├── 2024/page.tsx             # → render allChartFormReturn initialYear=2024
│   │   ├── 2025/page.tsx             # → render allChartFormReturn initialYear=2025
│   │   ├── table/                    # CRUD table + DeleteModal + EditModal
│   │   ├── actions/
│   │   │   └── GetChartData.ts       # ✅ getFormReturnChartData(year?) + getAvailableFormReturnYears()
│   │   └── components/charts/
│   │       └── allChartFormReturn.tsx  # Year tabs อัตโนมัติ, initialYear? prop
│   │
│   ├── organization-category/        # CRUD master data
│   ├── profile/ setting/admin/
│   └── formReturn/                   # หน้าจัดการ/list ข้อมูล form_return (3 year tabs: 2024/2025/2026)
│
├── api/                              # API Routes — เหลือเฉพาะที่จำเป็น
│   ├── auth/[...nextauth]/ forgot-password/ reset-password/ signup/
│   ├── campaign-buddhist-lent/ + [id]
│   ├── users/ + [id]
│   └── admin/users/ + toggle-role/
│
├── data/                             # Thai location static data (regions)
└── lib/configs/auth/                 # NextAuth config

components/                           # Root-level shared components
├── ui/
│   ├── Loading.tsx                   # <LoaderCircle> lucide, props: size/color/fullPage/text
│   ├── Button.tsx / Card.tsx / Table.tsx / Pagination.tsx / Modal.tsx
│   └── stepIndicator.tsx / progress.tsx / ...
├── form-return/                      # Multi-step form components
│   ├── PersonalInfoStep.tsx          # organizationOptions = สังกัดองค์กร
│   ├── AddressStep.tsx / ContactStep.tsx / ImageUploadStep.tsx / ConfirmationStep.tsx
│   └── TambonSearch.tsx              # ✅ Shared — RegionData type
├── dashboard/
│   └── DashboardSkeleton.tsx
└── Navbar.tsx / BuddhistLentBadge.tsx
```

---

## Database Models (prisma/schema.prisma)

| Model | คำอธิบาย | Key Fields |
|-------|---------|-----------|
| `SoberCheers` | ผู้ลงทะเบียนงดเหล้า (ทุกปี แยกด้วย createdAt) | birthday, job, motivations (Json) |
| `CampaignBuddhistLent` | แคมเปญเข้าพรรษา (ต้อง login) | userId @unique → User |
| `Form_return` | ฟอร์มส่งคืนข้อมูล | organizationName, numberOfSigners, image1-2 |
| `Organization` | ข้อมูลองค์กรเข้าร่วม | phoneNumber @unique, numberOfSigners, image1-5 |
| `OrganizationCategory` | Master data ชื่อองค์กร | name @unique, categoryType, isActive |
| `User` | ผู้ใช้งาน | role default "member", resetToken fields |

> **ลบแล้ว**: `Buddhist2025`, `GroupCategory` (mock data เท่านั้น)

---

## Architecture: Server Actions (ไม่ใช้ API Routes สำหรับ data)

```
<module>/actions/Get.ts     — query DB (prisma singleton จาก @/app/lib/db)
<module>/actions/Post.ts    — create + validation + revalidatePath
<module>/actions/Update.ts  — update + validation
<module>/actions/Delete.ts  — delete + revalidatePath
```

**API Routes ที่เหลือ** — NextAuth, auth, campaign-buddhist-lent, users/admin เท่านั้น  
**ลบแล้ว**: `/api/soberCheers`, `/api/soberCheersCharts`, `/api/dashboard`, `/api/table`

---

## Year Filtering — Pattern เดียวกัน 3 โมดูล

ทั้ง SoberCheers, Organization, Form Return ใช้ pattern เดียวกัน:

```ts
// Filter by createdAt year ใน action
function yearWhere(year?: number) {
  if (!year) return {};
  return { createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year+1}-01-01`) } };
}

// Available years = DB years + currentYear (client ensures currentYear always present)
getAvailableSoberCheersYears()   // app/dashboard/soberCheers/actions/GetChartData.ts
getAvailableOrganizationYears()  // app/organization/actions/Get.ts
getAvailableFormReturnYears()    // app/dashboard/form_return/actions/GetChartData.ts
```

**Year tabs แสดงอัตโนมัติ** — เพิ่มปีใหม่ไม่ต้องแก้โค้ด  
**Client ต้อง merge currentYear เสมอ** เพราะ server timezone อาจต่างกัน:
```tsx
setYears([...new Set([...availYears, currentYear])].sort());
```

---

## SoberCheers Form Design (create & edit)

ฟอร์ม `create` และ `edit` ใช้ design เดียวกัน:
- White card `rounded-2xl border` แบ่ง 6 sections ด้วย `divide-y`
- **เพศ** — pill buttons 3 ปุ่ม (ไม่ใช้ radio)
- **ตำบล** — autocomplete dropdown พร้อม outside-click-close ด้วย `useRef`
- **แรงจูงใจ** — grid 2 cols toggle buttons (ไม่ใช้ checkbox list)
- **ผลกระทบ** — toggle buttons เต็มความกว้าง
- **Conditional fields** (drinkingFrequency/monthlyExpense/intentPeriod) — แสดงด้วย left border amber
- **Success state** — CheckCircle2 icon แล้ว redirect อัตโนมัติ 1.5 วินาที

---

## Sidebar Menu Structure

```
ADMIN PANEL
├── 🏢 องค์กรเข้าร่วม เข้าพรรษา    → /dashboard/organization (year tabs)
├── 🍷 Sober Cheers                 → /dashboard/soberCheers (year tabs)
│   ├── Dashboard
│   ├── ข้อมูลผู้เข้าร่วม           → soberTable (year tabs)
│   └── ลงทะเบียน                   → /soberCheers/create
├── 📋 Form Return Management
│   ├── Dashboard                   → /dashboard/form_return (year tabs unified)
│   ├── ตารางข้อมูลการคืนฟอร์ม
│   └── คืนข้อมูลงดเหล้าเข้าพรรษา  → /dashboard/formReturn (3 year tabs: 2024/2025/2026)
└── ⚙️ Settings → จัดการผู้ดูแลระบบ
```

---

## Authentication & Middleware

```ts
// middleware.ts — ป้องกัน /dashboard/*
// ต้อง role = "admin" ไม่งั้น redirect → /auth/signin
```
- Roles: `member` (default), `admin`
- Password reset ผ่าน nodemailer email token

---

## Shared Loading Component

```tsx
import Loading from '@/components/ui/Loading';

<Loading />                      // inline, amber, md
<Loading size="lg" />
<Loading color="gray" />
<Loading text="กำลังโหลด..." />
<Loading fullPage />             // overlay backdrop-blur
```

Route-level `loading.tsx`: `dashboard/`, `dashboard/soberCheers/`, `dashboard/organization/`, `soberCheers/`, `organization/`, `form_return/`

---

## Environment Variables

```env
DATABASE_URL="mysql://root:root@localhost:3306/Buddhist-T2?schema=public"
NEXTAUTH_URL="http://localhost:3000/"         # prod: https://healthy-sobriety.sdnthailand.com
NEXTAUTH_SECRET="..."
EMAIL_USER="sobrietyhealthy@gmail.com"
EMAIL_PASS="..."
```

---

## Known Rules & Patterns

- **TambonSearch** → import จาก `@/components/form-return/TambonSearch`, ใช้ `RegionData` type
- **Organization forms** → `zipcode` ต้อง `location.zipcode?.toString() || ''`
- **CSS globals.css** → `@import leaflet` ต้องอยู่ก่อน `@tailwind base` (Turbopack strict)
- **layout.tsx** → `<html suppressHydrationWarning>` ป้องกัน browser extension hydration error
- **Form Return year title** → `new Date().getFullYear() + 543` = พ.ศ. อัตโนมัติ
- **formReturn page** → แสดง 3 tabs (currentYear/previousYear/twoYearsAgo) dynamic ไม่ hardcode
- **numberOfSigners** (Form Return) → ต้องมากกว่า 1 (> 1) ทั้ง frontend และ backend
- **motivations field** → `Json` type ใน Prisma, ต้อง `JSON.parse()` ถ้ามาจาก legacy data
- **organization Get.ts** → ใช้ `new PrismaClient()` + `finally disconnect` (ต่างจากโมดูลอื่น)
- **Year client-side merge** → `setYears([...new Set([...serverYears, currentYear])].sort())` เสมอ
