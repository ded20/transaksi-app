// api/index.js
// Main Vercel serverless handler - PostgreSQL backend

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  initializeDatabase,
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
} from './db-postgres.js';

const app = express();

// Initialize database on first request
let dbInitialized = false;

async function ensureDatabaseInitialized() {
  if (dbInitialized) return;
  try {
    await initializeDatabase();
    dbInitialized = true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://ded20.github.io', 'https://transaksi-app-eta.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// Auth middleware
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.userId = userId;
  next();
}

// Password helpers
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, hashWithSalt) {
  const [salt, hash] = hashWithSalt.split(':');
  const testHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return hash === testHash;
}

function generateId() {
  return uuidv4();
}

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'Vercel Postgres',
    timestamp: new Date().toISOString(),
  });
});

// ==================== AUTH ENDPOINTS ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { username, password } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username minimal 3 karakter' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username sudah terdaftar' });
    }

    const userId = generateId();
    const passwordHash = hashPassword(password);

    await createUser(userId, username, passwordHash);

    const defaultCategories = [
      ['Gaji', '#4CAF50'],
      ['Kebutuhan', '#2196F3'],
      ['Utilitas', '#FF9800'],
      ['Hiburan', '#E91E63'],
      ['Sampingan', '#9C27B0'],
      ['Transport', '#00BCD4'],
      ['Kesehatan', '#F44336'],
    ];

    for (const [name, color] of defaultCategories) {
      await createCategory(userId, generateId(), name, color, true);
    }

    const userCategories = await getUserCategories(userId);
    const dummyTransactions = [
      { date: '2026-09-20', description: 'Gaji Bulanan', catIdx: 0, type: 'income', amount: 8000000 },
      { date: '2026-09-21', description: 'Belanja Kebutuhan Pokok', catIdx: 1, type: 'expense', amount: 1200000 },
      { date: '2026-09-21', description: 'Bayar Listrik & Air', catIdx: 2, type: 'expense', amount: 350000 },
      { date: '2026-09-22', description: 'Freelance Project A', catIdx: 4, type: 'income', amount: 1500000 },
      { date: '2026-09-22', description: 'Nonton Bioskop', catIdx: 3, type: 'expense', amount: 100000 },
      { date: '2026-09-23', description: 'Bonus Kerja', catIdx: 0, type: 'income', amount: 2000000 },
      { date: '2026-09-23', description: 'Makan Siang', catIdx: 1, type: 'expense', amount: 75000 },
      { date: '2026-09-23', description: 'Bensin Mobil', catIdx: 5, type: 'expense', amount: 150000 },
      { date: '2026-09-24', description: 'Belanja Online', catIdx: 1, type: 'expense', amount: 450000 },
      { date: '2026-09-24', description: 'Obat & Vitamin', catIdx: 6, type: 'expense', amount: 200000 },
      { date: '2026-09-24', description: 'Game Subscription', catIdx: 3, type: 'expense', amount: 100000 },
      { date: '2026-09-24', description: 'Freelance Project B', catIdx: 4, type: 'income', amount: 1000000 },
      { date: '2026-09-24', description: 'Asuransi Kesehatan', catIdx: 6, type: 'expense', amount: 300000 },
      { date: '2026-09-24', description: 'Parkir & Tol', catIdx: 5, type: 'expense', amount: 80000 },
      { date: '2026-09-24', description: 'Kopi & Snack', catIdx: 1, type: 'expense', amount: 50000 },
      { date: '2026-09-24', description: 'Cashback GoFood', catIdx: 3, type: 'income', amount: 50000 },
      { date: '2026-09-24', description: 'Internet Bulanan', catIdx: 2, type: 'expense', amount: 250000 },
      { date: '2026-09-24', description: 'Pulsa HP', catIdx: 2, type: 'expense', amount: 100000 },
      { date: '2026-09-24', description: 'Beli Buku', catIdx: 3, type: 'expense', amount: 180000 },
      { date: '2026-09-24', description: 'Tutoring Privat', catIdx: 4, type: 'income', amount: 500000 },
    ];

    for (const dummy of dummyTransactions) {
      const catId = userCategories[Math.min(dummy.catIdx, userCategories.length - 1)]?.id;
      if (catId) {
        await createTransaction(
          userId,
          generateId(),
          catId,
          dummy.date,
          dummy.description,
          dummy.type,
          dummy.amount
        );
      }
    }

    const user = await getUser(userId);
    res.json({ id: userId, username: user.username, created_at: user.created_at });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const user = await getUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    res.json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const user = await getUser(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: req.userId, username: user.username, created_at: user.created_at });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// ==================== CATEGORIES ENDPOINTS ====================

app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const categories = await getUserCategories(req.userId);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { name, color } = req.body;
    const id = generateId();
    const category = await createCategory(req.userId, id, name, color, false);
    res.json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { name, color } = req.body;
    const { id } = req.params;
    const category = await updateCategory(req.userId, id, name, color);
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { id } = req.params;
    await deleteCategory(req.userId, id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRANSACTIONS ENDPOINTS ====================

app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { search, category_id, type, date_from, date_to, sort_by } = req.query;
    const filters = {
      search,
      category_id,
      type,
      date_from,
      date_to,
      sort_by: sort_by || 'date-desc',
    };

    const transactions = await getUserTransactions(req.userId, filters);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { date, description, category_id, type, amount } = req.body;
    const id = generateId();
    const transaction = await createTransaction(
      req.userId,
      id,
      category_id,
      date,
      description,
      type,
      amount
    );
    res.json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { date, description, category_id, type, amount } = req.body;
    const { id } = req.params;
    const transaction = await updateTransaction(
      req.userId,
      id,
      category_id,
      date,
      description,
      type,
      amount
    );
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    
    const { id } = req.params;
    await deleteTransaction(req.userId, id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export as Vercel serverless function
export default app;
