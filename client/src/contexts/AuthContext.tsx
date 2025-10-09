import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  name: string;
  role: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

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

interface UserData {
  id: string;
  first_name?: string;
  last_name?: string;
  username: string;
  userrole__role__name: string;
}

async function fetchAppUserData(uiid: string): Promise<{ role: string; userData: UserData | null }> {
  const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ uiid }).toString(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch user data");
  const userData = result.data && result.data[0];
  const role = (userData && userData["userrole__role__name"] ? userData["userrole__role__name"] : "").toLowerCase();
  
  return { role, userData };
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
      
      const { role: resolvedRole, userData } = await fetchAppUserData(uiid);
      
      let name = data.session?.user?.email || "User";
      if (userData?.first_name && userData?.last_name) {
        name = `${userData.first_name} ${userData.last_name}`;
      } else if (userData?.username) {
        name = userData.username;
      }
      
      const userInfo: User = {
        id: uiid,
        name,
        role: resolvedRole,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        username: userData?.username
      };
      
      setUser(userInfo);
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


