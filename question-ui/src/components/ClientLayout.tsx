"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900">
      {children}
    </div>
  );
}
