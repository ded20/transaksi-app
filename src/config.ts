// src/config.ts
// Environment configuration for development and production

const isDev = import.meta.env.DEV;

// API Base URL configuration
export const API_BASE_URL = isDev
  ? 'http://localhost:8000'
  : 'https://us-central1-transaksi-app-58901.cloudfunctions.net';

// Firebase configuration
export const FIREBASE_CONFIG = {
  projectId: 'transaksi-app-58901',
  databaseURL: 'https://transaksi-app-58901.firebaseio.com',
};

// App configuration
export const APP_CONFIG = {
  appName: 'Transaksi App',
  version: '1.0.0',
  isDev,
  isProduction: !isDev,
};

// Logging
if (isDev) {
  console.log('🔧 Development Environment');
  console.log('API Base URL:', API_BASE_URL);
} else {
  console.log('🚀 Production Environment');
  console.log('API Base URL:', API_BASE_URL);
}

export default {
  API_BASE_URL,
  FIREBASE_CONFIG,
  APP_CONFIG,
};
