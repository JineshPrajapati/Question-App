"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>You must be logged in to view this page</div>;
  }

  return <h1>Welcome, {user.firstName}!</h1>;
}