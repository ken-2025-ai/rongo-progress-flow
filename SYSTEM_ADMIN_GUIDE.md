# 🛡️ System Admin Portal - Complete Guide

## Overview
This is a **production-grade System Admin Portal** for managing the entire Postgraduate Research Workflow system. As a **Senior Engineer**, you have complete institutional control.

---

## 📊 Core Features & Capabilities

### 1. **Global Overview Dashboard**
- Real-time health monitoring (Network Health, Data Throughput, Workflow Nodes)
- KPI Command Center (Active Users, System Alerts, Departments, Server Status)
- Quick Authority Triggers (Bulk Import, Node Reconciliation)
- **Access**: Home view of SuperAdminDashboard

### 2. **Institutional Setup** (`src/components/dashboards/InstitutionalSetup.tsx`)
**What it does**: Add/manage Schools and Departments
- Create new **Schools** (top-level academic institutions)
- Create new **Departments** (linked to schools)
- Delete institutions with cascade handling
- **Can't do**: Won't allow adding staff or students (use Staff/Student registries)

**Tables affected**:
- `public.schools` (CREATE, DELETE)
- `public.departments` (CREATE, DELETE with validation)

### 3. **Academic Structure** (`src/components/dashboards/AcademicStructure.tsx`)
**What it does**: Manage Schools, Departments, and Programmes
- All Institutional Setup features +
- Create **Programmes** (academic qualifications: MSc, PhD, etc.)
- Full cascading hierarchy (School → Department → Programme)
- Advanced search and filtering
- **Can't do**: Won't create/assign staff or students to programmes

**Tables affected**:
- `public.schools`
- `public.departments` 
- `public.programmes` (CREATE, DELETE)

### 4. **Staff Registry** (`src/components/dashboards/StaffRegistry.tsx`)
**What it does**: Create and manage institutional staff
- **Sign up staff** with automatic user creation in `auth.users`
- Assign **roles** (SUPERVISOR, DEPT_COORDINATOR, SCHOOL_COORDINATOR, PG_DEAN, EXAMINER, SUPER_ADMIN)
- Assign to **departments**
- Set default passwords per role
- **Delete staff** with validation checks
- **Can't do**: Can't add students, won't assign staff to programmes/students

**Tables affected**:
- `auth.users` (via signUp)
- `public.users` (role, staff_id, department_id)
- `public.departments`

**Default Passwords**:
```
SUPERVISOR: supervisor
DEPT_COORDINATOR: pgcoordinator
SCHOOL_COORDINATOR: pgcoordinator
PG_DEAN: pgdean
EXAMINER: pgexaminer
SUPER_ADMIN: rongoadmin
```

### 5. **Student Registry** (`src/components/dashboards/StudentRegistry.tsx`)
**What it does**: Manage student enrollment and supervisor assignment
- **Register students** (creates auth user + student profile)
- Assign to **programme** → department → school (cascading)
- Assign **supervisor** from available SUPERVISOR roles
- Batch import capability
- **Can't do**: Can't create/modify staff roles, can't add schools/departments

**Tables affected**:
- `auth.users` (via signUp)
- `public.users`
- `public.students`
- Links to `public.programmes`, `public.departments`, `public.schools`

**Key Fields**:
- `registration_number`: Unique student ID
- `programme_id`: Link to academic programme
- `supervisor_id`: Link to supervisor user
- `current_stage`: Workflow stage (DEPT_SEMINAR_PENDING, etc.)

### 6. **Role Assignment** (`src/components/dashboards/RoleAssignment.tsx`)
**What it does**: Modify user roles and permissions
- View all non-student users
- Change user **role** instantly
- Role-based access control updates live
- **Can't do**: Can't create users, can't modify your own role, won't affect students

**Restrictions**:
- Cannot change your own role (prevents lockout)
- Only affects staff/admin users (role ≠ STUDENT)
- Changes take effect immediately

**Role Color Coding**:
- 🔴 SUPER_ADMIN: Red
- 💜 PG_DEAN: Purple
- 🔵 SCHOOL_COORDINATOR: Blue
- 🟠 DEPT_COORDINATOR: Orange
- 🟢 SUPERVISOR: Green
- 🔷 EXAMINER: Cyan

---

## 🔒 Database Schema Overview

### Critical Tables

#### `public.users`
```sql
id (UUID) - FK to auth.users.id
email (TEXT UNIQUE)
first_name, last_name (TEXT)
role (role_type) - SUPER_ADMIN, PG_DEAN, etc.
staff_id (TEXT UNIQUE) - For staff identification
department_id (UUID FK) - Institutional assignment
is_active (BOOLEAN)
```

#### `public.schools`
```sql
id (UUID PRIMARY KEY)
name (TEXT UNIQUE)
```

#### `public.departments`
```sql
id (UUID PRIMARY KEY)
school_id (UUID FK to schools)
name (TEXT)
```

#### `public.programmes`
```sql
id (UUID PRIMARY KEY)
department_id (UUID FK to departments)
name (TEXT)
code (TEXT UNIQUE)
```

#### `public.students`
```sql
id (UUID PRIMARY KEY)
user_id (UUID UNIQUE FK to users)
registration_number (TEXT UNIQUE)
programme_id (UUID FK to programmes)
supervisor_id (UUID FK to users - SUPERVISOR role)
research_title (TEXT)
current_stage (stage_code_type)
```

