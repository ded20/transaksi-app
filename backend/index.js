import express from 'express';
import cors from 'cors';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'data.json');

// Create data directory
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ users: [], categories: [], transactions: [] }, null, 2));
}

function loadData() {
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  // Auto-sync to SQLite in background
  syncToSqlite();
}

function syncToSqlite() {
  // Run migration asynchronously in background (non-blocking)
  const child = spawn('node', ['migrate.js'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });
  child.unref(); // Don't wait for child process
}

// Password helpers
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, hashWithSalt) {
  const [salt, hash] = hashWithSalt.split(':');
  const testHash = createHash('sha256').update(password + salt).digest('hex');
  return hash === testHash;
}

function generateId() {
  return uuidv4();
}

const app = express();
const PORT = 8000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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

// ==================== AUTH ====================

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username minimal 3 karakter' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const data = loadData();
    const existing = data.users.find(u => u.username === username);
    if (existing) {
      return res.status(400).json({ error: 'Username sudah terdaftar' });
    }

    const userId = generateId();
    const passwordHash = hashPassword(password);

    data.users.push({
      id: userId,
      username,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    });

    // Create default categories
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
      data.categories.push({
        id: generateId(),
        user_id: userId,
        name,
        color,
        is_default: true,
        created_at: new Date().toISOString(),
      });
    }

    // Create dummy transactions
    const userCategories = data.categories.filter(c => c.user_id === userId);
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
        data.transactions.push({
          id: generateId(),
          user_id: userId,
          category_id: catId,
          date: dummy.date,
          description: dummy.description,
          type: dummy.type,
          amount: dummy.amount,
          created_at: new Date().toISOString(),
        });
      }
    }

    saveData(data);
    const user = data.users.find(u => u.id === userId);
    res.json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const data = loadData();
    const user = data.users.find(u => u.username === username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    res.json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const data = loadData();
    const user = data.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// ==================== CATEGORIES ====================

app.get('/api/categories', authMiddleware, (req, res) => {
  try {
    const data = loadData();
    const categories = data.categories.filter(c => c.user_id === req.userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', authMiddleware, (req, res) => {
  const { name, color } = req.body;
  
  try {
    const data = loadData();
    const category = {
      id: generateId(),
      user_id: req.userId,
      name,
      color,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    data.categories.push(category);
    saveData(data);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', authMiddleware, (req, res) => {
  const { name, color } = req.body;
  const { id } = req.params;

  try {
    const data = loadData();
    const category = data.categories.find(c => c.id === id && c.user_id === req.userId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    category.name = name;
    category.color = color;
    saveData(data);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    const data = loadData();
    data.categories = data.categories.filter(c => !(c.id === id && c.user_id === req.userId));
    data.transactions = data.transactions.filter(t => !(t.category_id === id && t.user_id === req.userId));
    saveData(data);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRANSACTIONS ====================

app.get('/api/transactions', authMiddleware, (req, res) => {
  try {
    const { search, category_id, type, date_from, date_to, sort_by = 'date-desc' } = req.query;
    const data = loadData();

    let transactions = data.transactions.filter(t => t.user_id === req.userId);

    if (search) {
      transactions = transactions.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (category_id) {
      transactions = transactions.filter(t => t.category_id === category_id);
    }
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    if (date_from) {
      transactions = transactions.filter(t => t.date >= date_from);
    }
    if (date_to) {
      transactions = transactions.filter(t => t.date <= date_to);
    }

    if (sort_by === 'date-asc') {
      transactions.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort_by === 'date-desc') {
      transactions.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sort_by === 'amount-asc') {
      transactions.sort((a, b) => a.amount - b.amount);
    } else if (sort_by === 'amount-desc') {
      transactions.sort((a, b) => b.amount - a.amount);
    }

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', authMiddleware, (req, res) => {
  const { date, description, category_id, type, amount } = req.body;

  try {
    const data = loadData();
    const transaction = {
      id: generateId(),
      user_id: req.userId,
      category_id,
      date,
      description,
      type,
      amount,
      created_at: new Date().toISOString(),
    };
    data.transactions.push(transaction);
    saveData(data);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', authMiddleware, (req, res) => {
  const { date, description, category_id, type, amount } = req.body;
  const { id } = req.params;

  try {
    const data = loadData();
    const transaction = data.transactions.find(t => t.id === id && t.user_id === req.userId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    transaction.date = date;
    transaction.description = description;
    transaction.category_id = category_id;
    transaction.type = type;
    transaction.amount = amount;
    saveData(data);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    const data = loadData();
    data.transactions = data.transactions.filter(t => !(t.id === id && t.user_id === req.userId));
    saveData(data);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'JSON File', path: dataFile });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database file: ${dataFile}`);
});
