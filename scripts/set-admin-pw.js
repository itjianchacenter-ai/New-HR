#!/usr/bin/env node
// ตั้งรหัสผ่านหลังบ้าน (db.admin_pw) — ใช้โดยผู้ดูแลระบบ
// ใช้: node scripts/set-admin-pw.js <รหัสใหม่> [path ของ data.json]
const fs = require('fs');
const pw = process.argv[2];
if (!pw || pw.length < 6) { console.error('ระบุรหัสอย่างน้อย 6 ตัว: node scripts/set-admin-pw.js <รหัสใหม่> [data.json]'); process.exit(1); }
const F = process.argv[3] || process.env.DATA_FILE || require('path').join(__dirname, '..', 'data.json');
const db = JSON.parse(fs.readFileSync(F, 'utf8'));
db.admin_pw = pw;
fs.writeFileSync(F, JSON.stringify(db, null, 1));
console.log('ตั้งรหัสผ่านหลังบ้านใหม่เรียบร้อย');
