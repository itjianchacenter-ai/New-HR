#!/usr/bin/env node
// นโยบายใหม่: PIN ล็อกอิน = รหัสพนักงาน (employee_no)
// รันครั้งเดียวเพื่อปรับข้อมูลเดิม — ข้ามบัญชีรีวิวสโตร์ (เลขท้ายบัตร 0099) และคนที่ไม่มีรหัสพนักงาน
// ใช้: node scripts/pin-to-empno.js [path ของ data.json]
const fs = require('fs');
const F = process.argv[2] || process.env.DATA_FILE || require('path').join(__dirname, '..', 'data.json');
const db = JSON.parse(fs.readFileSync(F, 'utf8'));
let changed = 0, kept = 0;
for (const e of db.employees) {
  const no = String(e.employee_no || '').replace(/\D/g, '');
  const last4 = String(e.national_id || '').replace(/\D/g, '').slice(-4);
  if (last4 === '0099' || !no) { kept++; continue; }
  if (e.pin !== no) { e.pin = no; changed++; }
}
fs.writeFileSync(F, JSON.stringify(db, null, 1));
console.log(`เปลี่ยน PIN เป็นรหัสพนักงานแล้ว: ${changed} คน · คงเดิม: ${kept} คน (บัญชีรีวิวสโตร์/ไม่มีรหัสพนักงาน)`);
