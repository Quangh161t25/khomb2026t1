export function getTodayYmd() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toYMD(input) {
  if (!input) return '';
  if (input instanceof Date && !isNaN(input.getTime())) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, '0');
    const d = String(input.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const v = String(input).trim().split(' ')[0];
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(v)) {
    const [y, m, d] = v.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) {
    const [d, m, y] = v.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

export function formatYmdToDmy(ymd) {
  if (!ymd) return '';
  const v = String(ymd).trim().split(' ')[0];
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) return v;
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(v)) {
    const [y, m, d] = v.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return v;
}

export function parseDmyToYmd(dmy) {
  return toYMD(dmy);
}

export function shiftDate(ymdString, days) {
  const base = ymdString ? toYMD(ymdString) : getTodayYmd();
  let d;
  if (base && /^\d{4}-\d{2}-\d{2}$/.test(base)) {
    const [y, m, day] = base.split('-').map(Number);
    d = new Date(y, m - 1, day + days);
  } else {
    d = new Date();
    d.setDate(d.getDate() + days);
  }
  return toYMD(d);
}

export function getCurrentWeekRangeYmd() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  const end = new Date(now.getFullYear(), now.getMonth(), diff + 6);
  return { from: toYMD(start), to: toYMD(end) };
}

export function getCurrentMonthRangeYmd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toYMD(start), to: toYMD(end) };
}

export function formatDateTimeNow() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}