---

## 🎯 Workflow: Adding New Institution

### Step 1: Create School
1. Go to **Setup** tab or **Academic** tab
2. Under "Institutional Schools"
3. Enter school name (e.g., "School of Education")
4. Click **Add School**

### Step 2: Create Department
1. In same section, find "Academic Departments"
2. Select parent **School** from dropdown
3. Enter department name (e.g., "Department of Computer Science")
4. Click **Add Dept**

### Step 3: Create Programme
1. Go to **Academic** tab
2. Select **Programme** tab
3. Select **School** → **Department** (cascading)
4. Enter:
   - Programme name (e.g., "Master of Science in AI")
   - Programme code (e.g., "MSC-AI-2026")
5. Click **Add Programme**

### Step 4: Add Staff to Department
1. Go to **Staff** tab
2. Fill registration form:
   - Full Name
   - Email
   - Staff ID
   - Role (SUPERVISOR, PG_DEAN, etc.)
   - Select Department
3. Click **Provision Staff**

### Step 5: Enroll Students
1. Go to **Students** tab
2. Fill student registration:
   - First/Last Name
   - Email
   - Admission Number
   - Select **School** → **Department** → **Programme**
   - Select **Supervisor** (from SUPERVISOR role staff)
3. Click **Register Scholar**

---

## 🚨 Troubleshooting

### Issue: "Cannot add schools/departments"
**Solution**: Ensure you're logged in as SUPER_ADMIN. Check:
- `/system-admin` route authentication
- User role in `public.users` table is `SUPER_ADMIN`

### Issue: "Simulation login cannot write to database"
**Solution**: This is by design for demo accounts. To actually add data:
1. Configure Supabase integration (in v0 Settings)
2. Sign in with a real SUPER_ADMIN account at `/system-admin`
3. Check environment variables (`VITE_SUPABASE_URL`, etc.)

### Issue: "Department cannot be deleted - active students"
**Solution**: This is correct behavior (referential integrity). Remove students first or delete the programme.

### Issue: "Staffhas dependent relationships"
**Solution**: Staff cannot be deleted if they:
- Supervise active students
- Have submitted evaluations
- Have active thesis assignments

---

## 📋 Security & Best Practices

### Access Control
- Only SUPER_ADMIN accounts can access `/system-admin`
- RLS policies enforce institutional boundaries
- All changes are logged in audit trails

### Data Integrity
- Cascading deletes prevent orphaned records
- Foreign key constraints maintain relationships
- Unique constraints prevent duplicates

### Password Management
- Default passwords are role-specific
- Students should change passwords on first login
- Staff receives credentials via secure channel

### Audit Trail
- All operations logged with timestamps
- `changed_by` field tracks who made changes
- Use SystemLogs to review modifications

---

## 🔧 API Endpoints Reference

All database operations go through Supabase client (`@/integrations/supabase/client`):

```typescript
import { supabase } from "@/integrations/supabase/client";

// Schools
await supabase.from('schools').select('*')
await supabase.from('schools').insert({ name: "..." })
await supabase.from('schools').delete().eq('id', id)

// Departments
await supabase.from('departments').insert({ name: "...", school_id: "..." })

// Programmes
await supabase.from('programmes').insert({ name: "...", code: "...", department_id: "..." })

// Users (Staff)
await supabase.auth.signUp({ email: "...", password: "..." })
await supabase.from('users').update({ role: "...", department_id: "..." })

// Students
await supabase.from('students').insert({ user_id: "...", programme_id: "..." })
```

---

## 📚 File Structure

```
src/components/dashboards/
├── SuperAdminDashboard.tsx    (Main orchestrator - 6 views)
├── InstitutionalSetup.tsx     (Schools & Departments)
├── AcademicStructure.tsx      (Schools, Departments, Programmes)
├── StaffRegistry.tsx          (Create & manage staff)
├── StudentRegistry.tsx        (Enroll & assign students)
├── RoleAssignment.tsx         (Modify user roles)
└── ...

supabase/
├── schema.sql                 (Complete database schema)
└── migrations/                (Schema updates)

src/integrations/supabase/
├── client.ts                  (Supabase client config)
├── types.ts                   (TypeScript types)
└── ...
```

---

## 🎓 Advanced Tips

### Bulk Operations
Use the **Quick Authority Triggers** on Overview:
- **Run Bulk Import Script**: Batch load students/staff (CSV parsing)
- **Resolve Node Deadlocks**: Reconcile orphaned records

### Monitoring
- **Global Network Health**: Monitor real-time throughput
- **WorkflowMonitor**: Track document evaluation progress
- **SystemLogs**: Audit trail of all changes

### Export Data
All registry tables support standard Supabase exports:
```typescript
const { data } = await supabase.from('students').select('*').csv()
```

---

## ✅ Quality Assurance Checklist

- [ ] All 6 tabs visible and functional
- [ ] Can create schools/departments
- [ ] Can create programmes
- [ ] Can provision staff with roles
- [ ] Can register students with supervisors
- [ ] Can change user roles
- [ ] Cannot delete records with dependencies
- [ ] All toast notifications working
- [ ] Search/filter working in all tables
- [ ] Default passwords correct per role

---

**Last Updated**: March 22, 2026
**Portal Version**: 1.0 - Production Ready
**Database Schema**: Version 1.0
