// ═══════════════════════════════════════════════════════════════
// JIANCHA DEMO HR — เดโม่ระบบ HR ฟูลฟังก์ชัน (แยกจาก production เดิม 100%)
// โครงเมนูอิง ByteHR: Dashboard · พนักงาน · กะ · ลงเวลา · คำขอ ·
// วันลา · เงินเดือน · ประกาศ · QR สาขา · รายงาน · ตั้งค่า
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;
const DATA = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '3mb' })); // เผื่อรูปถ่ายยืนยันตอนลงเวลา (base64)
app.use(cookieParser('jc-byte-demo'));
app.use(express.static(path.join(__dirname, 'public')));
// ── CORS: ให้แอปมือถือ (bundle ในเครื่อง) เรียก API ข้าม origin ได้ ──
app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }; // วันที่ตามเวลาท้องถิ่น (กัน UTC เพี้ยนช่วงเช้ามืด)
const dOf = ts => iso(new Date(ts)); // วันที่ (ท้องถิ่น) ของ timestamp
const now = () => new Date().toISOString();

// ── SEED: ข้อมูลตัวอย่างครบทุกเมนู ──
function seed() {
  const t = new Date();
  const day = n => iso(new Date(t.getTime() - n * 86400000));
  const month = t.toISOString().slice(0, 7);
  const lastMonth = new Date(t.getFullYear(), t.getMonth() - 1, 15).toISOString().slice(0, 7);
  const prevMonth = new Date(t.getFullYear(), t.getMonth() - 2, 15).toISOString().slice(0, 7);

  const E = (id, name, no, role, dept, branch, pin, birth, hire, phone, pay, bank, acct) => ({
    id, name, employee_no: no, role, dept, branch_id: branch, pin, birth_date: birth, hire_date: hire, phone,
    pay, bank, bank_account: acct, status: 'active',
    leave: { sick: { total: 30, used: 3 }, personal: { total: 3, used: 1 }, vacation: { total: 6, used: 2 },
      maternity: { total: 98, used: 0 }, ordination: { total: 15, used: 0 } },
  });
  const employees = [
    E('e1', 'สมชาย ใจดี', '900001', 'บาริสต้า', 'Operations', 'b2', '111111', '1998-08-21', '2024-03-01', '0811111111', 15000, 'KBANK', '045-1-11111-1'),
    E('e2', 'น้องแพรว วรรณดี', '900002', 'หัวหน้าสาขา', 'Operations', 'b2', '222222', '1996-02-14', '2023-06-15', '0822222222', 22000, 'SCB', '234-2-22222-2'),
    E('e3', 'กัญภัคภัชสร ภาคสุวรรณ', '900003', 'Web Application & PMO Supervisor', 'Information Technology', 'b1', '333333', '1997-05-22', '2025-10-27', '0634515323', 45000, 'KBANK', '045-3-33333-3'),
    E('e4', 'ต่อพงศ์ ศิริลักษณ์', '900004', 'IT Support', 'Information Technology', 'b1', '444444', '1995-08-30', '2025-01-10', '0844444444', 28000, 'BBL', '101-4-44444-4'),
    E('e5', 'ทรรศนวรรณ นาคนุ', '900005', 'Head Of Human Resource', 'Human Resource', 'b1', '555555', '1993-11-02', '2025-10-27', '0974241915', 55000, 'KBANK', '045-5-55555-5'),
    E('e6', 'มินตรา แสงทอง', '900006', 'บาริสต้า', 'Operations', 'b2', '666666', '2000-08-05', '2025-05-01', '0866666666', 15000, 'KTB', '678-6-66666-6'),
  ];
  const persona = { e1: ['ชาย', 'โสด'], e2: ['หญิง', 'โสด'], e3: ['หญิง', 'โสด'], e4: ['ชาย', 'สมรส'], e5: ['หญิง', 'สมรส'], e6: ['หญิง', 'โสด'] };
  // ระดับตำแหน่ง: staff < supervisor < manager < director
  const levels = { e1: 'staff', e2: 'manager', e3: 'manager', e4: 'staff', e5: 'director', e6: 'staff' };
  const nick = { e1: 'ชาย', e2: 'แพรว', e3: 'กัญ', e4: 'ต่อ', e5: 'ทรรศ', e6: 'มิน' };
  // พนักงานที่มีสิทธิ์เข้าหลังบ้าน (เลือก Role Admin/Employee ตอนล็อกอิน)
  const admins = ['e5', 'e3'];
  const nameEn = { e1: 'Somchai Jaidee', e2: 'Praew Wandee', e3: 'Kanphakphatsorn Phaksuwan', e4: 'Torpong Siriluck', e5: 'Thatsanawan Naknu', e6: 'Mintra Saengthong' };
  employees.forEach((e, i) => {
    const [g, m] = persona[e.id] || ['-', '-'];
    e.level = levels[e.id] || 'staff';
    e.gender = g; e.marital = m; e.nationality = 'ไทย';
    e.nickname = nick[e.id] || '';
    e.name_en = nameEn[e.id] || '';
    e.is_admin = admins.includes(e.id);
    // เลขบัตรประชาชนเดโม่ — 4 ตัวท้าย (000X) ใช้ล็อกอินแอปพนักงานคู่กับเบอร์โทร
    e.national_id = '0-' + e.employee_no.slice(0, 4) + '-00000-00-' + (i + 1);
    e.email = 'emp' + e.employee_no + '@jcbyte-demo.co.th';
    e.tax_no = '0-' + e.employee_no.slice(0, 4) + '-56789-01-2';
    e.sso_no = '11-' + e.employee_no + '-90';
    e.address = e.branch_id === 'b1' ? 'เขตปทุมวัน กรุงเทพมหานคร' : 'อ.บางใหญ่ จ.นนทบุรี';
  });

  const shifts = [];
  const SHIFT = { morning: ['09:00', '18:00'], late: ['12:00', '21:00'] };
  for (let n = -7; n <= 7; n++) {
    const date = iso(new Date(t.getTime() + n * 86400000));
    const dow = new Date(date).getDay();
    if (dow === 0) continue; // อาทิตย์หยุด
    for (const e of employees) {
      const s = (e.id === 'e6') ? 'late' : 'morning';
      shifts.push({ id: `sh-${e.id}-${date}`, emp_id: e.id, date, name: s === 'morning' ? 'กะเช้า' : 'กะบ่าย', start: SHIFT[s][0], end: SHIFT[s][1] });
    }
  }

  const checkins = [];
  for (let n = 7; n >= 1; n--) {
    const date = iso(new Date(t.getTime() - n * 86400000));
    if (new Date(date).getDay() === 0) continue;
    for (const e of employees) {
      if (e.id === 'e1' && n === 3) continue; // สมชายขาด 1 วัน
      const late = (e.id === 'e6' && n % 2) ? 22 : 0;
      checkins.push({ id: `ck-${e.id}-${date}-i`, emp_id: e.id, type: 'in', method: n % 3 ? 'gps' : 'qr', note: '', at: `${date}T0${9 + (late ? 0 : 0)}:${String(late || 0).padStart(2, '0')}:00.000Z`, late_min: late });
      checkins.push({ id: `ck-${e.id}-${date}-o`, emp_id: e.id, type: 'out', method: 'gps', note: '', at: `${date}T18:0${n % 6}:00.000Z`, late_min: 0 });
    }
  }

  const payslips = [];
  for (const m of [prevMonth, lastMonth]) {
    for (const e of employees) {
      const sso = Math.min(Math.round(e.pay * 0.05), 750);
      const ot = e.id === 'e1' ? 800 : 0;
      payslips.push({ id: `ps-${e.id}-${m}`, emp_id: e.id, month: m, base: e.pay, ot, sso, tax: e.pay > 26000 ? Math.round((e.pay - 26000) * 0.05) : 0, net: e.pay + ot - sso - (e.pay > 26000 ? Math.round((e.pay - 26000) * 0.05) : 0) });
    }
  }

  return {
    company: { name: 'JIANCHA DEMO HR Co., Ltd.', payday: 28, sso_rate: 5, sso_cap: 750 },
    branches: [
      { id: 'b1', name: 'Head Office สำนักงานใหญ่', lat: 13.7563, lng: 100.5018, radius: 120, qr_token: crypto.randomBytes(8).toString('hex') },
      { id: 'b2', name: 'Central Westgate', lat: 13.8770, lng: 100.4110, radius: 90, qr_token: crypto.randomBytes(8).toString('hex') },
    ],
    leave_types: [
      { key: 'sick', name: 'ลาป่วย', days: 30, paid: true },
      { key: 'personal', name: 'ลากิจ', days: 3, paid: true },
      { key: 'vacation', name: 'ลาพักร้อน', days: 6, paid: true },
      { key: 'maternity', name: 'ลาคลอด', days: 98, paid: true },
      { key: 'ordination', name: 'ลาอุปสมบท', days: 15, paid: false },
    ],
    employees, shifts, checkins, payslips,
    leaves: [
      { id: 'lv1', emp_id: 'e1', type: 'sick', from: day(3), to: day(3), days: 1, reason: 'ไข้หวัด มีใบรับรองแพทย์', status: 'pending', at: now() },
      { id: 'lv2', emp_id: 'e6', type: 'vacation', from: day(-4), to: day(-3), days: 2, reason: 'กลับบ้านต่างจังหวัด', status: 'pending', at: now() },
      { id: 'lv3', emp_id: 'e2', type: 'personal', from: day(10), to: day(10), days: 1, reason: 'ติดต่อราชการ', status: 'approved', at: now() },
    ],
    ot: [
      { id: 'ot1', emp_id: 'e1', date: day(1), hours: 2, reason: 'ปิดยอดสิ้นวัน', status: 'pending', at: now() },
      { id: 'ot2', emp_id: 'e6', date: day(2), hours: 3, reason: 'จัดของเข้าสาขา', status: 'approved', at: now() },
    ],
    claims: [
      { id: 'cl1', emp_id: 'e4', title: 'ค่าเดินทางไปซ่อมเครื่องสาขา', amount: 350, status: 'pending', at: now() },
    ],
    announcements: [
      { id: 'a1', title: 'ยินดีต้อนรับสู่ JIANCHA DEMO HR (เดโม่)', body: 'ระบบทดลองฟูลฟังก์ชัน แยกจากระบบจริง กดเล่นได้ทุกเมนู ข้อมูลเป็นตัวอย่างทั้งหมด', at: now() },
      { id: 'a2', title: 'เงินเดือนออกวันที่ 28 นี้', body: 'สลิปจะเด้งเข้าแอปอัตโนมัติหลังปิดงวด', at: now() },
    ],
    recruitment: [
      { id: 'rc1', name: 'ปวีณา สุขใจ', position: 'บาริสต้า', branch: 'Central Westgate', stage: 'สัมภาษณ์', applied: day(5), phone: '0891112222', expected: 15500 },
      { id: 'rc2', name: 'ธนกร วัฒนชัย', position: 'IT Support', branch: 'Head Office', stage: 'คัดกรองใบสมัคร', applied: day(2), phone: '0893334444', expected: 26000 },
      { id: 'rc3', name: 'อรทัย บุญมาก', position: 'หัวหน้าสาขา', branch: 'Central Westgate', stage: 'เสนอสัญญา', applied: day(12), phone: '0895556666', expected: 23000 },
      { id: 'rc4', name: 'จิรายุ พงศ์พันธ์', position: 'บาริสต้า', branch: 'Central Westgate', stage: 'ไม่ผ่าน', applied: day(20), phone: '0897778888', expected: 16000 },
    ],
    admin_pw: 'byte@2026',
  };
}
function load() { if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, JSON.stringify(seed(), null, 2)); return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
function save(db) { fs.writeFileSync(DATA + '.tmp', JSON.stringify(db, null, 2)); fs.renameSync(DATA + '.tmp', DATA); }

