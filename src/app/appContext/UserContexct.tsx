"use client"; // Ensure this file is treated as a Client Component

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSession, signOut } from "next-auth/react"; // Import from next-auth

interface User {
  user_name: string;
  user_email: string;
  password?: string; // Password is optional because it's not stored in the session
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void; // Function to log the user out
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession(); // Get session from NextAuth
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      // Set user information from session
      setUser({
        user_name: session.user.name || "", // Use session user name
        user_email: session.user.email || "", // Use session user email
      });
    }
  }, [session]);

  const logout = () => {
    setUser(null);
    signOut(); // Sign the user out using NextAuth
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
