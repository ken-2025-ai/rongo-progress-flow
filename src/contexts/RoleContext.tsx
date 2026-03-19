import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "student" | "supervisor" | "panel" | "admin" | "dean";

interface RoleUser {
  name: string;
  role: UserRole;
  avatar: string;
  department?: string;
}

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
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  authUser: User | null;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>("student");
  const [profile, setProfile] = useState<{ full_name: string; avatar_initials: string; department: string | null } | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile and role
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_initials, department")
            .eq("id", session.user.id)
            .single();
          
          if (profileData) setProfile(profileData);

          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .limit(1)
            .single();

          if (roleData) setCurrentRole(roleData.role as UserRole);
          setIsLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (role: UserRole) => {
    setCurrentRole(role);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
  };

  const user: RoleUser = {
    name: profile?.full_name || authUser?.user_metadata?.full_name || "User",
    role: currentRole,
    avatar: profile?.avatar_initials || "U",
    department: profile?.department ?? undefined,
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        user,
        roleLabel: ROLE_LABELS[currentRole],
        allRoles: Object.keys(ROLE_LABELS) as UserRole[],
        isAuthenticated: !!authUser,
        isLoading,
        login,
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