function setSess(res, o) { res.cookie('s', JSON.stringify(o), { signed: true, httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 }); } // จำล็อกอิน 30 วัน
// ── token สำหรับแอปมือถือ (HMAC-signed · ไม่ต้องพึ่ง cookie ข้าม origin) ──
const signTok = s => crypto.createHmac('sha256', 'jc-byte-demo').update(s).digest('hex').slice(0, 32);
function makeToken(o) { const p = Buffer.from(JSON.stringify(o)).toString('base64url'); return p + '.' + signTok(p); }
function readToken(t) {
  const [p, sig] = String(t || '').split('.');
  if (!p || sig !== signTok(p)) return null;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()); } catch { return null; }
}
function sess(req) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) { const s = readToken(h.slice(7)); if (s) return s; }
  if (req.query && req.query.t) { const s = readToken(req.query.t); if (s) return s; } // สำหรับลิงก์เปิดหน้า (เช่น สลิป PDF)
  try { return JSON.parse(req.signedCookies.s || 'null'); } catch { return null; }
}
const dist = (a, b, c, d) => { const R = 6371e3, r = x => x * Math.PI / 180;
  const p = r(c - a), q = r(d - b), s = Math.sin(p / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(q / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))); };
const nm = (db, id) => db.employees.find(e => e.id === id)?.name || id;
// ── ลำดับการอนุมัติ: manager อนุมัติตำแหน่งต่ำกว่าในแผนกตัวเอง · เหนือ manager อนุมัติ manager ได้ทุกแผนก ──
const LEVEL_RANK = { staff: 1, supervisor: 2, manager: 3, director: 4 };
const rank = e => LEVEL_RANK[e?.level] || 1;
function canApprove(approver, target) {
  if (!approver || !target || approver.id === target.id) return false;
  const ra = rank(approver), rt = rank(target);
  if (ra <= rt) return false;                    // อนุมัติได้เฉพาะตำแหน่งที่ต่ำกว่า
  if (ra >= 4) return true;                      // director/head อนุมัติได้ทุกแผนก (รวม manager)
  if (ra === 3) return approver.dept === target.dept; // manager ล็อกเฉพาะแผนกตัวเอง
  return false;
}
function applyDecision(db, kind, it, status, byName, comment) {
  it.status = status === 'approved' ? 'approved' : 'rejected';
  it.approved_by = byName; it.comment = String(comment || ''); it.decided_at = now();
  if (kind === 'leave' && it.status === 'approved') {
    const e = db.employees.find(x => x.id === it.emp_id);
    if (e?.leave[it.type]) e.leave[it.type].used += it.days;
  }
}

