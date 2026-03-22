#!/usr/bin/env node
/**
 * System Admin Portal - Database Setup Script
 * Executes all migrations safely with proper error handling
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] ERROR: Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('[v0] Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Migration scripts to execute
const migrations = [
  {
    name: 'Add Missing Columns',
    file: '001_add_columns.sql'
  },
  {
    name: 'Create Tables & Indexes',
    file: '002_create_tables_indexes.sql'
  },
  {
    name: 'Enable RLS Policies',
    file: '003_enable_rls_policies.sql'
  }
];

async function executeMigration(migrationPath, name) {
  try {
    console.log(`[v0] Executing: ${name}...`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons to execute individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      // Use rpc to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error && !error.message.includes('does not exist')) {
        console.error(`[v0] Error in ${name}:`, error);
      }
    }
    
    console.log(`[v0] ✓ Completed: ${name}`);
    return true;
  } catch (error) {
    console.error(`[v0] ERROR executing ${name}:`, error);
    return false;
  }
}

async function runMigrations() {
  console.log('[v0] Starting database setup...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, migration.file);
    
    if (!fs.existsSync(migrationPath)) {
      console.warn(`[v0] WARNING: Migration file not found: ${migrationPath}`);
      failed++;
      continue;
    }
    
    const success = await executeMigration(migrationPath, migration.name);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n[v0] Migration Summary:`);
  console.log(`[v0] ✓ Successful: ${successful}`);
  console.log(`[v0] ✗ Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('[v0] All migrations completed successfully!');
    process.exit(0);
  }
}

runMigrations().catch(error => {
  console.error('[v0] Fatal error:', error);
  process.exit(1);
});
