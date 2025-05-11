"use client";
import Navbar from "@/components/Navbar";
import RankingScreen from "./RankingScreen";

export default function SettingdPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-center mt-6 absolute top-0">
        <Navbar />
      </div>
        <RankingScreen/>
    </div>
  );
}
