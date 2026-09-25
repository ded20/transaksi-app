# 🚀 GitHub Pages + Firebase Deployment Plan

**Timeline:** ~6-8 hours total  
**Difficulty:** Medium  
**Cost:** FREE ✅  
**Status:** Ready to execute

---

## 📋 Phase Overview

```
Phase 1: Setup & Preparation (1 hour)
├─ Create GitHub repo
├─ Create Firebase project
└─ Setup local environment

Phase 2: Database Migration (2-3 hours)
├─ Refactor data model (JSON → Firebase)
├─ Create Firebase schema
└─ Migrate existing data

Phase 3: Backend Refactor (2-3 hours)
├─ Replace file I/O with Firebase SDK
├─ Update API endpoints
├─ Test locally

Phase 4: Frontend Setup (1 hour)
├─ Build optimization
├─ API endpoint updates
├─ Environment variables

Phase 5: Deployment (1-2 hours)
├─ Deploy backend (Firebase Functions)
├─ Deploy frontend (GitHub Pages)
├─ Testing & debugging

Total: ~8 hours
```

---

## 🎯 Phase 1: Setup & Preparation (1 hour)

### Step 1.1: Create GitHub Repository

```bash
# Option A: If not already on GitHub
cd C:\Users\N265\transaksi-app
git init
git add .
git commit -m "Initial commit: full stack transaction app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/transaksi-app.git
git push -u origin main
```

### Step 1.2: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `transaksi-app`
4. No Google Analytics (for speed)
5. Create project
6. Wait for setup (1-2 minutes)

### Step 1.3: Enable Services in Firebase

**In Firebase Console:**

1. **Realtime Database**
   - Go to Build → Realtime Database
   - Create database
   - Location: `asia-southeast1` (Singapore - closest to Indonesia)
   - Start in test mode (for now)
   - Click Create

2. **Cloud Functions**
   - Go to Build → Cloud Functions
   - Note: We'll deploy via CLI

3. **Hosting (optional, for frontend)**
   - Go to Build → Hosting
   - Note: We'll use GitHub Pages instead

### Step 1.4: Setup Firebase CLI Locally

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify
firebase --version
```

### Step 1.5: Create Firebase Config File

Create `backend/.firebaserc`:

```json
{
  "projects": {
    "default": "transaksi-app-YOUR_PROJECT_ID"
  }
}
```

Get PROJECT_ID from Firebase Console → Project Settings.

---

## 🗄️ Phase 2: Database Migration (2-3 hours)

### Step 2.1: Understand Firebase Realtime DB Structure

**Current (JSON file):**
```json
{
  "users": [
    { "id": "...", "username": "demo", ... }
  ],
  "categories": [
    { "id": "...", "user_id": "...", ... }
  ],
  "transactions": [
    { "id": "...", "user_id": "...", ... }
  ]
}
```

**Firebase Realtime DB (tree structure):**
```
root/
├── users/
│   ├── USER_ID_1/
│   │   ├── username: "demo"
│   │   ├── password_hash: "..."
│   │   └── created_at: timestamp
│   └── USER_ID_2/
│       └── ...
├── categories/
│   ├── USER_ID_1/
│   │   ├── CAT_ID_1: { name, color, is_default, ... }
│   │   └── CAT_ID_2: { ... }
│   └── USER_ID_2/
│       └── ...
└── transactions/
    ├── USER_ID_1/
    │   ├── TXN_ID_1: { date, description, category_id, ... }
    │   └── TXN_ID_2: { ... }
    └── USER_ID_2/
        └── ...
```

### Step 2.2: Create Migration Script

Create `backend/migrate-to-firebase.js`:

```javascript
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://transaksi-app-YOUR_PROJECT_ID.firebaseio.com'
});

const db = admin.database();

