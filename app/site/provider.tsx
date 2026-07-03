"use client";

import ClickSpark from "@/components/ClickSpark";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClickSpark>
      {children}
    </ClickSpark>
  );
}