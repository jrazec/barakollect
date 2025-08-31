import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@/interfaces/global";

type AuthContextValue = {
  user: User | null;
  role: string;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: "",
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

async function fetchAppUserRole(uiid: string): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ uiid }).toString(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch user data");
  const user = result.data && result.data[0];
  return (user && user["userrole__role__name"] ? user["userrole__role__name"] : "").toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const uiid = data.session?.user?.id;
      if (!uiid) {
        setUser(null);
        setRole("");
        setLoading(false);
        return;
      }
      const resolvedRole = await fetchAppUserRole(uiid);
      const name = data.session?.user?.email || "User";
      setUser({ name, role: resolvedRole });
      setRole(resolvedRole);
    } catch {
      setUser(null);
      setRole("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


