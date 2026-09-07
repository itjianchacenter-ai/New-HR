#!/usr/bin/env node
// สร้าง/รีเซ็ตข้อมูลเดโม่ตัวที่ 2 จากข้อมูลเดโม่หลัก + เติมตัวอย่างให้เห็นฟีเจอร์ใหม่ครบ
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'data.json');
const DST = path.join(__dirname, '..', 'demo2-data.json');
const db = JSON.parse(fs.readFileSync(SRC, 'utf8'));
db.company.name = 'JIANCHA DEMO 2 CO., LTD.';
db.company.deduct_absent = true;                       // เปิดหักขาดงานอัตโนมัติ
if (!db.leave_types.some(t => t.key === 'unpaid'))
  db.leave_types.push({ key: 'unpaid', name: 'ลาไม่รับค่าจ้าง', days: 365 });
const M = new Date(); const month = `${M.getFullYear()}-${String(M.getMonth()+1).padStart(2,'0')}`;
const e1 = db.employees[0];
// ตัวอย่าง: OT วันธรรมดา 4 ชม. (1.5 เท่า) + OT วันอาทิตย์ 3 ชม. (3 เท่า)
const wk = `${month}-03`, sun = (() => { for (let d = 1; d <= 28; d++) { const dt = `${month}-${String(d).padStart(2,'0')}`; if (new Date(dt+'T00:00').getDay() === 0) return dt; } })();
db.ot = db.ot.filter(o => !(o.id||'').startsWith('demo2-'));
db.ot.push({ id: 'demo2-ot1', emp_id: e1.id, date: wk, hours: 4, reason: 'ปิดยอดสิ้นเดือน', status: 'approved' });
db.ot.push({ id: 'demo2-ot2', emp_id: e1.id, date: sun, hours: 3, reason: 'จัดบูธวันหยุด', status: 'approved' });
// ตัวอย่าง: ลาไม่รับค่าจ้าง 2 วัน
db.leaves = db.leaves.filter(l => !(l.id||'').startsWith('demo2-'));
db.leaves.push({ id: 'demo2-lv1', emp_id: e1.id, type: 'unpaid', from: `${month}-10`, to: `${month}-11`, days: 2, reason: 'ธุระส่วนตัว', status: 'approved' });
// เติมเลขบัญชี/เลขบัตรให้พนักงานเดโม่ทุกคน (ใช้ทำไฟล์ธนาคาร/ราชการ)
db.employees.forEach((e, i) => {
  if (!e.bank) e.bank = 'กสิกรไทย';
  if (!e.bank_account) e.bank_account = `045-1-${String(11111 + i).padStart(5,'0')}-${(i%9)+1}`;
  if (!e.national_id) e.national_id = `1-1014-${String(10000+i).slice(1)}-${String(22+i).slice(0,2)}-${(i%9)+1}`;
});
db.company.tax_mode = 'progressive';                   // ภาษีก้าวหน้าเต็มรูปแบบสรรพากร
// ผู้สมัครตัวอย่าง 2 คน
db.applicants = [
  { id: 'ap-demo1', name: 'ปวีณา รักงาน', phone: '0812345678', position: 'บาริสต้า', branch_id: db.branches[0].id, note: 'มีประสบการณ์ร้านชา 2 ปี', status: 'new', applied_at: `${month}-05` },
  { id: 'ap-demo2', name: 'กิตติ ขยันยิ่ง', phone: '0898765432', position: 'ผู้ช่วยผู้จัดการร้าน', branch_id: db.branches[1] ? db.branches[1].id : db.branches[0].id, note: '', status: 'interview', applied_at: `${month}-03` },
];
db.documents = []; db.offboards = [];
db.payslips = db.payslips.filter(p => p.month !== month);   // เปิดงวดปัจจุบันให้ทดลองปิดเอง
fs.writeFileSync(DST, JSON.stringify(db, null, 1));
console.log('demo2-data.json พร้อม ·', db.employees.length, 'คน · เดือนทดสอบ', month, '· OT:', wk, '+', sun);