// ═══ AUTH ═══
const digits = v => String(v || '').replace(/\D/g, '');
const id4 = e => digits(e.national_id || e.tax_no).slice(-4);
app.post('/api/login', (req, res) => {
  const { pin, password, phone, id_last4, as } = req.body || {};
  const db = load();
  if (password === db.admin_pw) { const o = { role: 'admin' }; setSess(res, o); return res.json({ role: 'admin', token: makeToken(o) }); }
  // ── ล็อกอินพนักงาน 2 ขั้น (flow หลัก): เลข 4 ตัวท้ายบัตรประชาชน → PIN พนักงาน 6 หลัก ──
  // พนักงานที่มี is_admin จะได้เลือก Role (Admin/Employee) เป็นขั้นที่ 3
  if (id_last4 && !phone) {
    const matches = db.employees.filter(e => e.status !== 'resigned' && id4(e) === digits(id_last4));
    if (!matches.length) return res.status(401).json({ error: 'ไม่พบเลขท้ายบัตรนี้ในระบบ — ติดต่อ HR เพื่อลงทะเบียน' });
    if (!pin) return res.json({ step: 'pin', nickname: matches[0].nickname || matches[0].name.split(' ')[0] });
    const e = matches.find(x => x.pin === String(pin));
    if (!e) return res.status(401).json({ error: 'PIN ไม่ถูกต้อง' });
    if (as === 'admin') {
      if (!e.is_admin) return res.status(403).json({ error: 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ — ติดต่อ HR' });
      const o = { role: 'admin', id: e.id }; setSess(res, o);
      return res.json({ role: 'admin', name: e.name, token: makeToken(o) });
    }
    if (e.is_admin && !as) return res.json({ step: 'role', nickname: e.nickname || e.name.split(' ')[0], name: e.name });
    const o = { role: 'employee', id: e.id }; setSess(res, o);
    return res.json({ role: 'employee', name: e.name, token: makeToken(o) });
  }
  // ── flow สำรอง: เบอร์โทร → เลข 4 ตัวท้ายบัตรประชาชน ──
  if (phone) {
    const e = db.employees.find(x => digits(x.phone) === digits(phone) && x.status !== 'resigned');
    if (!e) return res.status(401).json({ error: 'ไม่พบเบอร์นี้ในระบบ — ติดต่อ HR เพื่อลงทะเบียน' });
    if (!id_last4) return res.json({ step: 'verify', nickname: e.nickname || e.name.split(' ')[0] });
    if (digits(id_last4) !== id4(e)) return res.status(401).json({ error: 'เลข 4 ตัวท้ายไม่ถูกต้อง' });
    const o = { role: 'employee', id: e.id }; setSess(res, o);
    return res.json({ role: 'employee', name: e.name, token: makeToken(o) });
  }
  const e = db.employees.find(x => x.pin === String(pin || password || ''));
  if (!e) return res.status(401).json({ error: 'PIN ไม่ถูกต้อง' });
  const o = { role: 'employee', id: e.id }; setSess(res, o);
  res.json({ role: 'employee', name: e.name, token: makeToken(o) });
});
app.get('/api/ping', (req, res) => res.json({ ok: true, name: 'JC People', company: load().company.name }));
app.post('/api/logout', (req, res) => { res.clearCookie('s'); res.json({ ok: true }); });

// ═══ ฝั่งพนักงาน ═══
function me(req, res) { const s = sess(req); if (!s || s.role !== 'employee') { res.status(401).json({ error: 'login' }); return null; }
  const db = load(); return { db, emp: db.employees.find(e => e.id === s.id) }; }

app.get('/api/me/dashboard', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  const month = iso(new Date()).slice(0, 7);
  const today = iso(new Date());
  const myOt = db.ot.filter(o => o.emp_id === emp.id && o.date.startsWith(month) && o.status === 'approved').reduce((t, o) => t + o.hours, 0);
  const pending = ['leaves', 'ot', 'claims'].reduce((n, k) => n + db[k].filter(x => x.emp_id === emp.id && x.status === 'pending').length, 0);
  const todayCk = db.checkins.filter(x => x.emp_id === emp.id && dOf(x.at) === today);
  const m = new Date().getMonth();
  const myBranch = db.branches.find(b => b.id === emp.branch_id);
  res.json({
    name: emp.name, role: emp.role, branch: myBranch?.name,
    nickname: emp.nickname || '', name_en: emp.name_en || '', phone: emp.phone || '', photo: emp.photo || '',
    email: emp.email || '', national_id: emp.national_id || '', contract: emp.contract || 'Full Time',
    branch_geo: myBranch ? { lat: myBranch.lat, lng: myBranch.lng, radius: myBranch.radius } : null,
    employee_no: emp.employee_no, dept: emp.dept, hire_date: emp.hire_date, pay: emp.pay, payday: db.company.payday,
    approver: rank(emp) >= 3, level: emp.level || 'staff',
    leave: emp.leave, ot_hours_month: myOt, pending_requests: pending,
    today: { in: todayCk.find(x => x.type === 'in')?.at || null, out: todayCk.filter(x => x.type === 'out').pop()?.at || null },
    shift_today: db.shifts.find(s => s.emp_id === emp.id && s.date === today) || null,
    announcements: db.announcements.slice(-3).reverse(),
    birthdays: db.employees.filter(e => e.birth_date && new Date(e.birth_date).getMonth() === m).map(e => ({ name: e.name, day: new Date(e.birth_date).getDate() })),
  });
});
app.post('/api/checkin', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  const { lat, lng, qr_token, type, photo, offsite, reason, place } = req.body || {};
  const br = db.branches.find(b => b.id === emp.branch_id);
  let method, note, isOffsite = false;
  if (qr_token) {
    const hit = db.branches.find(b => b.qr_token === qr_token);
    if (!hit) return res.status(400).json({ error: 'QR ไม่ถูกต้อง' });
    method = 'qr'; note = hit.name;
  } else if (lat && lng) {
    const d = dist(+lat, +lng, br.lat, br.lng);
    if (d > br.radius) {
      // เช็คอินนอกสถานที่: ต้องแจ้งเหตุผล — บันทึกพิกัด/ชื่อสถานที่จริงให้ HR ตรวจ
      if (!offsite) return res.status(400).json({ error: `อยู่นอกระยะ (${d.toLocaleString()} ม. / รัศมี ${br.radius} ม.)`, out_of_range: true, distance: d });
      if (!String(reason || '').trim()) return res.status(400).json({ error: 'เช็คอินนอกสถานที่ต้องระบุเหตุผล' });
      isOffsite = true;
      method = 'gps';
      note = `นอกสถานที่: ${String(place || '').trim() || `${d.toLocaleString()} ม. จาก ${br.name}`} · ${String(reason).trim()}`;
    } else { method = 'gps'; note = `${d} ม. จาก ${br.name}`; }
  } else return res.status(400).json({ error: 'ไม่มีพิกัดหรือ QR' });
  const shift = db.shifts.find(s => s.emp_id === emp.id && s.date === iso(new Date()));
  let late = 0;
  if (type !== 'out' && shift && shift.start) {
    const sched = new Date(`${shift.date}T${shift.start}:00`);
    late = Math.max(0, Math.round((Date.now() - sched) / 60000));
  }
  const rec = { id: 'ck' + Date.now(), emp_id: emp.id, type: type === 'out' ? 'out' : 'in', method, note, at: now(), late_min: late };
  if (isOffsite) { rec.offsite = true; rec.lat = +lat; rec.lng = +lng; }
  // รูปถ่ายยืนยันตอนลงเวลา (data URL — จำกัดขนาดกันไฟล์บวม)
  if (typeof photo === 'string' && photo.startsWith('data:image/') && photo.length < 400000) rec.photo = photo;
  db.checkins.push(rec); save(db);
  res.json({ ok: true, rec });
});
app.get('/api/me/requests', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  res.json({
    leaves: db.leaves.filter(l => l.emp_id === emp.id).reverse(),
    ot: db.ot.filter(o => o.emp_id === emp.id).reverse(),
    claims: db.claims.filter(x => x.emp_id === emp.id).reverse(),
    types: db.leave_types,
  });
});
app.post('/api/me/requests', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  const { kind } = req.body || {};
  if (kind === 'leave') {
    const { type, from, to, days, reason } = req.body;
    if (!type || !from || !to) return res.status(400).json({ error: 'กรอกให้ครบ' });
    db.leaves.push({ id: 'lv' + Date.now(), emp_id: emp.id, type, from, to, days: +days || 1, reason: String(reason || ''), status: 'pending', at: now() });
  } else if (kind === 'ot') {
    const { date, hours, reason } = req.body;
    db.ot.push({ id: 'ot' + Date.now(), emp_id: emp.id, date, hours: +hours || 1, reason: String(reason || ''), status: 'pending', at: now() });
  } else if (kind === 'claim') {
    const { title, amount } = req.body;
    db.claims.push({ id: 'cl' + Date.now(), emp_id: emp.id, title: String(title || ''), amount: +amount || 0, status: 'pending', at: now() });
  } else return res.status(400).json({ error: 'kind?' });
  save(db); res.json({ ok: true });
});
// คิวรออนุมัติของหัวหน้า (ตามกติกา canApprove)
app.get('/api/me/approvals', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  if (rank(emp) < 3) return res.json({ approver: false, leaves: [], ot: [], claims: [] });
  const mine = list => list.filter(x => x.status === 'pending' && canApprove(emp, db.employees.find(e => e.id === x.emp_id)));
  res.json({
    approver: true,
    leaves: mine(db.leaves).map(l => ({ ...l, name: nm(db, l.emp_id), type_name: db.leave_types.find(t => t.key === l.type)?.name || l.type })),
    ot: mine(db.ot).map(o => ({ ...o, name: nm(db, o.emp_id) })),
    claims: mine(db.claims).map(x => ({ ...x, name: nm(db, x.emp_id) })),
  });
});
app.post('/api/me/approve', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  const { kind, id, status, comment } = req.body || {};
  const list = { leave: db.leaves, ot: db.ot, claim: db.claims }[kind];
  const it = list?.find(x => x.id === id);
  if (!it) return res.status(404).json({ error: 'ไม่พบรายการ' });
  if (it.status !== 'pending') return res.status(409).json({ error: 'รายการนี้ตัดสินไปแล้ว' });
  const target = db.employees.find(e => e.id === it.emp_id);
  if (!canApprove(emp, target)) return res.status(403).json({ error: 'ไม่มีสิทธิ์อนุมัติรายการนี้ (คนละแผนกหรือตำแหน่งไม่ต่ำกว่า)' });
  applyDecision(db, kind, it, status, emp.name, comment);
  save(db); res.json({ ok: true });
});
app.get('/api/me/payslips', (req, res) => {
  const c = me(req, res); if (!c) return;
  res.json(c.db.payslips.filter(p => p.emp_id === c.emp.id).reverse());
});
// หน้าสลิปเต็มรูปแบบ (พิมพ์/บันทึก PDF ได้) — เปิดจากแอปพนักงาน
app.get('/api/me/payslip-print', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c;
  const month = String(req.query.month || '');
  const p = db.payslips.find(x => x.emp_id === emp.id && x.month === month);
  if (!p) return res.status(404).send('ไม่พบสลิปงวดนี้');
  const year = month.slice(0, 4);
  const past = db.payslips.filter(x => x.emp_id === emp.id && x.month.startsWith(year) && x.month <= month);
  const ytd = {
    earn: past.reduce((n, x) => n + x.base + x.ot + (x.allow_pos || 0) + (x.allow_living || 0) + (x.bonus || 0), 0),
    tax: past.reduce((n, x) => n + x.tax, 0),
    sso: past.reduce((n, x) => n + x.sso, 0),
  };
  const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const [y, m] = month.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  const money = n => (+n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const L = (th, en) => `<div class="l1">${th}</div><div class="l2">${en}</div>`;
  const row = (th, en, v) => `<tr><td>${L(th, en)}</td><td class="amt">${v}</td></tr>`;
  res.send(`<!doctype html><html lang="th"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pay Slip ${month} · ${esc(emp.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#e9e4d8;font-family:"IBM Plex Sans Thai",sans-serif;color:#1a1712;padding:14px}
.sheet{background:#fff;max-width:860px;margin:0 auto;padding:22px;border-radius:10px;box-shadow:0 8px 30px -12px rgba(0,0,0,.25);font-size:.74rem;position:relative}
.s2head{display:grid;grid-template-columns:1.35fr auto 1fr;gap:18px;align-items:start;margin-bottom:14px}
.s2co b{font-size:.85rem;color:#000}.s2logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:0;pointer-events:none}.s2logo img{height:80px;opacity:.4}
.s2meta h3{margin:0 0 8px;font-size:1rem;text-align:right;font-weight:800;color:#000}
.kv2{display:grid;grid-template-columns:104px 1fr;gap:0 10px;margin-top:6px;font-size:.7rem;align-items:start}
.kv2 span{color:#000;line-height:1.25}.kv2 i{font-size:.6rem;color:#555;font-style:normal;font-weight:400}
.kv2 b{font-weight:700;font-size:.72rem;white-space:nowrap;text-align:left;color:#000}
.s2meta .kv2{grid-template-columns:104px 1fr}.s2meta .kv2 b{text-align:left}
.s2cols{display:grid;grid-template-columns:1fr 1fr 1fr;border:1.5px solid #1a1712}
.s2cols table{border-collapse:collapse;width:100%}
.s2cols table:not(:last-child){border-right:1px solid #1a1712}
th{border-bottom:1px solid #1a1712;padding:5px;font-size:.7rem;text-align:center;color:#000}
th i{font-size:.58rem;color:#555;font-style:normal;font-weight:400}
td{padding:5px 8px;vertical-align:top}
td.amt{text-align:right;font-family:"IBM Plex Mono",monospace;font-size:.72rem;white-space:nowrap;color:#000}
.l1{font-size:.7rem;color:#000}.l2{font-size:.56rem;color:#555}
tr.sep td{border-top:1px solid #1a1712}
tr.net2 td{font-weight:800}tr.net2 .l1{font-size:.8rem}
.s2foot{display:flex;justify-content:space-between;margin-top:12px;font-size:.7rem;color:#000}
.s2foot i{font-size:.58rem;color:#555;font-style:normal}
.sig{text-align:right}.sig .line{display:block;border-bottom:1px solid #1a1712;width:200px;margin-top:26px}
.s2legal{border-top:1px solid #ccc;margin-top:12px;padding-top:6px;text-align:center;font-size:.56rem;color:#444}
.s2legal i{font-style:normal;color:#666}
.bar{max-width:860px;margin:0 auto 12px;display:flex;gap:10px;justify-content:space-between}
.bar button{font:inherit;font-weight:700;padding:11px 18px;border-radius:12px;border:1px solid #d5cdbc;background:#fff;cursor:pointer}
.bar .p{background:#221f19;color:#fff;border-color:#221f19}
@media screen and (max-width:720px){.s2cols{grid-template-columns:1fr}.s2cols table:not(:last-child){border-right:0;border-bottom:1px solid #1a1712}.s2head{grid-template-columns:1fr;text-align:left}.s2meta h3{text-align:left}}
@media print{
@page{size:A4 landscape;margin:8mm}
body{background:#fff;padding:0}.bar{display:none}
.sheet{box-shadow:none;border-radius:0;max-width:100%;padding:4px;font-size:.74rem}
.s2cols{grid-template-columns:1fr 1fr 1fr !important}
.s2cols table:not(:last-child){border-right:1px solid #1a1712 !important;border-bottom:0 !important}
.s2head{grid-template-columns:1.35fr auto 1fr !important;margin-bottom:8px}
td{padding:3px 6px}th{padding:4px}
.s2foot{margin-top:8px}.sig .line{margin-top:16px}.s2legal{margin-top:8px;padding-top:5px}
}
</style></head><body>
<div class="bar"><button onclick="history.back()">← กลับ</button><button class="p" onclick="print()">🖨 พิมพ์ / บันทึก PDF</button></div>
<div class="sheet">
  <div class="s2head">
    <div class="s2co"><b>${esc(db.company.name)}</b>
      <div class="kv2"><span>ชื่อนามสกุล(รหัส):<br/><i>Emp. name (Code)</i></span><b>${esc(emp.name)} (${esc(emp.employee_no)})</b></div>
      <div class="kv2"><span>ตำแหน่ง:<br/><i>Position</i></span><b>${esc(emp.role)}</b></div></div>
    <div class="s2logo"><img src="/logo-wide.png" alt="JIANCHA"/></div>
    <div class="s2meta"><h3>สลิปเงินเดือน / Pay Slip</h3>
      <div class="kv2"><span>รอบเงินเดือน:<br/><i>Payroll Period</i></span><b>01-${days} ${TH_M[m - 1]} ${y + 543}</b></div>
      <div class="kv2"><span>วันที่ชำระ:<br/><i>Payment Date</i></span><b>${db.company.payday} ${TH_M[m - 1]} ${y + 543}</b></div>
      <div class="kv2"><span>เลขที่บัญชี:<br/><i>Bank Account</i></span><b>${esc(emp.bank_account || '-')}</b></div></div>
  </div>
  <div class="s2cols">
    <table><thead><tr><th colspan="2">เงินได้<br/><i>Earnings</i></th></tr></thead><tbody>
      ${row('เงินเดือน/ค่าจ้าง', 'Salary/Wage', money(p.base))}${row('ค่าล่วงเวลา', 'Overtime', money(p.ot))}
      ${row('ค่านายหน้า', 'Commission', money(0))}${row('ค่าเบี้ยเลี้ยง/ค่าครองชีพ', 'Allowances/Cost of livings', money((p.allow_pos || 0) + (p.allow_living || 0)))}
      ${row('โบนัส', 'Bonus', money(p.bonus || 0))}${row('เงินได้อื่นๆ', 'Others', money(0))}</tbody></table>
    <table><thead><tr><th colspan="2">รายการหัก<br/><i>Deductions</i></th></tr></thead><tbody>
      ${row('ประกันสังคม', 'Social Security Fund', money(p.sso))}${row('ภาษีหัก ณ ที่จ่าย', 'Withholding tax', money(p.tax))}
      ${row('เงินกู้ยืม กยศ./กรอ.', 'Student Loan Fund', money(0))}${row('เงินประกัน', 'Deposit', money(0))}
      ${row('ขาด/ลา/มาสาย', 'Absent/Leave/Late', money(0))}${row('รายการหักอื่นๆ', 'Others', money(0))}</tbody></table>
    <table><thead><tr><th colspan="2">ปี<br/><i>${y + 543}</i></th></tr></thead><tbody>
      ${row('เงินได้สะสม', 'YTD earnings', money(ytd.earn))}${row('ภาษีหัก ณ ที่จ่ายสะสม', 'YTD Withholding tax', money(ytd.tax))}
      ${row('เงินประกันสังคมสะสม', 'Accumulated SSF', money(ytd.sso))}
      <tr class="sep"><td>${L('รวมเงินได้', 'Total earnings')}</td><td class="amt">${money(p.base + p.ot + (p.allow_pos || 0) + (p.allow_living || 0) + (p.bonus || 0))}</td></tr>
      ${row('รวมรายการหัก', 'Total deductions', money(p.sso + p.tax))}
      <tr class="net2"><td>${L('เงินได้สุทธิ', 'Net pay')}</td><td class="amt">${money(p.net)}</td></tr></tbody></table>
  </div>
  <div class="s2foot"><div>หมายเหตุ:<br/><i>Remarks</i></div>
    <div class="sig">ลายเซ็นผู้จ่ายเงิน:<br/><i>Employer's Signature</i><span class="line"></span></div></div>
  <div class="s2legal">ข้อมูลเงินเดือนและค่าจ้างเป็นข้อมูลส่วนบุคคล ห้ามเปิดเผยโดยเด็ดขาด เอกสารนี้จะสมบูรณ์เมื่อมีลายเซ็นผู้มีอำนาจลงนามและตราประทับเท่านั้น<br/>
    <i>Salary and wages are confidential information. Disclosure is strictly prohibited. This document is only valid with an authorized signature and company stamp.</i></div>
</div>
</body></html>`);
});
app.get('/api/me/calendar', (req, res) => {
  const c = me(req, res); if (!c) return;
  res.json(c.db.shifts.filter(s => s.emp_id === c.emp.id && !s.off));
});
app.get('/api/me/timesheet', (req, res) => {
  const c = me(req, res); if (!c) return;
  res.json(c.db.checkins.filter(x => x.emp_id === c.emp.id).slice(-30).reverse());
});

