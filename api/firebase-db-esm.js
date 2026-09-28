// api/firebase-db-esm.js
// ESM wrapper untuk Firebase Database operations

import admin from 'firebase-admin';

let db = null;

// Initialize Firebase (akan di-call dari api/index.js)
export function initializeFirebase(serviceAccountKey) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        databaseURL: 'https://transaksi-app-58901.firebaseio.com'
      });
    }
    db = admin.database();
    console.log('✅ Firebase initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

// ==================== USER OPERATIONS ====================

export async function getUser(userId) {
  const snapshot = await db.ref(`users/${userId}`).once('value');
  return snapshot.val();
}

export async function getUserByUsername(username) {
  const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
  const users = snapshot.val();
  if (!users) return null;
  
  const userArray = Object.entries(users);
  if (userArray.length === 0) return null;
  
  const [userId, userData] = userArray[0];
  return { id: userId, ...userData };
}

export async function createUser(userId, username, passwordHash) {
  const newUser = {
    id: userId,
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  await db.ref(`users/${userId}`).set(newUser);
  return newUser;
}

// ==================== CATEGORY OPERATIONS ====================

export async function getUserCategories(userId) {
  const snapshot = await db.ref(`categories/${userId}`).once('value');
  const categories = snapshot.val();
  if (!categories) return [];
  
  return Object.entries(categories).map(([id, data]) => ({
    id,
    ...data,
  }));
}

export async function createCategory(userId, categoryId, name, color, isDefault) {
  const newCategory = {
    id: categoryId,
    name,
    color,
    is_default: isDefault,
    created_at: new Date().toISOString(),
  };
  await db.ref(`categories/${userId}/${categoryId}`).set(newCategory);
  return newCategory;
}

export async function updateCategory(userId, categoryId, name, color) {
  const update = { name, color, updated_at: new Date().toISOString() };
  await db.ref(`categories/${userId}/${categoryId}`).update(update);
  return { id: categoryId, name, color, ...update };
}

export async function deleteCategory(userId, categoryId) {
  await db.ref(`categories/${userId}/${categoryId}`).remove();
}

// ==================== TRANSACTION OPERATIONS ====================

export async function getUserTransactions(userId, filters = {}) {
  const snapshot = await db.ref(`transactions/${userId}`).once('value');
  let transactions = snapshot.val();
  if (!transactions) return [];
  
  let result = Object.entries(transactions).map(([id, data]) => ({
    id,
    ...data,
  }));

  // Apply filters
  if (filters.search) {
    result = result.filter(t => 
      t.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  if (filters.category_id) {
    result = result.filter(t => t.category_id === filters.category_id);
  }
  
  if (filters.type) {
    result = result.filter(t => t.type === filters.type);
  }
  
  if (filters.date_from) {
    result = result.filter(t => t.date >= filters.date_from);
  }
  
  if (filters.date_to) {
    result = result.filter(t => t.date <= filters.date_to);
  }

  // Sort
  const sortBy = filters.sort_by || 'date-desc';
  if (sortBy === 'date-desc') {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'date-asc') {
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy === 'amount-desc') {
    result.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === 'amount-asc') {
    result.sort((a, b) => a.amount - b.amount);
  }

  return result;
}

export async function createTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  const newTransaction = {
    id: transactionId,
    category_id: categoryId,
    date,
    description,
    type,
    amount,
    created_at: new Date().toISOString(),
  };
  await db.ref(`transactions/${userId}/${transactionId}`).set(newTransaction);
  return newTransaction;
}

export async function updateTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  const update = {
    category_id: categoryId,
    date,
    description,
    type,
    amount,
    updated_at: new Date().toISOString(),
  };
  await db.ref(`transactions/${userId}/${transactionId}`).update(update);
  return { id: transactionId, ...update };
}

export async function deleteTransaction(userId, transactionId) {
  await db.ref(`transactions/${userId}/${transactionId}`).remove();
}
