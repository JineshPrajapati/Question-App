"use client";

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

type Props = {
  children: ReactNode;
  showFixedPart?: boolean;
};

export default function ClientLayout({
  children,
  showFixedPart = true,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-screen flex">
      {/* Fix Part (only desktop & when enabled) */}
      {!isMobile && showFixedPart && (
        <div className="w-3/5 bg-gray-200 flex items-center justify-center">
          <p className="text-lg font-medium">Fix Part</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-red-300 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