// ═══ หลังบ้าน ═══
function admin(req, res) { const s = sess(req); if (!s || s.role !== 'admin') { res.status(403).json({ error: 'admin only' }); return null; } return s; }

app.get('/api/admin/overview', (req, res) => {
  if (!admin(req, res)) return;
  const db = load();
  const today = iso(new Date());
  const ins = db.checkins.filter(x => dOf(x.at) === today && x.type === 'in');
  const active = db.employees.filter(e => e.status !== 'resigned');
  // ลาวันนี้ (อนุมัติแล้วและช่วงวันที่คร่อมวันนี้)
  const onLeave = db.leaves.filter(l => l.status === 'approved' && l.from <= today && l.to >= today).length;
  // อัตราการมาทำงานย้อนหลัง 7 วัน (เข้าเทียบจำนวนคนที่มีกะ)
  const last7 = [];
  for (let n = 6; n >= 0; n--) {
    const d = iso(new Date(Date.now() - n * 86400000));
    const sched = db.shifts.filter(s => s.date === d && !s.off).length;
    const came = new Set(db.checkins.filter(x => dOf(x.at) === d && x.type === 'in').map(x => x.emp_id)).size;
    last7.push({ date: d, pct: sched ? Math.round(came / sched * 100) : 0 });
  }
  const byBranch = db.branches.map(b => ({ name: b.name, count: active.filter(e => e.branch_id === b.id).length }));
  res.json({
    employees: active.length, resigned: db.employees.length - active.length, branches: db.branches.length,
    today_in: ins.length, today_late: ins.filter(x => x.late_min > 15).length, today_leave: onLeave,
    today_scheduled: db.shifts.filter(s => s.date === today && !s.off).length,
    pending: db.leaves.filter(l => l.status === 'pending').length + db.ot.filter(o => o.status === 'pending').length + db.claims.filter(x => x.status === 'pending').length,
    payroll_month: iso(new Date()).slice(0, 7),
    last7, by_branch: byBranch,
    activity: db.checkins.filter(x => dOf(x.at) === today).slice(-8).reverse().map(x => ({ name: nm(db, x.emp_id), type: x.type, at: x.at, method: x.method, late_min: x.late_min })),
  });
});
// รายการ OT ทั้งหมดในช่วงวัน สำหรับหน้า OT Review
app.get('/api/admin/ot', (req, res) => { if (!admin(req, res)) return; const db = load();
  const from = req.query.from || '0000', to = req.query.to || '9999';
  res.json(db.ot.filter(o => o.date >= from && o.date <= to)
    .map(o => ({ ...o, name: nm(db, o.emp_id), branch: db.branches.find(b => b.id === db.employees.find(e => e.id === o.emp_id)?.branch_id)?.name || '' }))
    .reverse()); });
