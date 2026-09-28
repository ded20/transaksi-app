const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔧 Initializing Firebase Admin SDK...');

// Read service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
console.log('📂 Service account path:', serviceAccountPath);

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
console.log('✅ Service account loaded, Project ID:', serviceAccount.project_id);

// Initialize Firebase
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://transaksi-app-58901.firebaseio.com'
  });
  console.log('✅ Firebase Admin SDK initialized successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

const db = admin.database();

// ==================== USER OPERATIONS ====================

async function getUser(userId) {
  const snapshot = await db.ref(`users/${userId}`).once('value');
  return snapshot.val();
}

async function getUserByUsername(username) {
  const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
  const users = snapshot.val();
  if (!users) return null;
  
  const userArray = Object.entries(users);
  if (userArray.length === 0) return null;
  
  const [userId, userData] = userArray[0];
  return { id: userId, ...userData };
}

async function createUser(userId, username, passwordHash) {
  await db.ref(`users/${userId}`).set({
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  });
  return { id: userId, username, created_at: new Date().toISOString() };
}

// ==================== CATEGORY OPERATIONS ====================

async function getUserCategories(userId) {
  const snapshot = await db.ref(`categories/${userId}`).once('value');
  const cats = snapshot.val();
  if (!cats) return [];
  
  return Object.entries(cats).map(([id, data]) => ({ id, ...data }));
}

async function createCategory(userId, categoryId, name, color, isDefault = false) {
  await db.ref(`categories/${userId}/${categoryId}`).set({
    name,
    color,
    is_default: isDefault,
    created_at: new Date().toISOString(),
  });
  return { id: categoryId, name, color, is_default: isDefault, created_at: new Date().toISOString() };
}

async function updateCategory(userId, categoryId, name, color) {
  await db.ref(`categories/${userId}/${categoryId}`).update({ name, color });
  const snapshot = await db.ref(`categories/${userId}/${categoryId}`).once('value');
  return { id: categoryId, ...snapshot.val() };
}

async function deleteCategory(userId, categoryId) {
  await db.ref(`categories/${userId}/${categoryId}`).remove();
  
  const txnSnapshot = await db.ref(`transactions/${userId}`).once('value');
  const transactions = txnSnapshot.val();
  if (transactions) {
    for (const [txnId, txn] of Object.entries(transactions)) {
      if (txn.category_id === categoryId) {
        await db.ref(`transactions/${userId}/${txnId}`).remove();
      }
    }
  }
  
  return { message: 'Category deleted' };
}

// ==================== TRANSACTION OPERATIONS ====================

async function getUserTransactions(userId, filters = {}) {
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

async function createTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  await db.ref(`transactions/${userId}/${transactionId}`).set({
    category_id: categoryId,
    date,
    description,
    type,
    amount,
    created_at: new Date().toISOString(),
  });
  return {
    id: transactionId,
    category_id: categoryId,
    date,
    description,
    type,
    amount,
    created_at: new Date().toISOString(),
  };
}

async function updateTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  await db.ref(`transactions/${userId}/${transactionId}`).update({
    category_id: categoryId,
    date,
    description,
    type,
    amount,
  });
  const snapshot = await db.ref(`transactions/${userId}/${transactionId}`).once('value');
  return { id: transactionId, ...snapshot.val() };
}

async function deleteTransaction(userId, transactionId) {
  await db.ref(`transactions/${userId}/${transactionId}`).remove();
  return { message: 'Transaction deleted' };
}

// ==================== EXPORT FUNCTIONS ====================

module.exports = {
  db,
  getUser,
  getUserByUsername,
  createUser,
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
