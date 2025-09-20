#!/usr/bin/env node

/**
 * Script to set up test users for the Karigari platform
 * 
 * This script creates default test users for each role:
 * - Admin user
 * - Customer user
 * - Artisan user
 */

import axios from 'axios';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const ADMIN_CREDS = {
  email: 'admin@karigari.com',
  password: 'admin123'
};
const CUSTOMER_CREDS = {
  name: 'Test Customer',
  email: 'customer@test.com',
  password: 'password123',
  role: 'customer'
};
const ARTISAN_CREDS = {
  name: 'Test Artisan',
  email: 'artisan@test.com',
  password: 'password123',
  role: 'artisan'
};

async function createTestUsers() {
  console.log('Setting up test users for Karigari platform...\n');
  
  try {
    // Create admin user
    console.log('1. Creating admin user...');
    try {
      await axios.post(`${BASE_URL}/auth/create-admin`, {
        adminPassword: ADMIN_CREDS.password
      });
      console.log('   ✓ Admin user created successfully');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ℹ Admin user already exists');
      } else {
        throw error;
      }
    }
    
    // Create customer user
    console.log('2. Creating customer user...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, CUSTOMER_CREDS);
      console.log('   ✓ Customer user created successfully');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ℹ Customer user already exists');
      } else {
        throw error;
      }
    }
    
    // Create artisan user
    console.log('3. Creating artisan user...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, ARTISAN_CREDS);
      console.log('   ✓ Artisan user created successfully');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ℹ Artisan user already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Test users setup completed!');
    console.log('\nDefault credentials:');
    console.log(`   Admin:     ${ADMIN_CREDS.email} / ${ADMIN_CREDS.password}`);
    console.log(`   Customer:  ${CUSTOMER_CREDS.email} / ${CUSTOMER_CREDS.password}`);
    console.log(`   Artisan:   ${ARTISAN_CREDS.email} / ${ARTISAN_CREDS.password}`);
    
  } catch (error) {
    console.error('❌ Error setting up test users:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers();
}

export {
  ADMIN_CREDS,
  CUSTOMER_CREDS,
  ARTISAN_CREDS
};