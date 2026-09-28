# 📋 Complete Guide: Download & Setup Service Account Key

## Project ID: `transaksi-app-58901` ✅

---

## 🎯 Step 1: Open Firebase Console

**URL:** https://console.firebase.google.com/

1. Login dengan Google account yang sama
2. Kamu akan lihat projects list
3. **Select project:** `transaksi-app` (atau `transaksi-app-58901`)

---

## 🎯 Step 2: Go to Project Settings

**Di Firebase Console:**

1. Look untuk **gear icon ⚙️** di top-left corner (next to "transaksi-app")
2. Click ⚙️
3. Select **"Project Settings"**

**Kamu akan lihat tabs:**
```
[General] [Integrations] [Service Accounts]
```

---

## 🎯 Step 3: Click "Service Accounts" Tab

**Click tab:** **"Service Accounts"** (paling kanan)

You akan lihat section:
```
Firebase Admin SDK
├─ Python
├─ Node.js  ← This section
└─ Java
```

Under "Node.js" section, scroll ke bawah → lihat button **"Generate New Private Key"**

---

## 🎯 Step 4: Generate Private Key

**Click button:** **"Generate New Private Key"**

Confirmation dialog akan muncul:
```
┌─────────────────────────────────────────┐
│ Generate new private key?               │
│                                         │
│ This will create a new private key and  │
│ download it to your computer.           │
│ Keep this file safe.                    │
│                                         │
│ [Cancel]  [Generate Private Key]        │
└─────────────────────────────────────────┘
```

**Click:** **"Generate Private Key"** button

Browser akan auto-download file ke `Downloads/` folder.

---

## 🎯 Step 5: File Downloaded

**File name** (akan look like):
```
transaksi-app-58901-firebase-adminsdk-xxxxx-xxxxx.json
```

**Location:** `C:\Users\YOUR_USERNAME\Downloads\`

---

## 🎯 Step 6: Rename & Move File

**In Windows File Explorer:**

1. Open `Downloads/` folder
2. Find file: `transaksi-app-58901-firebase-adminsdk-xxxxx-xxxxx.json`
3. **Right-click → Rename**
4. Change name to: **`serviceAccountKey.json`**
5. **Cut (Ctrl+X)**

**Navigate to:**
```
C:\Users\N265\transaksi-app\backend\
```

6. **Paste (Ctrl+V)** file di folder ini

---

## 🎯 Step 7: Verify File

**Check file exists:**

Open CMD/PowerShell dan run:
```bash
dir C:\Users\N265\transaksi-app\backend\serviceAccountKey.json
```

Expected output:
```
Directory of C:\Users\N265\transaksi-app\backend

25/09/2026  12:30       1,234 serviceAccountKey.json
```

---

## ⚠️ SECURITY NOTE

✅ File `.gitignore` sudah exclude `serviceAccountKey.json`

**Verify git ignore working:**
```bash
cd C:\Users\N265\transaksi-app
git status
```

File should **NOT** appear dalam "Changes to be committed"

---

## 🎯 Step 8: File Contents Verification

File contents should look like (JSON format):

```json
{
  "type": "service_account",
  "project_id": "transaksi-app-58901",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@transaksi-app-58901.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

Key parts:
- ✅ `"project_id": "transaksi-app-58901"`
- ✅ `"type": "service_account"`
- ✅ `"private_key"` ada

---

## ✅ Done!

Once file is in `backend/` folder dengan nama `serviceAccountKey.json`:

1. **Let me know** kamu sudah selesai
2. Saya akan verify file
3. Kita continue ke Phase 1.6 (Firebase CLI verification)
4. Then Phase 2 (Database Migration)

---

## 🆘 Troubleshooting

**Q: Saya tidak menemukan "Service Accounts" tab?**
A: Pastikan kamu di Project Settings (⚙️ gear icon). Kalau masih tidak ada, refresh page.

**Q: File tidak download?**
A: Check browser download settings. File mungkin di-block. Allow downloads dari Firebase.

**Q: File name terlalu panjang, sulit di-rename?**
A: Open CMD di folder Downloads:
```bash
cd Downloads
ren "transaksi-app-58901-firebase-adminsdk-xxxxx-xxxxx.json" "serviceAccountKey.json"
move serviceAccountKey.json "C:\Users\N265\transaksi-app\backend\"
```

---

**Siap? Download file dari Firebase Console sekarang!** 👍