app.get('/api/admin/employees', (req, res) => { if (!admin(req, res)) return; const db = load();
  res.json(db.employees.map(e => ({ ...e, branch: db.branches.find(b => b.id === e.branch_id)?.name }))); });
app.post('/api/admin/employees', (req, res) => { if (!admin(req, res)) return;
  const { name, employee_no, role, dept, branch_id, pay, phone, email, hire_date } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'กรอกชื่อพนักงาน' });
  const db = load();
  // ไม่กรอก PIN → สุ่มให้อัตโนมัติ (6 หลัก ไม่ซ้ำใคร) แล้วส่งกลับให้ HR แจ้งพนักงาน
  let pin = String(req.body.pin || '').trim();
  if (!pin) { do { pin = String(Math.floor(100000 + Math.random() * 900000)); } while (db.employees.some(e => e.pin === pin)); }
  const quota = {}; db.leave_types.forEach(t => quota[t.key] = { total: t.days, used: 0 });
  const obj = { id: 'e' + Date.now(), name, employee_no: employee_no || '', role: role || '', dept: dept || '',
    branch_id: branch_id || db.branches[0].id, pin: String(pin), pay: +pay || 15000, phone: phone || '',
    email: email || '', birth_date: null, hire_date: hire_date || iso(new Date()), bank: '', bank_account: '', status: 'active',
    leave: quota };
  ['tax_no', 'sso_no', 'gender', 'marital', 'nationality', 'address', 'salutation', 'name_en', 'bank', 'bank_account', 'birth_date', 'photo', 'level', 'nickname', 'national_id', 'contract', 'probation_end', 'payment_type']
    .forEach(k => { if (req.body[k]) obj[k] = String(req.body[k]); });
  ['bonus', 'allowance_pos', 'allowance_living'].forEach(k => { if (k in req.body) obj[k] = +req.body[k] || 0; });
  if (!obj.level) obj.level = 'staff';
  obj.is_admin = req.body.is_admin === true || req.body.is_admin === 'true';
  db.employees.push(obj);
  save(db); res.json({ ok: true, id: obj.id, pin, id4: (obj.national_id || obj.tax_no || '').replace(/\D/g, '').slice(-4) }); });
