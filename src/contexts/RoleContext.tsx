import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("student");
  const [authUser, setAuthUser] = useState<RoleUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (!isSupabaseConfigured) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setAuthUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      // 1. Get Base User Role
      const { data: userDataRaw } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      const userData = userDataRaw as any;
      
      // 2. Discovery: Is this user also a student?
      const { data: studentDataRaw } = await supabase.from('students').select('id').eq('user_id', userId).maybeSingle();
      const studentData = studentDataRaw as any;

      const roles: UserRole[] = [];
      const dbRoleToAppRole: Record<string, UserRole> = {
        'STUDENT': 'student',
        'SUPERVISOR': 'supervisor',
        'DEPT_COORDINATOR': 'admin',
        'SCHOOL_COORDINATOR': 'school_admin',
        'PG_DEAN': 'dean',
        'EXAMINER': 'panel',
        'SUPER_ADMIN': 'super_admin'
      };

      if (userData?.role) {
        const primaryRole = dbRoleToAppRole[userData.role] || 'student';
        roles.push(primaryRole);

        if (['dean', 'school_admin', 'admin'].includes(primaryRole)) {
           if (!roles.includes('supervisor')) roles.push('supervisor');
           if (!roles.includes('panel')) roles.push('panel');
        }
      }

      if (studentData) {
        if (!roles.includes('student')) roles.push('student');
      }

      if (roles.length === 0) roles.push('student');

      if (email === "ngichelle99@gmail.com" || email === "kenkendagor3@gmail.com") {
        if (!roles.includes('super_admin')) roles.unshift('super_admin');
      }

      const detectedUser: RoleUser = {
        id: userId,
        name: userData ? `${userData.first_name || ""} ${userData.last_name || ""}` : "Scholastic User",
        avatar: userData ? (userData.first_name?.[0] || "") + (userData.last_name?.[0] || "") : "SU",
        email: email,
        department_id: userData?.department_id,
        roles: roles
      };

      setAuthUser(detectedUser);
      setCurrentRole(roles[0]);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Discovery Failure:", err);
      setIsLoading(false);
    }
  };

  const login = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setAuthUser(demoUser);
    setCurrentRole(role);
    setIsAuthenticated(true);
    toast.success("Simulation Active", {
      description: `Logged in as ${demoUser.name} (${ROLE_LABELS[role]}) in discovery mode.`,
    });
  };

  const switchRole = (role: UserRole) => {
    if (authUser?.roles.includes(role)) {
      setCurrentRole(role);
      toast.info(`Switched perspective: ${ROLE_LABELS[role]}`, {
        description: `Your access controls have been refactored for the ${ROLE_LABELS[role]} portal.`,
        duration: 2000
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        user: authUser,
        roleLabel: ROLE_LABELS[currentRole],
        availableRoles: authUser?.roles || [],
        isAuthenticated,
        isLoading,
        login,
        switchRole,
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
