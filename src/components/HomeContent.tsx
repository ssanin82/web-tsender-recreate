"use client";

import { useEffect, useState } from "react";
import AirdropForm from "@/components/AirdropForm";

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // or a loading skeleton

  return (
    <div>
      <AirdropForm />
    </div>
  );
}