// api/db-postgres.js
// Supabase PostgreSQL database operations

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== INIT DATABASE ====================

export async function initializeDatabase() {
  try {
    console.log('✅ Supabase database ready');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// ==================== USER OPERATIONS ====================

export async function getUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

export async function getUserByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Get user by username error:', error);
    throw error;
  }
}

export async function createUser(userId, username, passwordHash) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          username,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

// ==================== CATEGORY OPERATIONS ====================

export async function getUserCategories(userId) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
}

export async function createCategory(userId, categoryId, name, color, isDefault) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          id: categoryId,
          user_id: userId,
          name,
          color,
          is_default: isDefault,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
}

export async function updateCategory(userId, categoryId, name, color) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
}

export async function deleteCategory(userId, categoryId) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
}

// ==================== TRANSACTION OPERATIONS ====================

export async function getUserTransactions(userId, filters = {}) {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    const sortBy = filters.sort_by || 'date-desc';
    if (sortBy === 'date-desc') {
      query = query.order('date', { ascending: false });
    } else if (sortBy === 'date-asc') {
      query = query.order('date', { ascending: true });
    } else if (sortBy === 'amount-desc') {
      query = query.order('amount', { ascending: false });
    } else if (sortBy === 'amount-asc') {
      query = query.order('amount', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
}

export async function createTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          id: transactionId,
          user_id: userId,
          category_id: categoryId,
          date,
          description,
          type,
          amount,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create transaction error:', error);
    throw error;
  }
}

export async function updateTransaction(userId, transactionId, categoryId, date, description, type, amount) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id: categoryId,
        date,
        description,
        type,
        amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
}

export async function deleteTransaction(userId, transactionId) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw error;
  }
}
