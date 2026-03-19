import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "student" | "supervisor" | "panel" | "admin" | "school_admin" | "dean" | "super_admin";

interface RoleUser {
  id?: string;
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
  user: RoleUser;
  roleLabel: string;
  allRoles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("student");
  const [authUser, setAuthUser] = useState<RoleUser>(DEMO_USERS.student);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
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
          setAuthUser(DEMO_USERS.student);
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
      // For MVP, if they logged in specifically as kenkendagor3 - super admin shortcut
      if (email === "kenkendagor3@gmail.com") {
        setCurrentRole("super_admin");
        setAuthUser({
          id: userId,
          name: "Ken Dagor",
          role: "super_admin",
          avatar: "SA",
          email: email
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // @ts-ignore
      const { data: rawData, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      const data: any = rawData;
      
      if (data) {
        // Map DB enum to frontend roles
        const dbRoleToAppRole: Record<string, UserRole> = {
          'STUDENT': 'student',
          'SUPERVISOR': 'supervisor',
          'DEPT_COORDINATOR': 'admin',
          'SCHOOL_COORDINATOR': 'school_admin',
          'PG_DEAN': 'dean',
          'EXAMINER': 'panel'
        };
        
        const mappedRole = dbRoleToAppRole[data.role] || 'student';
        
        setCurrentRole(mappedRole);
        setAuthUser({
          id: userId,
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          role: mappedRole,
          avatar: (data.first_name?.[0] || "") + (data.last_name?.[0] || ""),
          email: data.email
        });
        setIsAuthenticated(true);
      } else if (error) {
         console.error("Profile fetch error:", error.message);
         // Fallback to local state if db row missing but auth session exists
         setIsAuthenticated(true);
      } else {
         // Create mock fallback logic if user exists in auth but not `public.users` yet
         setIsAuthenticated(true);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  // Keep legacy explicit login for fallback UI mapping (e.g. initial dev states)
  const login = (role: UserRole) => {
    setCurrentRole(role);
    setAuthUser(DEMO_USERS[role]);
    setIsAuthenticated(true);
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
        allRoles: Object.keys(DEMO_USERS) as UserRole[],
        isAuthenticated,
        isLoading,
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
