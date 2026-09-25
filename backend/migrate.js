import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const jsonFile = path.join(dataDir, 'data.json');
const dbFile = path.join(dataDir, 'transaksi.db');

async function migrateJsonToSqlite() {
  console.log('📊 Starting JSON → SQLite migration...');

  // Load JSON data
  if (!fs.existsSync(jsonFile)) {
    console.log('⚠️  No JSON data file found. Skipping migration.');
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  console.log(`✅ Loaded JSON data:`, {
    users: jsonData.users?.length || 0,
    categories: jsonData.categories?.length || 0,
    transactions: jsonData.transactions?.length || 0,
  });

  // Initialize sql.js
  const SQL = await initSqlJs();
  let db;

  // Load existing SQLite or create new
  if (fs.existsSync(dbFile)) {
    const buffer = fs.readFileSync(dbFile);
    db = new SQL.Database(buffer);
    console.log('📂 Loaded existing SQLite database');
  } else {
    db = new SQL.Database();
    console.log('📂 Created new SQLite database');
  }

  try {
    // Create tables if not exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created/verified');

    // Clear existing data
    db.run('DELETE FROM transactions');
    db.run('DELETE FROM categories');
    db.run('DELETE FROM users');
    console.log('🗑️  Cleared existing data');

    // Insert users
    if (jsonData.users && jsonData.users.length > 0) {
      const insertUser = db.prepare(
        'INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
      );
      for (const user of jsonData.users) {
        insertUser.bind([user.id, user.username, user.password_hash, user.created_at]);
        insertUser.step();
        insertUser.reset();
      }
      insertUser.free();
      console.log(`✅ Inserted ${jsonData.users.length} users`);
    }

    // Insert categories
    if (jsonData.categories && jsonData.categories.length > 0) {
      const insertCategory = db.prepare(
        'INSERT INTO categories (id, user_id, name, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const cat of jsonData.categories) {
        insertCategory.bind([
          cat.id,
          cat.user_id,
          cat.name,
          cat.color,
          cat.is_default ? 1 : 0,
          cat.created_at,
        ]);
        insertCategory.step();
        insertCategory.reset();
      }
      insertCategory.free();
      console.log(`✅ Inserted ${jsonData.categories.length} categories`);
    }

    // Insert transactions
    if (jsonData.transactions && jsonData.transactions.length > 0) {
      const insertTransaction = db.prepare(
        'INSERT INTO transactions (id, user_id, category_id, date, description, type, amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const txn of jsonData.transactions) {
        insertTransaction.bind([
          txn.id,
          txn.user_id,
          txn.category_id,
          txn.date,
          txn.description,
          txn.type,
          txn.amount,
          txn.created_at,
        ]);
        insertTransaction.step();
        insertTransaction.reset();
      }
      insertTransaction.free();
      console.log(`✅ Inserted ${jsonData.transactions.length} transactions`);
    }

    // Export to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFile, buffer);
    console.log(`💾 SQLite database exported to: ${dbFile}`);

    // Verify
    const stats = fs.statSync(dbFile);
    console.log(`📊 Database size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    db.close();
  }
}

migrateJsonToSqlite().catch(console.error);
