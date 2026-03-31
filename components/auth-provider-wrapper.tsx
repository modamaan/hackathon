"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only valid inside a Client Component.
// This wrapper sits between layout.tsx (Server) and AuthProvider (Client+Firebase).
const AuthProvider = dynamic(
  () => import("@/components/auth-provider").then((m) => ({ default: m.AuthProvider })),
  { ssr: false }
);

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
