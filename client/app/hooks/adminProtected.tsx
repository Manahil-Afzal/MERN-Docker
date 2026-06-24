"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useSelector } from "react-redux";

interface UserType {
  role?: string;
}

interface RootState {
  auth: {
    user: UserType | null;
  };
}

interface ProtectedProps {
  children: React.ReactNode;
}

const AdminProtected = ({ children }: ProtectedProps) => {
  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  if (!user) {
    redirect("/");
    return null;
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
    redirect("/");
    return null;
  }

  return <>{children}</>;
};

export default AdminProtected;