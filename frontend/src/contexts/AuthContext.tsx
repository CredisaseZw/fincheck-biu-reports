/* eslint-disable react-refresh/only-export-components */
import Cookie from "js-cookie"
import type { SignInResponse, User } from '@/types/core';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { decrypt, encrypt } from "@/lib/utils";

type AuthContextType = {
  user: User | null;
  signIn: (data: SignInResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(()=>{
      if (user) return;
      const details = localStorage.getItem("USER_DETAILS")
      if(details){
          try {
              const parsedDetails: User = JSON.parse(details);
              parsedDetails.i_a = decrypt(parsedDetails.i_a as string, import.meta.env.VITE_ENCRYPTION_SECRET as string) === 'true' ? true : false;
              parsedDetails.i_s = decrypt(parsedDetails.i_s as string, import.meta.env.VITE_ENCRYPTION_SECRET as string) === 'true' ? true : false;
              setUser(parsedDetails);
          } catch (error) {
              console.log(error)
          }
      }
    }, [user])

    const signIn = async (response: SignInResponse) => {
        const {tokens, ...userDetails}  = response;
        const cookieOptions = {
            secure: true,
            sameSite: "strict",
            expires: 2,
        } as const

        const resolvedUser = {...userDetails}
        resolvedUser.i_a = encrypt(resolvedUser.i_a, import.meta.env.VITE_ENCRYPTION_SECRET as string);
        resolvedUser.i_s = encrypt(resolvedUser.i_s, import.meta.env.VITE_ENCRYPTION_SECRET as string);

        localStorage.setItem("USER_DETAILS", JSON.stringify(resolvedUser))
        Cookie.set("access", tokens.access, cookieOptions)
        Cookie.set("refresh", tokens.refresh, cookieOptions)
        setUser(userDetails)
    };

    const signOut = async () => {
      setUser(null);

      localStorage.removeItem("USER_DETAILS");
      await Promise.all([
        Cookie.remove("access"),
        Cookie.remove("refresh"),
      ]);
    };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
