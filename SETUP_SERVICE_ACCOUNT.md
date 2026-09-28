# 📋 Step-by-Step: Download Firebase Service Account Key

## 1️⃣ Go to Firebase Console

**URL:** https://console.firebase.google.com/

- Login dengan Google account yang sama (atau buat baru)
- Pilih project **`transaksi-app`** yang sudah kamu buat di Phase 1

---

## 2️⃣ Navigate to Project Settings

**Di Firebase Console:**

1. Look untuk gear icon ⚙️ di **top-left corner** (next to project name)
2. Click ⚙️ → Select **"Project Settings"**

**Expected screenshot:**
```
Firebase Console
├── transaksi-app (project name)
├── ⚙️ (gear icon) ← CLICK HERE
└── Project Settings ← SELECT THIS
```

---

## 3️⃣ Go to Service Accounts Tab

**Di Project Settings page:**

1. Lihat tabs di top: **"General"**, **"Integrations"**, **"Service Accounts"**
2. Click tab **"Service Accounts"** (paling kanan)

**You should see:**
```
Firebase Admin SDK
├─ Python
├─ Node.js ← This one
├─ Java
└─ Go
```

---

## 4️⃣ Generate New Private Key

**Di Service Accounts tab:**

1. Lihat section **"Firebase Admin SDK"**
2. Scroll ke bawah → button **"Generate New Private Key"**
3. Click tombol itu

**Confirmation dialog akan muncul:**
```
Generate new private key?

This will create a new private key and download it 
to your computer. Keep this file safe.

[Cancel] [Generate Private Key]
```

4. Click **"Generate Private Key"**
5. File akan **auto-download** ke `Downloads/` folder

**Filename contoh:**
```
transaksi-app-xxxxx-firebase-adminsdk-xxxxx-xxxxx.json
```

---

## 5️⃣ Save to Backend Folder

**Setelah download selesai:**

1. Find file di `Downloads/` folder
2. **Rename ke:** `serviceAccountKey.json` (untuk simplicity)
3. **Cut/Move ke:** `C:\Users\N265\transaksi-app\backend\`

**Final path:**
```
C:\Users\N265\transaksi-app\backend\serviceAccountKey.json
```

---

## ⚠️ IMPORTANT: Don't Commit!

✅ File `.gitignore` sudah ter-update untuk ignore `serviceAccountKey.json`

**Verify:**
```bash
cd C:\Users\N265\transaksi-app
git status
# Should NOT show serviceAccountKey.json in "Changes to be committed"
```

---

## 📝 File Contents (for reference)

Service Account Key file akan look like ini:

```json
{
  "type": "service_account",
  "project_id": "transaksi-app-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@transaksi-app-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40transaksi-app-xxxxx.iam.gserviceaccount.com"
}
```

**⚠️ NEVER SHARE THIS FILE!** Ini like password untuk Firebase database.

---

## ✅ Verification

After file saved to `backend/serviceAccountKey.json`:

```bash
# Check file exists
dir C:\Users\N265\transaksi-app\backend\serviceAccountKey.json

# Should show:
# -a----  25/09/2026  10:30       1234 serviceAccountKey.json
```

---

## 🎯 Next Steps

Once file saved:
1. ✅ Verify file exists
2. ✅ Check git ignore working
3. ✅ Move to Phase 1.6 (Firebase Config)

---

**Done? Let me know once file is saved to backend/ folder!** 👍
