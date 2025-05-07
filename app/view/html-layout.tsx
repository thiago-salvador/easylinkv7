"use client";

import React from "react";

// Layout minimalista para visualização de HTML
export default function HtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