async function migrateData() {
  try {
    console.log('📊 Starting migration: JSON → Firebase Realtime DB...\n');

    // Load existing JSON data
    const jsonFile = path.join(__dirname, 'data', 'data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

    console.log(`✅ Loaded JSON data:`, {
      users: jsonData.users?.length || 0,
      categories: jsonData.categories?.length || 0,
      transactions: jsonData.transactions?.length || 0,
    });

    // Migrate users
    console.log('\n📝 Migrating users...');
    for (const user of jsonData.users || []) {
      await db.ref(`users/${user.id}`).set({
        username: user.username,
        password_hash: user.password_hash,
        created_at: user.created_at,
      });
      console.log(`  ✅ User: ${user.username}`);
    }

    // Migrate categories (grouped by user_id)
    console.log('\n📝 Migrating categories...');
    const categoryMap = {};
    for (const cat of jsonData.categories || []) {
      if (!categoryMap[cat.user_id]) {
        categoryMap[cat.user_id] = {};
      }
      categoryMap[cat.user_id][cat.id] = {
        name: cat.name,
        color: cat.color,
        is_default: cat.is_default,
        created_at: cat.created_at,
      };
    }
    await db.ref('categories').set(categoryMap);
    console.log(`  ✅ Categories migrated (${Object.keys(categoryMap).length} users)`);

    // Migrate transactions (grouped by user_id)
    console.log('\n📝 Migrating transactions...');
    const transactionMap = {};
    for (const txn of jsonData.transactions || []) {
      if (!transactionMap[txn.user_id]) {
        transactionMap[txn.user_id] = {};
      }
      transactionMap[txn.user_id][txn.id] = {
        category_id: txn.category_id,
        date: txn.date,
        description: txn.description,
        type: txn.type,
        amount: txn.amount,
        created_at: txn.created_at,
      };
    }
    await db.ref('transactions').set(transactionMap);
    console.log(`  ✅ Transactions migrated (${Object.keys(transactionMap).length} users)`);

    console.log('\n✅ Migration complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateData();
```

### Step 2.3: Get Firebase Service Account Key

1. Firebase Console → Project Settings (⚙️)
2. Service Accounts tab
3. Click "Generate New Private Key"
4. Save as `backend/serviceAccountKey.json`
5. **⚠️ Add to .gitignore** (don't commit!)

Update `backend/.gitignore`:
```
node_modules/
serviceAccountKey.json
.env
data/
```

### Step 2.4: Run Migration

```bash
cd backend
npm install firebase-admin

# Update databaseURL in migrate script
node migrate-to-firebase.js
```

Expected output:
```
📊 Starting migration: JSON → Firebase Realtime DB...

✅ Loaded JSON data: { users: 2, categories: 15, transactions: 20 }

📝 Migrating users...
  ✅ User: test
  ✅ User: demo

📝 Migrating categories...
  ✅ Categories migrated (2 users)

📝 Migrating transactions...
  ✅ Transactions migrated (2 users)

✅ Migration complete!
```

### Step 2.5: Verify Data in Firebase Console

Go to Firebase Console → Realtime Database → Data tab. Should see:
- `users/`
- `categories/`
- `transactions/`

---

## 🔧 Phase 3: Backend Refactor (2-3 hours)

### Step 3.1: Install Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### Step 3.2: Create Firebase Backend Module

Create `backend/firebase-db.js`:

```javascript
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://transaksi-app-YOUR_PROJECT_ID.firebaseio.com'
});

export const db = admin.database();

// Helper functions

export async function getUser(userId) {
  const snapshot = await db.ref(`users/${userId}`).once('value');
  return snapshot.val();
}

export async function getUserByUsername(username) {
  const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
  const users = snapshot.val();
  if (!users) return null;
  return Object.values(users)[0];
}

export async function createUser(userId, username, passwordHash) {
  await db.ref(`users/${userId}`).set({
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  });
}

export async function getUserCategories(userId) {
  const snapshot = await db.ref(`categories/${userId}`).once('value');
  const cats = snapshot.val();
  if (!cats) return [];
  return Object.entries(cats).map(([id, data]) => ({ id, ...data }));
}

export async function createCategory(userId, categoryId, name, color, isDefault = false) {
  await db.ref(`categories/${userId}/${categoryId}`).set({
    name,
    color,
    is_default: isDefault,
    created_at: new Date().toISOString(),
  });
}

export async function updateCategory(userId, categoryId, name, color) {
  await db.ref(`categories/${userId}/${categoryId}`).update({ name, color });
}

export async function deleteCategory(userId, categoryId) {
  await db.ref(`categories/${userId}/${categoryId}`).remove();
  // Also delete associated transactions
  const txnSnapshot = await db.ref(`transactions/${userId}`).once('value');
  const transactions = txnSnapshot.val();
  if (transactions) {
    for (const [txnId, txn] of Object.entries(transactions)) {
      if (txn.category_id === categoryId) {
        await db.ref(`transactions/${userId}/${txnId}`).remove();
      }
    }
  }
}

export async function getUserTransactions(userId, filters = {}) {
  const snapshot = await db.ref(`transactions/${userId}`).once('value');
  let transactions = snapshot.val();
  if (!transactions) return [];

  transactions = Object.entries(transactions).map(([id, data]) => ({ id, ...data }));

  // Apply filters
  if (filters.search) {
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  if (filters.category_id) {
    transactions = transactions.filter(t => t.category_id === filters.category_id);
  }
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  if (filters.date_from) {
    transactions = transactions.filter(t => t.date >= filters.date_from);
  }
  if (filters.date_to) {
    transactions = transactions.filter(t => t.date <= filters.date_to);
  }

  // Apply sorting
  if (filters.sort_by === 'date-asc') {
    transactions.sort((a, b) => a.date.localeCompare(b.date));
  } else if (filters.sort_by === 'date-desc') {
    transactions.sort((a, b) => b.date.localeCompare(a.date));
  } else if (filters.sort_by === 'amount-asc') {
    transactions.sort((a, b) => a.amount - b.amount);
  } else if (filters.sort_by === 'amount-desc') {
    transactions.sort((a, b) => b.amount - a.amount);
  } else {
    transactions.sort((a, b) => b.date.localeCompare(a.date));
  }

  return transactions;
}

export async function createTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  await db.ref(`transactions/${userId}/${transactionId}`).set({
    category_id: categoryId,
    date,
    description,
    type,
    amount,
    created_at: new Date().toISOString(),
  });
}

export async function updateTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  await db.ref(`transactions/${userId}/${transactionId}`).update({
    category_id: categoryId,
    date,
    description,
    type,
    amount,
  });
}

export async function deleteTransaction(userId, transactionId) {
  await db.ref(`transactions/${userId}/${transactionId}`).remove();
}
```

### Step 3.3: Update Backend index.js

Replace file I/O calls with Firebase calls. Key changes:

```javascript
// OLD (before)
import { loadData, saveData } from './data-loader.js';
const data = loadData();

// NEW (after)
import { 
  getUser, 
  getUserByUsername, 
  createUser, 
  getUserCategories, 
  createCategory, 
  getUserTransactions, 
  createTransaction 
} from './firebase-db.js';

// Example endpoint update

// OLD
app.post('/api/auth/login', (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.username === username);
  // ...
});

