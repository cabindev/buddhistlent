// lib/utils/date.ts
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  };
  
  return d.toLocaleDateString('th-TH', options);
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  };
  
  return d.toLocaleDateString('th-TH', options);
}