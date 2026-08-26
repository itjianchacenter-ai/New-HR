# JC People — คู่มือส่งแอปขึ้น App Store / Google Play (ฉบับกรอกตามได้เลย)

ไฟล์ทั้งหมดอยู่ใน `~/Downloads` · เซิร์ฟเวอร์ production: `https://people.jc-group-global.com` (HTTPS ✓)

| ไฟล์ | ใช้กับ |
|---|---|
| `JIANCHA-HR-playstore.aab` | Google Play (แอปพนักงาน v1.2) |
| `JIANCHA-HR-ios.ipa` | App Store (แอปพนักงาน v1.2 — มี PrivacyInfo + encryption exempt แล้ว) |
| `JIANCHA-HR-release.apk` | แจกตรง (นอก store) |
| `JIANCHA-HR-ADMIN-*` | แอปหลังบ้าน (แนะนำแจกภายใน/TestFlight ไม่ต้องขึ้น store สาธารณะ) |

---

## 1 · Google Play Console (play.google.com/console)

1. **Create app** → ชื่อ `JIANCHA HR` · App · Free
2. **Production → Create release** → อัปโหลด `JIANCHA-HR-playstore.aab`
3. **App content** กรอกตามนี้:
   - **Privacy policy:** `https://people.jc-group-global.com/privacy`
   - **App access:** เลือก "All or some functionality is restricted" → Add instructions:
     - Username/ID: `0099` (เลขท้ายบัตรประชาชน 4 ตัว)
     - PIN: `246810`
     - หมายเหตุ: `Employee self-service app. Login: enter ID last-4 digits "0099", then PIN "246810". Clock-in outside branch radius requires a reason (off-site mode) — enter any reason to test.`
   - **Ads:** No
   - **Content rating:** แบบสอบถาม → หมวด Utility → ตอบ No ทั้งหมด → ได้เรต 3+
   - **Target audience:** 18+
   - **Data safety** ตอบตามตารางนี้:

| คำถาม | คำตอบ |
|---|---|
| Does your app collect or share user data? | **Yes** |
| Location → Precise location | Collected · ไม่ share · เพื่อ App functionality · เก็บชั่วขณะตอนลงเวลา |
| Photos and videos → Photos | Collected · ไม่ share · App functionality (เซลฟี่ยืนยันลงเวลา ลบใน 90 วัน) |
| Personal info → Name | Collected · ไม่ share · App functionality |
| Data encrypted in transit? | **Yes** (HTTPS) |
| Can users request data deletion? | **Yes** (ติดต่อ HR — ระบุอีเมล itjianchacenter@gmail.com) |

4. **Store listing:**
   - Short description: `แอปพนักงาน JIANCHA — ลงเวลา ยื่นคำร้อง ดูสลิปเงินเดือน`
   - Full description:
     ```
     JC People — แอปพนักงานของกลุ่ม JIANCHA
     • ลงเวลาเข้า-ออกงานด้วย GPS ตรวจรัศมีสาขา + ถ่ายรูปยืนยันตัวตน
     • เช็คอินนอกสถานที่ได้เมื่อออกบูธ/ประชุมนอกสาขา
     • ยื่นใบลา ขอ OT เบิกค่าใช้จ่าย และติดตามสถานะอนุมัติ
     • ปฏิทินกะรายเดือน พร้อมสถานะเข้า-ออกรายวัน
     • ดูสลิปเงินเดือนและบันทึกเป็น PDF
     • รองรับ 2 ภาษา ไทย/English
     สำหรับพนักงานของบริษัทในกลุ่ม JIANCHA เท่านั้น — ต้องได้รับรหัสจากฝ่ายบุคคล
     ```
   - ภาพหน้าจอ: แคปจากแอปจริง (โฟลเดอร์ screenshots ที่ผมแคปให้ระหว่างเดโม่ใช้ได้ หรือสั่งให้ผมทำชุดสวย ๆ เพิ่ม)
5. **ส่งรีวิว** — โดยทั่วไป 1-7 วัน

## 2 · App Store Connect (appstoreconnect.apple.com)

1. **Apps → +** → New App: ชื่อ `JIANCHA HR` · Bundle ID `com.jiancha.demohr`
   *(ถ้า bundle นี้ไม่อยู่ในลิสต์: developer.apple.com → Identifiers → + → App IDs → ใส่ com.jiancha.demohr)*
   *(ถ้าต้องการอัปเดตทับแอป HR ตัวเดิมของบริษัทแทน แจ้งผมเปลี่ยน bundle เป็น com.jcgroupglobal.hr แล้ว build ใหม่ 10 นาที)*
2. อัปโหลด: เปิดแอป **Transporter** (Mac App Store, ฟรี) → ลาก `JIANCHA-HR-ios.ipa` → Deliver
3. **App Privacy** → Get Started → ตอบ:
   - Collect data? **Yes** → เลือก 3 อย่างเท่านั้น (ต้องตรงกับ PrivacyInfo ในแอป):
     - **Precise Location** — App Functionality · Linked to user · ไม่ใช้ tracking
     - **Photos or Videos** — App Functionality · Linked · ไม่ tracking
     - **Name** — App Functionality · Linked · ไม่ tracking
   - Tracking? **No**
4. **App Review Information:**
   - Sign-in required ✓ → User name: `0099` · Password: `246810`
   - Notes: `Internal HR app for JIANCHA employees. Login: tap first field, enter "0099" (national ID last-4), then PIN "246810". Location is used only at clock-in to verify branch radius; outside the radius the app offers "off-site check-in" — enter any reason to proceed. Selfie at clock-in is optional (Skip button available). Slip PDF: Notifications bell → tap a payslip.`
5. Version info: คำอธิบายใช้ชุดเดียวกับ Play + screenshots (6.7" จำเป็น)
6. **Export compliance:** แอปประกาศ `ITSAppUsesNonExemptEncryption=false` แล้ว — ไม่มีคำถามซ้ำตอน submit
7. **ส่งรีวิว** — 1-3 วัน · *แนะนำ: ถ้าโดนถามเรื่อง 4.2 (แอปเฉพาะองค์กร) ให้ตอบว่าเป็น internal-use แล้วเปลี่ยนเป็น **Unlisted Distribution** (App Store Connect → Pricing → Unlisted) — ผ่านง่ายและเหมาะกับแอปพนักงาน*

## 3 · สิ่งที่เตรียมให้แล้วในระบบ (ไม่ต้องทำเพิ่ม)

- ✅ HTTPS production + privacy policy สาธารณะ
- ✅ PrivacyInfo.xcprivacy (iOS ทั้ง 2 แอป) ตรงกับคำตอบ App Privacy ด้านบน
- ✅ ตัด HTTP/cleartext ออกหมด — HTTPS เท่านั้น
- ✅ ITSAppUsesNonExemptEncryption = false
- ✅ บัญชีรีวิว `0099 / 246810` สร้างบน production และทดสอบ login แล้ว
- ✅ versionCode 3 / versionName 1.2 (iOS 1.2 build 3)
- ✅ AAB/IPA เซ็นลายเซ็นจริงทั้งหมด
