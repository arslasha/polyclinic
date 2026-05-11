"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { patientsApi, doctorsApi } from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn && !user) {
        try {
          // Try patient first
          try {
            const profile = await patientsApi.me();
            setUser(profile.user_details);
          } catch (e: any) {
            // Try doctor if patient fails
            const doctorProfile = await doctorsApi.me();
            setUser(doctorProfile.user_details);
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      } else if (!loggedIn) {
        setUser(null);
      }
    };

    checkAuth();
    
    // Listen for storage changes
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname, user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  const initials = user 
    ? `${user.last_name?.[0] || ""}${user.first_name?.[0] || ""}`.toUpperCase()
    : "АИ";



  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center px-6 justify-between">
      <Link href="/" className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
          +
        </span>
        Поликлиника
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/doctors" className="text-sm font-medium hover:text-primary transition-colors">
          Врачи
        </Link>
        <Link href="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
          Записи
        </Link>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/20 font-bold hover:bg-secondary/30 transition-all">
              {initials}
            </Link>

            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-accent hover:opacity-70 transition-opacity"
            >
              Выйти
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
          >
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
}