// NEW
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await getUserByUsername(username);
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Full refactored `backend/index.js` will be provided in Phase 3.4**

### Step 3.4: Create Refactored Backend

Create `backend/index-firebase.js` - complete refactored version with all Firebase calls.

[This will be a large file - I'll create it as a separate implementation]

### Step 3.5: Test Locally

```bash
# Stop old backend
# Kill Node process on port 8000

# Start new Firebase backend
node backend/index-firebase.js

# Test endpoints
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# Should return user data
```

---

## 🎨 Phase 4: Frontend Setup (1 hour)

### Step 4.1: Update API Base URL

Create `src/config.ts`:

```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://us-central1-transaksi-app-YOUR_PROJECT_ID.cloudfunctions.net'
  : 'http://localhost:8000';
```

Update `src/composables/useApi.ts`:

```typescript
import { API_BASE_URL } from '../config';

const baseUrl = API_BASE_URL;
```

### Step 4.2: Environment Variables

Create `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

Create `.env.production`:

```
VITE_API_BASE_URL=https://us-central1-transaksi-app-YOUR_PROJECT_ID.cloudfunctions.net
```

Update config:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Step 4.3: Build Frontend

```bash
npm run build
```

Output: `dist/` folder ready for GitHub Pages

### Step 4.4: Setup GitHub Pages

Update `vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config
  base: '/transaksi-app/', // Match GitHub Pages URL structure
});
```

Rebuild:

```bash
npm run build
```

---

## 🚀 Phase 5: Deployment (1-2 hours)

### Step 5.1: Deploy Backend to Firebase Functions

#### Create Firebase Functions

Create `backend/functions/index.js`:

```javascript
// Copy backend/index.js code here but adapted for Cloud Functions
// Export as HTTP-triggered function
```

#### Deploy

```bash
firebase deploy --only functions
```

Get function URL:
```
Function URL: https://us-central1-transaksi-app-YOUR_PROJECT_ID.cloudfunctions.net/api
```

### Step 5.2: Deploy Frontend to GitHub Pages

```bash
# Ensure everything committed
git add .
git commit -m "Setup Firebase deployment"
git push origin main

