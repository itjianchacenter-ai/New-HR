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

## เปลี่ยน URL เซิร์ฟเวอร์ (สำคัญที่สุด)
แก้ `server.url` ใน `capacitor.config.json`:

```json
"server": { "url": "https://hr.yourcompany.com", "cleartext": false }
```

- ตอนนี้ตั้งเป็น `http://localhost:3011` (เซิร์ฟเวอร์เดโม่ของ repo นี้ — รันด้วย `PORT=3011 node server.js`) — ใช้ได้เฉพาะ **iOS Simulator บนเครื่องที่รันเซิร์ฟเวอร์**
- ทดสอบบนมือถือจริงในวง LAN: ใช้ IP เครื่อง เช่น `http://192.168.0.221:3010`
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

## รัน Android (ต้องติดตั้ง Android Studio ก่อน)
1. ติดตั้ง [Android Studio](https://developer.android.com/studio) (มี SDK + JDK ในตัว)
2. ```bash
   npx cap open android
   ```
3. กด Run ใน Android Studio

## เปลี่ยนไอคอน / splash
แทนที่ `assets/logo.png` (1024×1024) แล้ว:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#12343B' --splashBackgroundColor '#12343B'
```

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
