// ═══ JC People — ระบบสองภาษา ไทย/English ═══
// ภาษาหลักคือไทย · โหมด EN แปลข้อความอัตโนมัติทั้งหน้า (รวมที่ render ทีหลัง)
(function () {
  window.LANG = localStorage.getItem('jc_lang') || 'th';
  window.LOCALE = window.LANG === 'th' ? 'th-TH' : 'en-GB';
  window.setLang = l => { localStorage.setItem('jc_lang', l); location.reload(); };
  if (window.LANG !== 'en') return;

  // ── พจนานุกรม (ข้อความตรงตัว) ──
  const D = {
    // ═ ทั่วไป ═
    'เข้าสู่ระบบ': 'Sign in', 'ย้อนกลับ': 'Back', 'ถัดไป': 'Next', 'บันทึก': 'Save', 'ยกเลิก': 'Cancel',
    'ทดสอบ': 'Test', 'ตกลง': 'OK', 'แก้ไข': 'Edit', 'ลบ': 'Delete', 'ปิด': 'Close', 'ออกจากระบบ': 'Sign out',
    'สาขา': 'Branch', 'แผนก': 'Department', 'พนักงาน': 'Staff', 'สถานะ': 'Status', 'เหตุผล': 'Reason',
    'วันที่': 'Date', 'รับทราบ': 'Got it', 'รายการ': 'Item', 'ไม่มีพนักงาน': 'No staff',
    '🖥 เซิร์ฟเวอร์ระบบ HR': '🖥 HR Server', '⚙️ ตั้งค่าเซิร์ฟเวอร์': '⚙️ Server settings',
    'กำลังทดสอบ…': 'Testing…', 'กำลังตรวจสอบ…': 'Checking…',
    '❌ เชื่อมต่อไม่ได้ — ตรวจ URL และเครือข่าย': '❌ Cannot connect — check URL and network',
    'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — กด ⚙️ ตั้งค่าเซิร์ฟเวอร์ด้านล่าง': 'Cannot reach server — tap ⚙️ Server settings below',
    // ═ Login พนักงาน ═
    'เข้าสู่ระบบพนักงาน': 'Employee Sign-in',
    'ล็อกอินครั้งแรกใช้ 2 ขั้นตอน': 'First sign-in takes 2 steps',
    'ระบบจะจำการเข้าสู่ระบบไว้ให้': 'You will stay signed in',
    'ขั้นที่ 1 · เลข 4 ตัวท้ายบัตรประชาชน': 'Step 1 · Last 4 digits of National ID',
    'ขั้นที่ 2 · PIN (รหัสพนักงาน)': 'Step 2 · PIN (your employee ID)',
    'เดโม่: เลขท้ายบัตร ': 'Demo: ID last-4 ', ' · PIN ': ' · PIN ',
    'PIN ไม่ถูกต้อง': 'Incorrect PIN',
    'ไม่พบเลขท้ายบัตรนี้ในระบบ — ติดต่อ HR เพื่อลงทะเบียน': 'ID not found — contact HR to register',
    'เลข 4 ตัวท้ายไม่ถูกต้อง': 'Incorrect last-4 digits',
    'เลือกโหมดการใช้งาน': 'Choose your mode',
    '🖥️ Role Admin · หลังบ้าน HR': '🖥️ Role Admin · Back office',
    '👤 Role Employee · แอปพนักงาน': '👤 Role Employee · Employee app',
    // ═ หน้าหลัก ═
    'กะวันนี้ · TODAY\'S SHIFT': "Today's shift", 'ไม่มีกะวันนี้': 'No shift today', 'วันหยุด': 'Day off',
    'สแกนนิ้ว ลงเวลาเข้า': 'Scan to Clock In', 'สแกนนิ้ว ลงเวลาออก': 'Scan to Clock Out',
    'ลงเวลาครบแล้ววันนี้': 'All done today',
    'แตะปุ่ม → ถ่ายรูปยืนยันตัวตน → บันทึกเวลา': 'Tap → identity photo → time recorded',
    'กำลังตรวจตำแหน่ง…': 'Locating…',
    'ยังไม่ลงเวลา': 'Not yet', 'ตรงเวลา': 'On time', 'สาย': 'Late', 'บันทึกแล้ว': 'Recorded',
    '🗺 แผนที่จุดเช็คอิน': '🗺 Check-in map', 'สแกน QR แทน →': 'Scan QR instead →',
    'เปิดกล้องมือถือแล้วสแกน QR ที่หน้าร้านได้เลย': 'Open your camera and scan the QR at the store',
    'หน้าหลัก': 'Home', 'คำร้องขอ': 'Requests', 'ปฏิทิน': 'Calendar', 'ข้อมูลส่วนตัว': 'Profile',
    '📍 ตำแหน่งของฉัน': '📍 My location',
    'ยังไม่มีพิกัดสาขา — ติดต่อ HR': 'Branch has no coordinates — contact HR',
    'ยังไม่ได้ตำแหน่ง GPS — เปิดอนุญาตตำแหน่ง หรือสแกน QR ที่ร้าน': 'No GPS yet — allow location access or scan the store QR',
    'อุปกรณ์นี้ไม่รองรับ GPS — ใช้สแกน QR แทน': 'No GPS on this device — use QR instead',
    // ═ กล้อง / เช็คอิน ═
    'ถ่ายรูปยืนยันตัวตน': 'Identity photo', 'ข้ามการถ่ายรูป': 'Skip photo',
    'ลงเวลาเข้าสำเร็จ': 'Clocked in', 'ลงเวลาออกสำเร็จ': 'Clocked out',
    '📍 เช็คอินนอกสถานที่': '📍 Off-site check-in',
    'เหตุผล *': 'Reason *', 'สถานที่ (ระบบหาให้อัตโนมัติ)': 'Place (auto-detected)',
    'กำลังค้นหาตำแหน่ง…': 'Finding place…',
    'ยืนยันเช็คอินนอกสถานที่': 'Confirm off-site check-in',
    'ระบุเหตุผลก่อนครับ': 'Please enter a reason',
    'เช็คอินนอกสถานที่ต้องระบุเหตุผล': 'Off-site check-in requires a reason',
    'หากปฏิบัติงานนอกสถานที่ (ออกบูธ / ประชุม / ส่งของ) ระบุเหตุผลเพื่อบันทึกให้ HR ตรวจสอบ': 'If working off-site (event / meeting / delivery), give a reason for HR review',
    // ═ คำร้อง ═
    'คำร้องขอของฉัน': 'My Requests',
    'ยื่นลา · ขอ OT · เบิกค่าใช้จ่าย และติดตามสถานะ': 'Leave · OT · expense claims, and track status',
    '+ ลางาน': '+ Leave', '+ เบิก': '+ Claim',
    'ยังไม่มีคำร้อง — กดปุ่มด้านบนเพื่อยื่นใหม่': 'No requests yet — tap a button above',
    'รออนุมัติ': 'Pending', 'อนุมัติแล้ว': 'Approved', 'ไม่อนุมัติ': 'Rejected', 'ยกเลิกแล้ว': 'Cancelled',
    'ยื่นใบลา': 'Leave request', 'ประเภทการลา': 'Leave type', 'ตั้งแต่': 'From', 'ถึง': 'To',
    'จำนวนวัน': 'Days', 'ส่งคำร้อง': 'Submit', 'ขอ OT': 'OT request', 'จำนวนชั่วโมง': 'Hours',
    'เบิกค่าใช้จ่าย': 'Expense claim', 'จำนวนเงิน (฿)': 'Amount (฿)',
    'ส่งคำร้องแล้ว — รอหัวหน้าอนุมัติ': 'Submitted — awaiting approval',
    'ยกเลิกคำร้องแล้ว': 'Request cancelled', 'อนุมัติแล้ว ✓': 'Approved ✓', 'ปฏิเสธแล้ว': 'Rejected',
    'ไม่มีรายการรออนุมัติ 🎉': 'Nothing awaiting approval 🎉',
    'ลาป่วย': 'Sick leave', 'ลากิจ': 'Personal leave', 'ลาพักร้อน': 'Vacation',
    'ลาคลอด': 'Maternity', 'ลาอุปสมบท': 'Ordination leave',
    // ═ ปฏิทิน ═
    'จ': 'Mo', 'อ': 'Tu', 'พ': 'We', 'พฤ': 'Th', 'ศ': 'Fr', 'ส': 'Sa', 'อา': 'Su',
    'สาย / ออกก่อน': 'Late / early out', 'จุดซ้าย = เข้า · จุดขวา = ออก': 'Left dot = in · right = out',
    'กะ': 'Shift', 'เข้างาน': 'Clock in', 'ออกงาน': 'Clock out', 'รวมชั่วโมง': 'Total hours', 'สถานที่': 'Location',
    // ═ โปรไฟล์ ═
    'ชื่อ (ไทย)': 'Name (TH)', 'ชื่อเล่น': 'Nickname', 'เบอร์โทร': 'Phone', 'อีเมล': 'Email',
    'เลขบัตร ปชช.': 'National ID', 'รหัสพนักงาน': 'Employee ID', 'เริ่มงาน': 'Start date',
    'ประเภทสัญญา': 'Contract', 'กะประจำ': 'Regular shift',
    // ═ แจ้งเตือน / สลิป ═
    'แจ้งเตือน': 'Notifications', 'แตะเพื่อดูรายละเอียด': 'Tap to view',
    'ยังไม่มีสลิป — รอ HR ปิดงวด': 'No slips yet — waiting for payroll close',
    'ไม่มีประกาศ': 'No announcements', 'เงินเดือน': 'Salary', 'ค่าล่วงเวลา (OT)': 'Overtime (OT)',
    'หัก ประกันสังคม': 'Social security', 'หัก ภาษี': 'Withholding tax', 'เงินได้สุทธิ': 'Net pay',
    '🖨 สลิปเต็มรูปแบบ · บันทึก PDF': '🖨 Full slip · Save as PDF',
    '← กลับไปแจ้งเตือน': '← Back to notifications',
    // ═ หลังบ้าน: login/โครง ═
    'เข้าสู่ระบบหลังบ้าน': 'Back-office Sign-in', 'แสดงรหัสผ่าน': 'Show password',
    'รหัสผ่านไม่ถูกต้อง': 'Incorrect password',
    'พนักงาน HR ที่มีสิทธิ์แอดมิน: ล็อกอินผ่าน': 'HR staff with admin access: sign in via the ',
    'แอปพนักงาน': 'employee app', ' แล้วเลือก Role Admin': ' then choose Role Admin',
    'ประกาศ': 'Announcements', 'ตั้งค่า': 'Settings',
    'JIANCHA DEMO HR · v2.0': 'JIANCHA DEMO HR · v2.0', 'ข้อมูลตัวอย่างสำหรับเดโม่': 'Demo sample data',
    '‹ กลับแอปพนักงาน': '‹ Back to employee app',
    // ═ หลังบ้าน: หัวข้อหน้า ═
    'บันทึกเวลาเรียลไทม์': 'Real-time attendance log', 'ทะเบียนพนักงาน': 'Employee registry',
    'คิวคำขอรออนุมัติ': 'Approval queue', 'เงินเดือนและสลิป': 'Payroll & slips',
    'System preferences': 'System preferences',
    // ═ Dashboard ═
    'ไม่มีคนสาย': 'No late arrivals', 'เกิน 15 นาที': 'over 15 min', 'ไม่มีคนลา': 'No one on leave',
    'รอตัดสิน': 'awaiting decision', 'ไม่มีคิวค้าง': 'no pending queue',
    'จากฐานข้อมูลพนักงาน': 'from employee database',
    'ยังไม่มีความเคลื่อนไหววันนี้': 'No activity yet today',
    'รายการจะขึ้นเมื่อพนักงานลงเวลาผ่านแอป': 'Entries appear when staff clock in via the app',
    'วันนี้ไม่มีรายการต้องทำ 🎉': 'Nothing to do today 🎉',
    'ลงเวลาเข้า': 'clocked in', 'ลงเวลาออก': 'clocked out',
    // ═ T&A / Shifts ═
    '● Live · อัปเดตทุก 5 วิ': '● Live · refreshes every 5s', '⬇ วันนี้': '⬇ Today',
    'Export ช่วงวัน': 'Export range', 'เลือกช่วงวันก่อน': 'Pick a date range first',
    'คลิกที่ช่องกะเพื่อสลับรูปแบบกะ → หยุด (บันทึกอัตโนมัติ)': 'Click a cell to cycle shift patterns → OFF (saves automatically)',
    '📌 ตั้งกะถาวร': '📌 Set recurring shift', 'รูปแบบกะ': 'Shift pattern', 'ลงตารางกะ': 'Apply schedule',
    'รวมวันอาทิตย์ด้วย (ปกติเว้นอาทิตย์เป็นวันหยุด)': 'Include Sundays (off by default)',
    'ตั้งเป็นวันหยุดแล้ว': 'Set to day off', 'บันทึกกะแล้ว': 'Shift saved',
    'เลือกช่วงวันให้ถูกต้อง': 'Pick a valid date range',
    '⬆ Upload Schedule': '⬆ Upload Schedule', '⬇ Download': '⬇ Download',
    // ═ Approvals ═
    'ไม่มีรายการค้าง': 'Nothing pending',
    // ═ Employee DB ═
    'รูปพนักงาน · Photo': 'Photo', '📷 อัปโหลดรูป': '📷 Upload photo', 'ลบรูป': 'Remove photo',
    'สิทธิ์แอดมิน (เข้าหลังบ้านได้)': 'Admin access (back office)',
    'ไม่มี — พนักงานทั่วไป': 'No — regular employee', 'มี — เลือก Role ตอนล็อกอิน': 'Yes — choose role at sign-in',
    'PIN (เว้นว่าง = ใช้รหัสพนักงาน)': 'PIN (blank = uses employee ID)',
    'กรอกชื่อพนักงาน (Name TH) ก่อนบันทึก': 'Enter employee name (TH) before saving',
    'กรอกชื่อพนักงาน': 'Enter employee name',
    'บันทึกข้อมูลพนักงานแล้ว': 'Employee saved', 'เพิ่มพนักงานเรียบร้อย': 'Employee added',
    'แจ้งข้อมูลล็อกอินแอปให้พนักงาน:': 'Share these app sign-in details with the employee:',
    'เลขท้ายบัตรประชาชน: ': 'National ID last-4: ', '(ตามบัตรจริง)': '(per actual ID card)',
    'ไม่พบพนักงานตามเงื่อนไข': 'No employees match',
    'ระดับตำแหน่ง': 'Level',
    // ═ Manning ═
    'มีพนักงานประจำ': 'Staffed branches', 'กำลังพลรายสาขา': 'Manning by branch',
    '— ทุกสาขา —': '— All branches —', 'เฉพาะสาขาที่มีพนักงาน': 'Staffed only',
    'ข้อมูลสร้างอัตโนมัติจากฐานพนักงาน': 'Auto-generated from employee data',
    'แผนกสร้างอัตโนมัติจากข้อมูลพนักงาน': 'Departments auto-generated from employee data',
    'รายชื่อพนักงาน': 'Staff list', 'ยังไม่ผูกพนักงาน': 'No staff assigned', 'ไม่พบสาขาตามเงื่อนไข': 'No branches match',
    // ═ Payroll ═
    'ปิดงวดแล้ว': 'period closed', 'ยังไม่ปิดงวด': 'period open', 'รวม OT': 'incl. OT',
    'หัก ณ ที่จ่าย': 'withholding', 'ปิดงวดเดือนนี้ (สร้างสลิป)': 'Close this period (issue slips)',
    'ดาวน์โหลด Bank File (CSV)': 'Download bank file (CSV)',
    'ตั้งค่าเกณฑ์หัก ปกส. / ภาษี': 'SSO / tax deduction settings',
    'งวดนี้ปิดแล้ว': 'Period already closed', '🖨 พิมพ์ / บันทึก PDF': '🖨 Print / Save PDF',
    // ═ Reports ═
    'อัตรามาทำงาน สาย ขาด ลา แยกรายคน / สาขา': 'Attendance, late, absence and leave by person / branch',
    'ชั่วโมง OT ต่อคน / สาขา พร้อมสถานะอนุมัติ': 'OT hours per person / branch with approval status',
    'พนักงานเข้า–ออกตามอายุงาน': 'Joiners and leavers by tenure',
    'ภาษีหัก ณ ที่จ่ายรายเดือน พร้อมยื่นสรรพากร': 'Monthly withholding tax, ready to file',
    'หนังสือรับรองหักภาษี ณ ที่จ่าย รายคน / ปี': 'Withholding certificate per person / year',
    'กำลังพลและต้นทุนแรงงานตามสาขา / แผนก': 'Headcount and labor cost by branch / department',
    // ═ ประกาศ ═
    'สร้างประกาศใหม่': 'New announcement', 'หัวข้อประกาศ': 'Title', 'รายละเอียด': 'Details',
    'ประกาศทั้งหมด': 'All announcements', 'ยังไม่มีประกาศ': 'No announcements yet',
    'ใส่หัวข้อก่อน': 'Enter a title first', 'ประกาศแล้ว': 'Announced',
    // ═ ตั้งค่า ═
    'เกณฑ์เงินเดือนและการหักเงิน': 'Payroll & deduction settings',
    'วันจ่ายเงินเดือน': 'Payday', 'ของเดือน': 'of month', 'ประกันสังคม': 'Social security',
    'เพดาน ปกส.': 'SSO cap', 'เกณฑ์เริ่มหักภาษี': 'Tax threshold', 'อัตราภาษี': 'Tax rate',
    'บันทึกเกณฑ์แล้ว': 'Settings saved',
    'สาขาและจุดลงเวลา (Geofence)': 'Branches & check-in geofence', '+ เพิ่มสาขา': '+ Add branch',
    'ชื่อสาขา': 'Branch name', 'รัศมี (เมตร)': 'Radius (m)', 'บันทึกสาขาใหม่': 'Save new branch',
    'บันทึกการแก้ไข': 'Save changes', 'บันทึกสาขา': 'Save branch',
    '💡 คลิกบนแผนที่ด้านล่างเพื่อปักพิกัด หรือคัดลอกจาก Google Maps (คลิกขวาที่ร้าน)': '💡 Click the map below to drop a pin, or copy from Google Maps (right-click the store)',
    'พิกัด (lat, lng)': 'Coordinates (lat, lng)', 'รัศมี': 'Radius', 'เปิดหน้า QR ↗': 'Open QR page ↗',
    'ใส่ชื่อสาขาก่อน': 'Enter a branch name first', 'เพิ่มสาขาแล้ว': 'Branch added',
    'แก้ไขสาขาแล้ว': 'Branch updated', 'ลบสาขาแล้ว': 'Branch deleted', 'ลบสาขานี้?': 'Delete this branch?',
    'ต้องเหลือสาขาอย่างน้อย 1 สาขา': 'At least one branch is required',
    '📍 พิกัดสาขาใหม่ — กรอกชื่อแล้วกดบันทึก': '📍 New branch pin — enter a name and save',
  };

  // ── กติกาแปลข้อความผสมตัวเลข/ชื่อ ──
  const dict = t => D[t] !== undefined ? D[t] : null;
  const R = [
    [/^สวัสดี, (.+) 👋$/, (m) => `Hello, ${m[1]} 👋`],
    [/^วินาที (\d+)$/, (m) => `sec ${m[1]}`],
    [/^ยืนยันตัวตน: (.+)$/, (m) => `Verifying: ${m[1]}`],
    [/^ยินดีต้อนรับ (.+) — บัญชีนี้มีสิทธิ์ผู้ดูแลระบบ$/, (m) => `Welcome ${m[1]} — this account has admin access`],
    [/^✅ เชื่อมต่อสำเร็จ: (.+)$/, (m) => `✅ Connected: ${m[1]}`],
    [/^On-site · (.+) · ห่าง ([\d,\.]+) ม\.$/, (m) => `On-site · ${m[1]} · ${m[2]} m away`],
    [/^ต้องอยู่ในระยะ ([\d,\.]+) ม\. จาก (.+) \(ตอนนี้ ([\d,\.]+) ม\.\)$/, (m) => `Must be within ${m[1]} m of ${m[2]} (now ${m[3]} m)`],
    [/^ต้องอยู่ในระยะ ([\d,\.]+) ม\. จาก (.+)$/, (m) => `Must be within ${m[1]} m of ${m[2]}`],
    [/^ไม่ได้รับอนุญาตใช้ตำแหน่ง — (.*)$/, (m) => `Location permission denied — ${tr(m[1]) || m[1]}`],
    [/^อยู่นอกระยะ \(([\d,\.]+) ม\. \/ รัศมี ([\d,\.]+) ม\.\)$/, (m) => `Out of range (${m[1]} m / radius ${m[2]} m)`],
    [/^🗺 จุดเช็คอิน · (.+)$/, (m) => `🗺 Check-in point · ${m[1]}`],
    [/^วงสีทอง = รัศมีที่เช็คอินได้ \(([\d,\.]+) ม\.\)$/, (m) => `Gold circle = check-in radius (${m[1]} m)`],
    [/^✅ อยู่ในรัศมีเช็คอิน \(ห่างสาขา ([\d,\.]+) ม\. \/ รัศมี ([\d,\.]+) ม\.\)$/, (m) => `✅ Within radius (${m[1]} m from branch / radius ${m[2]} m)`],
    [/^⚠️ อยู่นอกรัศมี — ห่างสาขา ([\d,\.]+) ม\. \(รัศมี ([\d,\.]+) ม\.\)$/, (m) => `⚠️ Out of radius — ${m[1]} m from branch (radius ${m[2]} m)`],
    [/^สาย (\d+) นาที$/, (m) => `Late ${m[1]} min`],
    [/^สาย (\d+) น\.$/, (m) => `Late ${m[1]} min`],
    [/^(.+) (\d+(?:\.\d+)?) วัน$/, (m) => `${tr(m[1]) || m[1]} ${m[2]} day(s)`],
    [/^OT (\d+(?:\.\d+)?) ชม\.$/, (m) => `OT ${m[1]} h`],
    [/^(\d+(?:\.\d+)?) ชม\.$/, (m) => `${m[1]} h`],
    [/^เบิก (฿[\d,\.]+)$/, (m) => `Claim ${m[1]}`],
    [/^💸 สลิปงวด (.+) ออกแล้ว$/, (m) => `💸 Pay slip ${m[1]} issued`],
    [/^สลิปงวด (.+) ออกแล้ว$/, (m) => `Pay slip ${m[1]} issued`],
    [/^PAY SLIP · งวด (.+)$/, (m) => `PAY SLIP · ${m[1]}`],
    [/^งวด (.+)$/, (m) => `Period ${m[1]}`],
    [/^ฐาน (฿[\d,\.]+) · OT (฿[\d,\.]+)$/, (m) => `Base ${m[1]} · OT ${m[2]}`],
    [/^\/ (\d+) วัน$/, (m) => `/ ${m[1]} days`],
    [/^(\d+) คน$/, (m) => `${m[1]} pax`],
    [/^([\d,\.]+) ม\.$/, (m) => `${m[1]} m`],
    [/^แสดง (\d+) \/ (\d+) สาขา$/, (m) => `Showing ${m[1]} / ${m[2]} branches`],
    [/^อีก (\d+) สาขายังไม่ผูกพนักงาน$/, (m) => `${m[1]} branches without staff`],
    [/^(\d+)% ของกะวันนี้$/, (m) => `${m[1]}% of today's shifts`],
    [/^(\d+) คำขอรออนุมัติ · ไปที่ Approvals$/, (m) => `${m[1]} requests pending · see Approvals`],
    [/^(\d+) คนยังไม่ลงเวลาเข้า · ไปที่ Time & Attendance$/, (m) => `${m[1]} not clocked in · see Time & Attendance`],
    [/^สาย (\d+) น\. · (.+)$/, (m) => `Late ${m[1]} min · ${m[2]}`],
    [/^เชื่อมต่อ (.+) ไม่ได้$/, (m) => `Cannot reach ${m[1]}`],
    [/^นอกสถานที่: (.+)$/, (m) => `Off-site: ${m[1]}`],
    [/^ลงเวลา(เข้า|ออก)สำเร็จ \(นอกสถานที่\)$/, (m) => (m[1] === 'เข้า' ? 'Clocked in' : 'Clocked out') + ' (off-site)'],
    [/^รูปยืนยันลงเวลา(เข้า|ออก) · (.+)$/, (m) => `Clock-${m[1] === 'เข้า' ? 'in' : 'out'} photo · ${m[2]}`],
    [/^อนุมัติแล้ว (\d+) รายการ$/, (m) => `Approved ${m[1]} item(s)`],
    [/^ตั้งกะถาวรแล้ว (\d+) คน · (\d+) รายการ$/, (m) => `Recurring shift set: ${m[1]} staff · ${m[2]} entries`],
    [/^อัปโหลดตารางกะแล้ว (\d+) รายการ$/, (m) => `Schedule uploaded: ${m[1]} entries`],
    [/^ปิดงวด (.+) แล้ว — สลิปเข้าแอปพนักงาน$/, (m) => `Period ${m[1]} closed — slips sent to app`],
    [/^บันทึกไม่สำเร็จ: (.*)$/, (m) => `Save failed: ${tr(m[1]) || m[1]}`],
    [/^ลบไม่ได้ — มีพนักงาน (\d+) คนสังกัดสาขานี้ ย้ายสังกัดก่อน$/, (m) => `Cannot delete — ${m[1]} staff assigned; reassign them first`],
  ];

  function tr(t) {
    const hit = dict(t);
    if (hit !== null) return hit;
    for (const [re, fn] of R) { const m = t.match(re); if (m) return fn(m); }
    return null;
  }
  window.__tr = tr;

  const ATTRS = ['placeholder', 'title'];
  function walk(node) {
    if (node.nodeType === 3) {
      const raw = node.nodeValue, t = raw.trim();
      if (!t || !/[ก-๙]/.test(t)) return;
      const out = tr(t);
      if (out !== null) node.nodeValue = raw.replace(t, out);
      return;
    }
    if (node.nodeType !== 1 || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    for (const a of ATTRS) {
      const v = node.getAttribute && node.getAttribute(a);
      if (v && /[ก-๙]/.test(v)) { const out = tr(v.trim()); if (out !== null) node.setAttribute(a, out); }
    }
    for (const c of node.childNodes) walk(c);
  }
  const run = root => { try { walk(root); } catch (e) {} };
  document.addEventListener('DOMContentLoaded', () => {
    run(document.body);
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'characterData') { const p = m.target.parentNode; if (p) run(p); }
        m.addedNodes && m.addedNodes.forEach(n => run(n));
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
