import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "supervisor" | "panel" | "admin" | "dean";

interface RoleUser {
  name: string;
  role: UserRole;
  avatar: string;
  department?: string;
}

const DEMO_USERS: Record<UserRole, RoleUser> = {
  student: { name: "Omondi Okech", role: "student", avatar: "OO", department: "Computer Science" },
  supervisor: { name: "Dr. Amina Wanjiku", role: "supervisor", avatar: "AW", department: "Computer Science" },
  panel: { name: "Prof. Kibet Langat", role: "panel", avatar: "KL", department: "Information Technology" },
  admin: { name: "Janet Achieng", role: "admin", avatar: "JA", department: "PG Administration" },
  dean: { name: "Dr. Silas Nyabuto", role: "dean", avatar: "SN", department: "School of Postgraduate Studies" },
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  supervisor: "Supervisor",
  panel: "Panel Member",
  admin: "Administrator",
  dean: "PG Dean",
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