// แก้ไขข้อมูลพนักงาน (ปุ่มบันทึกในหน้า Employee Detail)
app.put('/api/admin/employees/:id', (req, res) => { if (!admin(req, res)) return;
  const db = load();
  const e = db.employees.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: 'not found' });
  const allow = ['name', 'employee_no', 'role', 'dept', 'branch_id', 'phone', 'email', 'bank', 'bank_account',
    'birth_date', 'hire_date', 'tax_no', 'sso_no', 'gender', 'marital', 'nationality', 'address',
    'salutation', 'name_en', 'photo', 'level', 'nickname', 'national_id', 'contract', 'status', 'probation_end', 'payment_type'];
  for (const k of allow) if (k in (req.body || {}) && req.body[k] !== null) e[k] = String(req.body[k]);
  if ('pay' in (req.body || {})) e.pay = +req.body.pay || e.pay;
  ['bonus', 'allowance_pos', 'allowance_living'].forEach(k => { if (k in (req.body || {})) e[k] = +req.body[k] || 0; });
  if ('is_admin' in (req.body || {})) e.is_admin = req.body.is_admin === true || req.body.is_admin === 'true';
  save(db); res.json({ ok: true }); });
// ── Setup กะการทำงาน: รูปแบบกะ (เพิ่ม/ลบ) + บันทึกตารางกะรายวัน ──
function patterns(db) {
  if (!db.shift_patterns) {
    db.shift_patterns = [
      { key: 'm', name: 'กะเช้า', start: '09:00', end: '18:00', brk: '12:00 – 13:00' },
      { key: 'l', name: 'กะบ่าย', start: '12:00', end: '21:00', brk: '16:00 – 17:00' },
    ];
    save(db);
  }
  return db.shift_patterns;
}
app.get('/api/admin/shift-patterns', (req, res) => { if (!admin(req, res)) return; res.json(patterns(load())); });
app.post('/api/admin/shift-patterns', (req, res) => { if (!admin(req, res)) return;
  const { name, start, end, brk } = req.body || {};
  if (!name || !start || !end) return res.status(400).json({ error: 'กรอกชื่อกะและเวลาให้ครบ' });
  const db = load(); patterns(db);
  db.shift_patterns.push({ key: 'p' + Date.now(), name: String(name), start: String(start), end: String(end), brk: String(brk || '') });
  save(db); res.json({ ok: true }); });
app.delete('/api/admin/shift-patterns/:key', (req, res) => { if (!admin(req, res)) return;
  const db = load(); patterns(db);
  if (db.shift_patterns.length <= 1) return res.status(400).json({ error: 'ต้องเหลือรูปแบบกะอย่างน้อย 1 แบบ' });
  db.shift_patterns = db.shift_patterns.filter(p => p.key !== req.params.key);
  save(db); res.json({ ok: true }); });