# Install gh-pages package
npm install --save-dev gh-pages

# Add deploy script to package.json
```

Update `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "gh-pages -d dist"
  }
}
```

Deploy:

```bash
npm run build
npm run deploy
```

### Step 5.3: Configure GitHub Pages Settings

1. Go to GitHub repo → Settings
2. Pages section
3. Source: `gh-pages` branch
4. Save
5. Wait 2-3 minutes for deployment

Check: `https://YOUR_USERNAME.github.io/transaksi-app/`

### Step 5.4: Update CORS in Firebase Backend

In Cloud Functions, add CORS headers:

```javascript
app.use(cors({
  origin: [
    'https://YOUR_USERNAME.github.io',
    'http://localhost:5173'
  ],
  credentials: true,
}));
```

Redeploy:

```bash
firebase deploy --only functions
```

### Step 5.5: Testing

1. Visit: `https://YOUR_USERNAME.github.io/transaksi-app/`
2. Try login/register
3. Create transaction
4. Check Firebase Console → Realtime Database (should see new data)

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] Realtime Database setup
- [ ] Service account key generated + added to .gitignore
- [ ] Migration script ran successfully
- [ ] Data verified in Firebase Console
- [ ] Backend refactored to use Firebase
- [ ] Backend tested locally with Firebase
- [ ] Frontend environment variables set
- [ ] Frontend built successfully
- [ ] GitHub repo created + pushed
- [ ] GitHub Pages settings configured

### Deployment
- [ ] Backend deployed to Cloud Functions
- [ ] Function URL obtained
- [ ] Frontend API URL updated
- [ ] Frontend deployed to GitHub Pages
- [ ] CORS configured in backend
- [ ] Tested: Login works
- [ ] Tested: Create transaction
- [ ] Tested: Data persists in Firebase
- [ ] Tested: Mobile responsive

### Post-Deployment
- [ ] Monitor Firebase usage
- [ ] Setup Firebase security rules (eventually)
- [ ] Custom domain (optional)
- [ ] Domain SSL certificate (automatic)

---

## 🔐 Security Notes

### Firebase Security Rules (Set Later)

For now (dev):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production (IMPORTANT - add later):
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "categories": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "transactions": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 💰 Cost Breakdown

**Firebase Realtime Database (Free Tier):**
- 100 connections/day ✅
- 1 GB storage ✅
- Generous for small app

**Cloud Functions (Free Tier):**
- 2M invocations/month ✅
- Good for API calls

**GitHub Pages:**
- Unlimited bandwidth ✅
- Free forever ✅

**Total Cost:** $0 ✅

---

## 📝 Final URLs

```
Frontend (GitHub Pages):
https://YOUR_USERNAME.github.io/transaksi-app/

Backend (Cloud Functions):
https://us-central1-transaksi-app-YOUR_PROJECT_ID.cloudfunctions.net

Database (Firebase Realtime DB):
https://firebase.google.com/console
```

---

## ⏱️ Timeline Reminder

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Setup & Preparation | 1 hr | 🔄 TODO |
| 2 | Database Migration | 2-3 hrs | 🔄 TODO |
| 3 | Backend Refactor | 2-3 hrs | 🔄 TODO |
| 4 | Frontend Setup | 1 hr | 🔄 TODO |
| 5 | Deployment | 1-2 hrs | 🔄 TODO |
| **TOTAL** | | **7-10 hrs** | |

---

## 🆘 Troubleshooting

### Firebase Connection Fails
- Check `serviceAccountKey.json` path
- Verify `databaseURL` correct
- Check Firebase Console → Database access

### CORS Errors
- Add GitHub Pages URL to allowed origins
- Redeploy Cloud Functions

### Backend Not Found (404)
- Check Cloud Functions deployment status
- Verify function URL in frontend config
- Check Firebase Console → Cloud Functions

### GitHub Pages Not Updating
- Clear browser cache
- Wait 5 minutes for deployment
- Check GitHub → Actions for build status

---

**Ready to start?** Let me know which phase you want to begin with! 🚀
