#!/usr/bin/env python3
"""
System Admin Portal Database Setup
Executes migrations directly to Supabase
"""

import os
import sys
from pathlib import Path

# Read the SQL migration files
migration_files = [
    'scripts/001_add_columns.sql',
    'scripts/002_create_tables_indexes.sql',
    'scripts/003_enable_rls_policies.sql'
]

try:
    from supabase import create_client
    
    # Get credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("[v0] ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    
    # Create client
    supabase = create_client(supabase_url, supabase_key)
    
    for migration_file in migration_files:
        file_path = Path(migration_file)
        if file_path.exists():
            print(f"[v0] Reading migration: {migration_file}")
            with open(file_path, 'r') as f:
                sql_content = f.read()
            
            # Execute the SQL
            print(f"[v0] Executing: {migration_file}")
            result = supabase.postgrest.execute_raw(sql_content)
            print(f"[v0] ✓ Completed: {migration_file}")
        else:
            print(f"[v0] WARNING: File not found: {migration_file}")
    
    print("[v0] All migrations completed successfully!")
    
except ImportError:
    print("[v0] ERROR: supabase-py not installed")
    print("[v0] Please run: uv add supabase")
    sys.exit(1)
except Exception as e:
    print(f"[v0] ERROR during migration: {str(e)}")
    sys.exit(1)
