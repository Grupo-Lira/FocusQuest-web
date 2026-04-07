"use client";

import { Navbar } from "@/components/Navbar";
import { RecordsScreen } from "./RecordsScreen";

export default function RecordsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-center mt-6 top-0 mb-6 fixed">
        <Navbar />
      </div>
      <div className="mt-26">
        <RecordsScreen />
      </div>
    </div>
  );
}