// บันทึกตารางกะ: days = { '2026-08-19': 'm' | 'off' } — ทับของเดิมทั้งวันนั้น
app.post('/api/admin/shifts-save', (req, res) => { if (!admin(req, res)) return;
  const { emp_id, days } = req.body || {};
  const db = load(); patterns(db);
  const e = db.employees.find(x => x.id === emp_id);
  if (!e || !days || typeof days !== 'object') return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  let saved = 0;
  for (const [date, key] of Object.entries(days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    db.shifts = db.shifts.filter(s => !(s.emp_id === emp_id && s.date === date));
    if (key === 'off') { db.shifts.push({ id: `sh-${emp_id}-${date}`, emp_id, date, name: 'หยุด', off: true, start: null, end: null }); saved++; continue; }
    const p = db.shift_patterns.find(x => x.key === key);
    if (!p) continue;
    db.shifts.push({ id: `sh-${emp_id}-${date}`, emp_id, date, name: p.name, start: p.start, end: p.end, pattern: p.key });
    saved++;
  }
  save(db); res.json({ ok: true, saved }); });
// ปฏิทินกะรายเดือนต่อคน (มุมมองแบบ Shift Schedules ของ ByteHR)
app.get('/api/admin/shift-calendar', (req, res) => { if (!admin(req, res)) return;
  const db = load();
  const emp = req.query.emp || db.employees[0].id;
  const month = req.query.month || iso(new Date()).slice(0, 7);
  const e = db.employees.find(x => x.id === emp);
  if (!e) return res.status(404).json({ error: 'no emp' });
  const [y, m] = month.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  const rows = [];
  for (let d = 1; d <= days; d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`;
    const real = db.shifts.find(s => s.emp_id === emp && s.date === date);
    if (real) { if (!real.off) rows.push({ date, name: real.name, start: real.start, end: real.end, pattern: real.pattern }); continue; }
    if (new Date(date).getDay() === 0) continue; // อาทิตย์หยุด
    const late = e.id === 'e6';
    rows.push({ date, name: late ? 'กะบ่าย' : 'กะเช้า', start: late ? '12:00' : '09:00', end: late ? '21:00' : '18:00', pattern: late ? 'l' : 'm' });
  }
  res.json({ emp: { id: e.id, name: e.name }, month, rows }); });
app.get('/api/admin/shifts', (req, res) => { if (!admin(req, res)) return; const db = load();
  const from = req.query.from || iso(new Date());
  res.json(db.shifts.filter(s => !s.off && s.date >= from && s.date <= iso(new Date(new Date(from).getTime() + 6 * 86400000)))
    .map(s => ({ ...s, name_emp: nm(db, s.emp_id) }))); });
app.get('/api/admin/timesheet', (req, res) => { if (!admin(req, res)) return; const db = load();
  const date = req.query.date || iso(new Date());
  res.json(db.checkins.filter(x => dOf(x.at) === date).map(x => ({ ...x, name: nm(db, x.emp_id) }))); });
// บันทึกเวลาแบบช่วงวัน (สำหรับ export)
app.get('/api/admin/timesheet-range', (req, res) => { if (!admin(req, res)) return; const db = load();
  const from = String(req.query.from || iso(new Date())), to = String(req.query.to || from);
  res.json(db.checkins.filter(x => { const d = dOf(x.at); return d >= from && d <= to; })
    .map(({ photo, ...x }) => ({ ...x, name: nm(db, x.emp_id) }))); });
app.get('/api/admin/approvals', (req, res) => { if (!admin(req, res)) return; const db = load();
  res.json({
    leaves: db.leaves.filter(l => l.status === 'pending').map(l => ({ ...l, name: nm(db, l.emp_id), type_name: db.leave_types.find(t => t.key === l.type)?.name || l.type })),
    ot: db.ot.filter(o => o.status === 'pending').map(o => ({ ...o, name: nm(db, o.emp_id) })),
    claims: db.claims.filter(x => x.status === 'pending').map(x => ({ ...x, name: nm(db, x.emp_id) })),
  }); });
app.post('/api/admin/approve', (req, res) => { if (!admin(req, res)) return;
  const { kind, id, status, comment } = req.body || {}; const db = load();
  const list = { leave: db.leaves, ot: db.ot, claim: db.claims }[kind];
  const it = list?.find(x => x.id === id); if (!it) return res.status(404).json({ error: 'not found' });
  if (it.status !== 'pending') return res.status(409).json({ error: 'รายการนี้ตัดสินไปแล้ว' });
  applyDecision(db, kind, it, status, 'ฝ่ายบุคคล (HR)', comment);
  save(db); res.json({ ok: true }); });
// ยกเลิกคำขอของตัวเอง (เฉพาะที่ยังรออนุมัติ) — แบบ "ยกเลิกการลา" ใน Power Apps
app.post('/api/me/requests/cancel', (req, res) => {
  const c = me(req, res); if (!c) return;
  const { db, emp } = c; const { kind, id } = req.body || {};
  const list = { leave: db.leaves, ot: db.ot, claim: db.claims }[kind];
  const it = list?.find(x => x.id === id && x.emp_id === emp.id);
  if (!it) return res.status(404).json({ error: 'ไม่พบรายการ' });
  if (it.status !== 'pending') return res.status(409).json({ error: 'ยกเลิกได้เฉพาะรายการที่รออนุมัติ' });
  it.status = 'cancelled'; it.decided_at = now();
  save(db); res.json({ ok: true }); });
// Dashboard การลาแบบ BI: KPI + ตามประเภท + ตามแผนก + Top ผู้ลา
app.get('/api/admin/leave-analytics', (req, res) => { if (!admin(req, res)) return;
  const db = load();
  const byStatus = s => db.leaves.filter(l => l.status === s).length;
  const approved = db.leaves.filter(l => l.status === 'approved');
  const byType = db.leave_types.map(t => ({ name: t.name, days: approved.filter(l => l.type === t.key).reduce((n, l) => n + l.days, 0) }));
  const deptOf = id => db.employees.find(e => e.id === id)?.dept || 'ไม่ระบุ';
  const byDept = {};
  approved.forEach(l => { byDept[deptOf(l.emp_id)] = (byDept[deptOf(l.emp_id)] || 0) + l.days; });
  const perEmp = {};
  approved.forEach(l => { perEmp[l.emp_id] = (perEmp[l.emp_id] || 0) + l.days; });
  const top = Object.entries(perEmp).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, days]) => ({ name: nm(db, id), days }));
  const t0 = new Date(); const by_month = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(t0.getFullYear(), t0.getMonth() - i, 15).toISOString().slice(0, 7);
    by_month.push({ month: m, days: approved.filter(l => (l.from || '').startsWith(m)).reduce((n, l) => n + l.days, 0) });
  }
  res.json({
    total: db.leaves.length, approved: byStatus('approved'), pending: byStatus('pending'),
    rejected: byStatus('rejected'), cancelled: byStatus('cancelled'),
    by_type: byType, by_dept: Object.entries(byDept).map(([name, days]) => ({ name, days })), top, by_month,
  }); });
app.get('/api/admin/leave-types', (req, res) => { if (!admin(req, res)) return; res.json(load().leave_types); });
app.put('/api/admin/leave-types', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const { key, days } = req.body || {};
  const t = db.leave_types.find(x => x.key === key); if (!t) return res.status(404).json({ error: 'no type' });
  t.days = +days || t.days; db.employees.forEach(e => { if (e.leave[key]) e.leave[key].total = t.days; });
  save(db); res.json({ ok: true }); });

// เงินเดือน: คำนวณงวดปัจจุบัน + ปิดงวด (สร้าง payslip) + bank file
function calcMonth(db, month) {
  return db.employees.map(e => {
    const ot = db.ot.filter(o => o.emp_id === e.id && o.date.startsWith(month) && o.status === 'approved')
      .reduce((t, o) => t + o.hours, 0) * Math.round(e.pay / 30 / 8 * 1.5);
    // เกณฑ์หักเงิน ตั้งค่าได้จากหลังบ้าน (Preferences)
    const c = db.company;
    const ssoRate = +c.sso_rate || 0, ssoCap = +c.sso_cap || 0;
    const taxTh = c.tax_threshold != null ? +c.tax_threshold : 26000;
    const taxRate = c.tax_rate != null ? +c.tax_rate : 5;
    const sso = Math.min(Math.round(e.pay * ssoRate / 100), ssoCap);
    const tax = e.pay > taxTh ? Math.round((e.pay - taxTh) * taxRate / 100) : 0;
    // เงินเพิ่ม: เบี้ยเลี้ยงตำแหน่ง / ค่าครองชีพ / โบนัส (ตั้งค่ารายคนในฟอร์มพนักงาน)
    const allow_pos = +e.allowance_pos || 0, allow_living = +e.allowance_living || 0, bonus = +e.bonus || 0;
    return { emp_id: e.id, name: e.name, bank: e.bank, bank_account: e.bank_account, month, base: e.pay, ot,
      allow_pos, allow_living, bonus, sso, tax,
      net: e.pay + ot + allow_pos + allow_living + bonus - sso - tax };
  });
}
app.get('/api/admin/payroll', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const month = req.query.month || iso(new Date()).slice(0, 7);
  const closed = db.payslips.some(p => p.month === month);
  const year = month.slice(0, 4);
  const rows = (closed ? db.payslips.filter(p => p.month === month).map(p => ({ ...p, name: nm(db, p.emp_id) })) : calcMonth(db, month))
    .map(r => {
      // ยอดสะสมทั้งปี (YTD) จากสลิปที่ปิดงวดแล้ว + งวดปัจจุบันถ้ายังไม่ปิด
      const past = db.payslips.filter(p => p.emp_id === r.emp_id && p.month.startsWith(year) && p.month <= month);
      const ytd = {
        earn: past.reduce((n, p) => n + p.base + p.ot + (p.allow_pos || 0) + (p.allow_living || 0) + (p.bonus || 0), 0) + (closed ? 0 : r.base + r.ot + r.allow_pos + r.allow_living + r.bonus),
        tax: past.reduce((n, p) => n + p.tax, 0) + (closed ? 0 : r.tax),
        sso: past.reduce((n, p) => n + p.sso, 0) + (closed ? 0 : r.sso),
      };
      return { ...r, ytd };
    });
  res.json({ month, closed, payday: db.company.payday, company: db.company.name, rows }); });
app.post('/api/admin/payroll/close', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const month = (req.body || {}).month || iso(new Date()).slice(0, 7);
  if (db.payslips.some(p => p.month === month)) return res.status(409).json({ error: 'งวดนี้ปิดแล้ว' });
  calcMonth(db, month).forEach(r => db.payslips.push({ id: `ps-${r.emp_id}-${month}`, emp_id: r.emp_id, month, base: r.base, ot: r.ot, allow_pos: r.allow_pos, allow_living: r.allow_living, bonus: r.bonus, sso: r.sso, tax: r.tax, net: r.net }));
  save(db); res.json({ ok: true, month }); });
app.get('/api/admin/bankfile.csv', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const month = req.query.month || iso(new Date()).slice(0, 7);
  const rows = ['ลำดับ,ชื่อบัญชี,เลขบัญชี,ธนาคาร,จำนวนเงิน'];
  // งวดที่ปิดแล้วใช้ยอดจากสลิปจริง (กันตัวเลขไม่ตรงกับที่จ่าย) — งวดเปิดคำนวณสด
  const closed = db.payslips.filter(p => p.month === month);
  const list = closed.length
    ? closed.map(p => { const e = db.employees.find(x => x.id === p.emp_id) || {}; return { name: e.name || p.emp_id, bank: e.bank || '', bank_account: e.bank_account || '', net: p.net }; })
    : calcMonth(db, month);
  list.forEach((r, i) => rows.push(`${i + 1},${r.name},${r.bank_account},${r.bank},${r.net.toFixed(2)}`));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="bankfile-${month}.csv"`);
  res.send('﻿' + rows.join('\n')); });
app.get('/api/admin/announcements', (req, res) => { if (!admin(req, res)) return; res.json(load().announcements.slice().reverse()); });
app.post('/api/admin/announcements', (req, res) => { if (!admin(req, res)) return;
  const { title, body } = req.body || {}; if (!title) return res.status(400).json({ error: 'ใส่หัวข้อ' });
  const db = load(); db.announcements.push({ id: 'a' + Date.now(), title, body: String(body || ''), at: now() });
  save(db); res.json({ ok: true }); });
app.get('/api/admin/branches', (req, res) => { if (!admin(req, res)) return; res.json(load().branches); });
// ── จัดการสาขา: เพิ่ม / แก้ไข / ลบ ──
app.post('/api/admin/branches', (req, res) => { if (!admin(req, res)) return;
  const { name, lat, lng, radius } = req.body || {};
  if (!name) return res.status(400).json({ error: 'ใส่ชื่อสาขา' });
  const db = load();
  const b = { id: 'b' + Date.now(), name: String(name), lat: +lat || 13.7563, lng: +lng || 100.5018, radius: +radius || 100, qr_token: crypto.randomBytes(8).toString('hex') };
  db.branches.push(b); save(db); res.json({ ok: true, branch: b }); });
app.put('/api/admin/branches/:id', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const b = db.branches.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'ไม่พบสาขา' });
  const { name, lat, lng, radius } = req.body || {};
  if (name) b.name = String(name);
  if (lat != null) b.lat = +lat || b.lat;
  if (lng != null) b.lng = +lng || b.lng;
  if (radius != null) b.radius = +radius || b.radius;
  save(db); res.json({ ok: true, branch: b }); });
