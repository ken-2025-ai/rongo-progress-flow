

export type UserRole = "student" | "supervisor" | "panel" | "admin" | "school_admin" | "dean" | "super_admin";

interface RoleUser {
  id?: string;
  name: string;
  avatar: string;
  department?: string;
  department_id?: string;
  email?: string;
  roles: UserRole[]; // THE MASTER LIST
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Scholar",
  supervisor: "Supervisor",
  panel: "Panelist",
  admin: "Dept Coordinator",
  school_admin: "School Admin",
  dean: "PG Dean",
  super_admin: "System Administrator",
};

const DEMO_USERS: Record<UserRole, RoleUser> = {
  student: { id: "demo-student-id", name: "Omondi Okech", avatar: "OO", department: "Computer Science", email: "ookech@students.rongo.ac.ke", roles: ["student"] },
  supervisor: { id: "demo-supervisor-id", name: "Dr. Amina Wanjiku", avatar: "AW", department: "Computer Science", email: "awanjiku@rongo.ac.ke", roles: ["supervisor", "panel"] },
  panel: { id: "demo-panel-id", name: "Prof. Kibet Langat", avatar: "KL", department: "Information Technology", email: "klangat@rongo.ac.ke", roles: ["panel", "supervisor"] },
  admin: { id: "demo-admin-id", name: "Janet Achieng", avatar: "JA", department: "PG Administration", email: "jachieng@rongo.ac.ke", roles: ["admin", "supervisor", "panel"] },
  school_admin: { id: "demo-school-id", name: "Prof. Oduor", avatar: "PO", department: "School Coordinator", email: "poduor@rongo.ac.ke", roles: ["school_admin", "supervisor", "panel"] },
  dean: { id: "demo-dean-id", name: "Dr. Silas Nyabuto", avatar: "SN", department: "School of Postgraduate", email: "snyabuto@rongo.ac.ke", roles: ["dean", "supervisor", "panel"] },
  super_admin: { id: "demo-super-admin-id", name: "Ken Dagor", avatar: "SA", department: "System Governance", email: "kenkendagor3@gmail.com", roles: ["super_admin", "dean", "admin", "student"] },
};

interface RoleContextType {
  currentRole: UserRole;
  user: RoleUser | null;
  roleLabel: string;
  availableRoles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  authUser: User | null;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {


  const login = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setAuthUser(demoUser);
    setCurrentRole(role);

  };

  const logout = async () => {
    await supabase.auth.signOut();

  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,

        isLoading,
        login,
        switchRole,
        logout,
        authUser,
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

export { ROLE_LABELS };
