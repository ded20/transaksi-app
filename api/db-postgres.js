// api/db-postgres.js
// PostgreSQL database operations using @vercel/postgres

import { sql } from '@vercel/postgres';

// ==================== INIT DATABASE ====================

export async function initializeDatabase() {
  try {
    // Create tables if not exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        category_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        description VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `;

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// ==================== USER OPERATIONS ====================

export async function getUser(userId) {
  try {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

export async function getUserByUsername(username) {
  try {
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user by username error:', error);
    throw error;
  }
}

export async function createUser(userId, username, passwordHash) {
  try {
    const result = await sql`
      INSERT INTO users (id, username, password_hash)
      VALUES (${userId}, ${username}, ${passwordHash})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

// ==================== CATEGORY OPERATIONS ====================

export async function getUserCategories(userId) {
  try {
    const result = await sql`
      SELECT * FROM categories WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
}

export async function createCategory(userId, categoryId, name, color, isDefault) {
  try {
    const result = await sql`
      INSERT INTO categories (id, user_id, name, color, is_default)
      VALUES (${categoryId}, ${userId}, ${name}, ${color}, ${isDefault})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
}

export async function updateCategory(userId, categoryId, name, color) {
  try {
    const result = await sql`
      UPDATE categories
      SET name = ${name}, color = ${color}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${categoryId} AND user_id = ${userId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
}

export async function deleteCategory(userId, categoryId) {
  try {
    await sql`
      DELETE FROM categories
      WHERE id = ${categoryId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
}

// ==================== TRANSACTION OPERATIONS ====================

export async function getUserTransactions(userId, filters = {}) {
  try {
    let query = sql`SELECT * FROM transactions WHERE user_id = ${userId}`;

    // Build WHERE clause based on filters
    if (filters.category_id) {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} AND category_id = ${filters.category_id}`;
    }
    if (filters.type) {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} AND type = ${filters.type}`;
    }
    if (filters.date_from) {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} AND date >= ${filters.date_from}`;
    }
    if (filters.date_to) {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} AND date <= ${filters.date_to}`;
    }

    // Sort
    const sortBy = filters.sort_by || 'date-desc';
    if (sortBy === 'date-desc') {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date DESC`;
    } else if (sortBy === 'date-asc') {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date ASC`;
    } else if (sortBy === 'amount-desc') {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY amount DESC`;
    } else if (sortBy === 'amount-asc') {
      query = sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY amount ASC`;
    }

    const result = await query;
    return result.rows;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
}

export async function createTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  try {
    const result = await sql`
      INSERT INTO transactions (id, user_id, category_id, date, description, type, amount)
      VALUES (${transactionId}, ${userId}, ${categoryId}, ${date}, ${description}, ${type}, ${amount})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Create transaction error:', error);
    throw error;
  }
}

export async function updateTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  try {
    const result = await sql`
      UPDATE transactions
      SET category_id = ${categoryId}, date = ${date}, description = ${description}, 
          type = ${type}, amount = ${amount}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId} AND user_id = ${userId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
}

export async function deleteTransaction(userId, transactionId) {
  try {
    await sql`
      DELETE FROM transactions
      WHERE id = ${transactionId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw error;
  }
}