app.delete('/api/admin/branches/:id', (req, res) => { if (!admin(req, res)) return;
  const db = load();
  if (db.branches.length <= 1) return res.status(400).json({ error: 'ต้องเหลือสาขาอย่างน้อย 1 สาขา' });
  const used = db.employees.filter(e => e.branch_id === req.params.id && e.status !== 'resigned').length;
  if (used) return res.status(409).json({ error: `ลบไม่ได้ — มีพนักงาน ${used} คนสังกัดสาขานี้ ย้ายสังกัดก่อน` });
  db.branches = db.branches.filter(x => x.id !== req.params.id);
  save(db); res.json({ ok: true }); });
app.get('/api/admin/report', (req, res) => { if (!admin(req, res)) return;
  const db = load(); const month = req.query.month || iso(new Date()).slice(0, 7);
  const rows = db.employees.map(e => {
    const cks = db.checkins.filter(x => x.emp_id === e.id && dOf(x.at).startsWith(month) && x.type === 'in');
    const sched = db.shifts.filter(s => s.emp_id === e.id && s.date.startsWith(month) && s.date <= iso(new Date())).length;
    const late = cks.filter(x => x.late_min > 15).length;
    const leave = db.leaves.filter(l => l.emp_id === e.id && l.status === 'approved' && l.from.startsWith(month)).reduce((t, l) => t + l.days, 0);
    return { name: e.name, branch: db.branches.find(b => b.id === e.branch_id)?.name, sched, attended: cks.length, late, leave, absent: Math.max(0, sched - cks.length - leave) };
  });
  res.json({ month, rows }); });
app.get('/api/admin/settings', (req, res) => { if (!admin(req, res)) return; const db = load();
  const c = { tax_threshold: 26000, tax_rate: 5, ...db.company };
  res.json({ company: c, branches: db.branches }); });
// บันทึกเกณฑ์หักเงิน ประกันสังคม / ภาษี + วันจ่าย
app.put('/api/admin/settings', (req, res) => { if (!admin(req, res)) return;
  const db = load();
  const b = req.body || {};
  const num = (v, min, max) => { const n = +v; return Number.isFinite(n) && n >= min && n <= max ? n : null; };
  const fields = {
    payday: num(b.payday, 1, 31),
    sso_rate: num(b.sso_rate, 0, 30),
    sso_cap: num(b.sso_cap, 0, 100000),
    tax_threshold: num(b.tax_threshold, 0, 10000000),
    tax_rate: num(b.tax_rate, 0, 60),
  };
  for (const [k, v] of Object.entries(fields)) {
    if (k in b && v === null) return res.status(400).json({ error: 'ค่า ' + k + ' ไม่ถูกต้อง' });
    if (v !== null) db.company[k] = v;
  }
  save(db); res.json({ ok: true, company: db.company }); });
app.get('/api/admin/departments', (req, res) => { if (!admin(req, res)) return; const db = load();
  const map = {};
  db.employees.forEach(e => { const k = e.dept || 'ไม่ระบุแผนก'; (map[k] = map[k] || []).push(e.name); });
  res.json(Object.entries(map).map(([name, members]) => ({ name, count: members.length, members }))); });
app.get('/api/admin/recruitment', (req, res) => { if (!admin(req, res)) return; res.json(load().recruitment || []); });
app.get('/api/admin/employees/:id', (req, res) => { if (!admin(req, res)) return; const db = load();
  const e = db.employees.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: 'not found' });
  const no = e.employee_no || '000000';
  res.json({ ...e, branch: db.branches.find(b => b.id === e.branch_id)?.name,
    email: e.email || 'emp' + no + '@jcbyte-demo.co.th',
    tax_no: e.tax_no || '0-' + no.slice(0, 4) + '-56789-01-2',
    sso_no: e.sso_no || '11-' + no + '-90',
    address: e.address || (e.branch_id === 'b1' ? 'เขตปทุมวัน กรุงเทพมหานคร' : 'อ.บางใหญ่ จ.นนทบุรี'),
    leaves: db.leaves.filter(l => l.emp_id === e.id).map(l => ({ ...l, type_name: db.leave_types.find(t => t.key === l.type)?.name || l.type })).reverse(),
    checkins: db.checkins.filter(x => x.emp_id === e.id).slice(-10).reverse(),
    payslips: db.payslips.filter(p => p.emp_id === e.id).reverse() }); });

// นโยบายความเป็นส่วนตัว — จำเป็นสำหรับส่งแอปขึ้น App Store / Google Play
app.get('/privacy', (req, res) => res.send(`<!doctype html><html lang="th"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title>นโยบายความเป็นส่วนตัว · JIANCHA HR</title>
<style>body{font-family:'IBM Plex Sans Thai',-apple-system,'Thonburi',sans-serif;max-width:720px;margin:0 auto;padding:40px 24px;line-height:1.75;color:#221f19;background:#faf8f3}
h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:28px}p,li{font-size:.95rem}.en{color:#888;font-size:.85rem}</style></head><body>
<h1>นโยบายความเป็นส่วนตัว — แอปพลิเคชัน JIANCHA HR</h1>
<p class="en">Privacy Policy — JIANCHA HR (Employee self-service application)</p>
<p>แอปพลิเคชันนี้เป็นระบบภายในสำหรับพนักงานของบริษัทในเครือ JIANCHA เท่านั้น ใช้สำหรับการลงเวลาทำงาน ยื่นคำร้อง ดูตารางกะ และสลิปเงินเดือน</p>
<h2>ข้อมูลที่เราเก็บและวัตถุประสงค์</h2>
<ul>
<li><b>ตำแหน่งที่ตั้ง (Location)</b> — ใช้ขณะลงเวลาเข้า-ออกงานเท่านั้น เพื่อตรวจว่าอยู่ในรัศมีสาขา ไม่มีการติดตามตำแหน่งเบื้องหลัง</li>
<li><b>รูปถ่าย (Camera)</b> — ถ่ายภาพยืนยันตัวตนขณะลงเวลา (เลือกข้ามได้) เก็บไว้ให้ฝ่ายบุคคลตรวจสอบ</li>
<li><b>ข้อมูลพนักงาน</b> — ชื่อ ตำแหน่ง สังกัด เงินเดือน และประวัติการลงเวลา ตามความจำเป็นของการจ้างงาน</li>
</ul>
<h2>การเปิดเผยข้อมูล</h2>
<p>ข้อมูลทั้งหมดเก็บบนเซิร์ฟเวอร์ของบริษัท ใช้ภายในฝ่ายบุคคลเท่านั้น <b>ไม่ขายหรือแบ่งปันให้บุคคลที่สาม</b> และไม่ใช้เพื่อการโฆษณา</p>
<h2>การเก็บรักษาและสิทธิของท่าน</h2>
<p>ข้อมูลเก็บตลอดอายุการจ้างงานตามกฎหมายแรงงานและกฎหมายภาษี พนักงานสามารถขอดู แก้ไข หรือลบข้อมูลได้โดยติดต่อฝ่ายบุคคล</p>
<h2>ติดต่อ</h2>
<p>ฝ่ายบุคคล JIANCHA COMPANY LIMITED · อีเมล itjianchacenter@gmail.com</p>
<p class="en">Last updated: August 2026</p>
</body></html>`));
app.get('/scan', (req, res) => res.sendFile(path.join(__dirname, 'public', 'scan.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const lan = Object.values(os.networkInterfaces()).flat().find(i => i && i.family === 'IPv4' && !i.internal)?.address;
  console.log(`JIANCHA DEMO HR — local: http://localhost:${PORT}` + (lan ? ` · LAN: http://${lan}:${PORT}` : '') + ' · admin: byte@2026 · PIN: 111111/333333');
});
