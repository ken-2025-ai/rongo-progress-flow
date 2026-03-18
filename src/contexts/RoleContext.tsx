import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "supervisor" | "panel" | "admin" | "school_admin" | "dean" | "super_admin";

interface RoleUser {
  name: string;
  role: UserRole;
  avatar: string;
  department?: string;
  email?: string;
}

const DEMO_USERS: Record<UserRole, RoleUser> = {
  student: { name: "Omondi Okech", role: "student", avatar: "OO", department: "Computer Science", email: "ookech@students.rongo.ac.ke" },
  supervisor: { name: "Dr. Amina Wanjiku", role: "supervisor", avatar: "AW", department: "Computer Science", email: "awanjiku@rongo.ac.ke" },
  panel: { name: "Prof. Kibet Langat", role: "panel", avatar: "KL", department: "Information Technology", email: "klangat@rongo.ac.ke" },
  admin: { name: "Janet Achieng", role: "admin", avatar: "JA", department: "PG Administration", email: "jachieng@rongo.ac.ke" },
  school_admin: { name: "Prof. Oduor", role: "school_admin", avatar: "PO", department: "School Coordinator", email: "poduor@rongo.ac.ke" },
  dean: { name: "Dr. Silas Nyabuto", role: "dean", avatar: "SN", department: "School of Postgraduate", email: "snyabuto@rongo.ac.ke" },
  super_admin: { name: "Ken Dagor", role: "super_admin", avatar: "SA", department: "System Governance", email: "kenkendagor3@gmail.com" },
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  supervisor: "Supervisor",
  panel: "Panel Member",
  admin: "Dept Coordinator",
  school_admin: "School Admin",
  dean: "PG Dean",
  super_admin: "System Administrator",
};

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  user: RoleUser;
  roleLabel: string;
  allRoles: UserRole[];
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  // In a real app, this would be handled by Auth (Supabase/Firebase)
  // For this demo, we'll use a local state.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("student");

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        user: DEMO_USERS[currentRole],
        roleLabel: ROLE_LABELS[currentRole],
        allRoles: Object.keys(DEMO_USERS) as UserRole[],
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export { ROLE_LABELS, DEMO_USERS };
