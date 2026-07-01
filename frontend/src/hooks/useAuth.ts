"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");

    const expiry = localStorage.getItem("tokenExpiry");

    if (expiry && Date.now() > Number(expiry)) {
      logout();

      return;
    }

    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("tokenExpiry");

    setUser(null);

    window.location.href = "/login";
  }

  return {
    user,

    setUser,

    logout,
  };
}
