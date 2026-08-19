# JIANCHA DEMO HR (New-HR)

ระบบ HR เดโม่ฟูลฟังก์ชัน **แยกจากระบบ JIANCHA HR production 100%** — โค้ดคนละชุด ข้อมูลคนละไฟล์ พอร์ตคนละตัว

## ส่วนประกอบ
- `server.js` — เซิร์ฟเวอร์ Express + API ทั้งหมด (แอดมิน/พนักงาน/อนุมัติตามสายบังคับบัญชา/จัดกะ/เงินเดือน)
- `public/app.html` — แอปพนักงาน (มือถือ 4 แท็บ: หน้าหลัก·คำขอ·ปฏิทิน·สลิป)
- `public/admin.html` — เว็บหลังบ้าน (แดชบอร์ด BI, พนักงาน, กะ, อนุมัติ, เงินเดือน, ประกาศ, แบบฟอร์ม ฯลฯ)
- `public/scan.html` — หน้าลงเวลาผ่าน QR สาขา
- `data.json` — ฐานข้อมูล (สร้างอัตโนมัติครั้งแรกที่รัน **ไม่ commit ขึ้น git**)

## วิธีรัน
```bash
npm install
node server.js        # พอร์ต 3010 (เปลี่ยนด้วย PORT=xxxx)
```
- แอปพนักงาน: http://localhost:3010 — PIN เดโม่ `111111` / `222222` (Manager) / `555555` (Director)
- หลังบ้าน: http://localhost:3010/admin — รหัส `byte@2026`
- เปิดจากวง LAN: ใช้ IP เครื่องที่รัน เช่น `http://192.168.x.x:3010`

## หมายเหตุ
- ลบ `data.json` แล้วรีสตาร์ต = ล้างข้อมูลกลับเป็นชุดตัวอย่างเริ่มต้น
- บนเครื่องพัฒนา (Mac) รันค้างไว้ด้วย LaunchAgent `com.jiancha.demo-hr` — รีสตาร์ตด้วย
  `launchctl kickstart -k gui/$(id -u)/com.jiancha.demo-hr`
