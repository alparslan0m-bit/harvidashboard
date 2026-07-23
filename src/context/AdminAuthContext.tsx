import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseAdmin";
import type { User } from "@supabase/supabase-js";

export interface AdminAuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAdminPrivilege = (user: User | null): boolean => {
    if (!user) return false;
    const role = user.app_metadata?.role;
    return role === "admin";
  };

  useEffect(() => {
    // Check current session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        const hasAdmin = checkAdminPrivilege(user);
        setIsAdmin(hasAdmin);

        // Auto sign out if user logged in but is NOT admin
        if (user && !hasAdmin) {
          supabase.auth.signOut().then(() => {
            setCurrentUser(null);
            setIsAdmin(false);
            setIsLoading(false);
          }).catch(() => {
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        const hasAdmin = checkAdminPrivilege(user);
        setCurrentUser(user);
        setIsAdmin(hasAdmin);

        if (!hasAdmin) {
          await supabase.auth.signOut().catch(console.error);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Login failed." };
      }

      const hasAdmin = checkAdminPrivilege(data.user);
      if (!hasAdmin) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Access denied. This account does not have admin privileges.",
        };
      }

      setCurrentUser(data.user);
      setIsAdmin(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "An unexpected error occurred.",
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ currentUser, isAdmin, isLoading, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
