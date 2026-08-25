# JIANCHA HR — แอปมือถือ (iOS + Android)

แอปมือถือสร้างด้วย [Capacitor](https://capacitorjs.com) โดยห่อเว็บแอปพนักงาน (`public/app.html`)
เป็นแอป native ที่โหลดหน้าจอจากเซิร์ฟเวอร์ HR โดยตรง — **อัปเดตระบบที่เซิร์ฟเวอร์ครั้งเดียว
แอปทุกเครื่องได้ของใหม่ทันที ไม่ต้องส่งขึ้น store ใหม่**

## โครงสร้าง
- `capacitor.config.json` — ตั้งค่าแอป (ชื่อ, bundle id, URL เซิร์ฟเวอร์)
- `ios/` — โปรเจกต์ Xcode (เปิดด้วย `ios/App/App.xcodeproj`)
- `android/` — โปรเจกต์ Android Studio
- `assets/logo.png` — โลโก้ต้นฉบับสำหรับ generate ไอคอน/splash
- `www/` — หน้า fallback ตอนต่อเซิร์ฟเวอร์ไม่ได้ (ปกติแอปโหลดจากเซิร์ฟเวอร์)

## ✅ v1.1: ตั้งค่าเซิร์ฟเวอร์ได้ในแอปเลย — ไม่ต้อง build ใหม่อีก
ตั้งแต่เวอร์ชัน 1.1 แอปเก็บหน้าจอไว้ในเครื่องและมี **⚙️ ตั้งค่าเซิร์ฟเวอร์** ในหน้า login
(ปุ่มทดสอบการเชื่อมต่อ + บันทึก) — เปลี่ยนจาก LAN ไปโดเมนจริงเมื่อไหร่ก็แค่แก้ URL ในแอป
ล็อกอินใช้ token (เสถียรใน WebView) · ไฟล์ล่าสุดอยู่ ~/Downloads (ipa / aab / apk · versionCode 2)

## เปลี่ยน URL เซิร์ฟเวอร์เริ่มต้น (ค่า default ในช่องตั้งค่า)
แก้ `server.url` ใน `capacitor.config.json`:

```json
"server": { "url": "https://hr.yourcompany.com", "cleartext": false }
```

- ตอนนี้ตั้งเป็น `http://192.168.0.221:3011` (IP วง LAN ของเครื่อง dev — รันเซิร์ฟเวอร์ด้วย `PORT=3011 node server.js`)
  ใช้ได้ทั้ง iOS Simulator และ**มือถือจริงที่ต่อ WiFi วงเดียวกัน** · ถ้า IP เครื่องเปลี่ยน แก้ค่านี้แล้ว `npx cap sync` + build ใหม่
- **ก่อนส่งขึ้น store ต้องเป็น HTTPS จริง** แล้ว:
  - ลบ `NSAppTransportSecurity` ออกจาก `ios/App/App/Info.plist`
  - ลบ `android:usesCleartextTraffic="true"` ออกจาก `android/app/src/main/AndroidManifest.xml`

แก้ config แล้วรัน:

```bash
npx cap sync
```

## รัน iOS (ต้องมี Xcode)
```bash
npx cap open ios
```
แล้วกด Run ใน Xcode (เลือก Simulator หรือเครื่องจริง)

## Build Android APK (เครื่อง dev นี้ติดตั้ง JDK 21 + Android SDK ไว้แล้ว)
```bash
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug
```
ได้ไฟล์ `android/app/build/outputs/apk/debug/app-debug.apk` — ส่งให้พนักงานติดตั้งได้เลย
(ขึ้น Google Play ต้องใช้ AAB แบบ signed — ทำผ่าน Android Studio: Build → Generate Signed Bundle)

## เปลี่ยนไอคอน / splash
แทนที่ `assets/logo.png` (1024×1024) แล้ว:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#12343B' --splashBackgroundColor '#12343B'
```

## ไฟล์พร้อมส่งขึ้น Store (build แล้ว 25 ส.ค. 2026 — อยู่ใน ~/Downloads)
- `JIANCHA-HR-playstore.aab` — อัปโหลด Google Play Console ได้เลย (เซ็นด้วย `android/keystore/jiancha-release.jks`)
- `JIANCHA-HR-release.apk` — ตัว release สำหรับแจกติดตั้งตรง
- `JIANCHA-HR-ios.ipa` — เซ็นด้วยทีม JIANCHA COMPANY LIMITED (WRH3VXYCG9) อัปโหลดผ่านแอป **Transporter** หรือ Xcode → Organizer

⚠️ **keystore Android อยู่ที่ `android/keystore/` (ไม่ commit ขึ้น git) — สำรองไฟล์ .jks + รหัสไว้ให้ดี
ถ้าหายจะอัปเดตแอปบน Play Store ไม่ได้ตลอดไป** (รหัสอยู่ใน keystore.properties)

⚠️ **ก่อนกดส่งรีวิวจริง** ต้องทำก่อน ไม่งั้นโดนปฏิเสธ:
1. มีเซิร์ฟเวอร์ HTTPS สาธารณะ แล้วแก้ `server.url` ใน capacitor.config.json
2. ลบ ATS exception (iOS) และ usesCleartextTraffic (Android) ตามหัวข้อด้านบน
3. build ใหม่ทั้งสองไฟล์
4. ฝั่ง iOS เลือก bundle id: ใช้ `com.jiancha.demohr` (สร้างแอปใหม่ใน App Store Connect)
   หรือเปลี่ยนเป็น `com.jcgroupglobal.hr` (อัปเดตแทนแอป HR ตัวเดิมของบริษัท)

## ส่งขึ้น Store
สิ่งที่ต้องมี:

| | App Store (iOS) | Google Play (Android) |
|---|---|---|
| บัญชีนักพัฒนา | Apple Developer Program — $99/ปี | Google Play Console — $25 ครั้งเดียว |
| ไฟล์ที่ส่ง | Archive (.ipa) จาก Xcode → Organizer → Distribute | AAB จาก Android Studio → Build → Generate Signed Bundle |
| เงื่อนไขสำคัญ | เซิร์ฟเวอร์ต้องเป็น HTTPS + แอปต้องใช้งานได้จริงตอนรีวิว | ต้องมี privacy policy URL |

Bundle ID ปัจจุบัน: `com.jiancha.demohr` (แก้ได้ใน `capacitor.config.json` แล้ว `npx cap sync`
— ต้องตรงกับที่ลงทะเบียนใน App Store Connect / Play Console)

หมายเหตุ: Apple เข้มงวดกับแอปที่เป็น web wrapper ล้วน ๆ สำหรับแอปใช้ภายในองค์กร
พิจารณาแจกผ่าน TestFlight (ง่ายสุด, ฟรีกับบัญชี dev) หรือ Apple Business Manager แทนการขึ้น App Store สาธารณะ
