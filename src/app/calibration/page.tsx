"use client";
import NavbarCalibration from "@/components/Calibration/NavbarCalibration";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import Star from "@/components/Star";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export default function CalibrationPage() {
  const [showInstructions, setShowInstructions] = useState(true);

  const stars = [
    { id: uuidv4(), top: 5, left: 3 },
    { id: uuidv4(), top: 5, left: 50 },
    { id: uuidv4(), top: 5, left: 95 },
    { id: uuidv4(), top: 50, left: 3 },
    { id: uuidv4(), top: 50, left: 95 },
    { id: uuidv4(), top: 90, left: 3 },
    { id: uuidv4(), top: 90, left: 50 },
    { id: uuidv4(), top: 90, left: 95 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {showInstructions && (
        <OverlayInstruction onComplete={() => setShowInstructions(false)} />
      )}
      <NavbarCalibration />
      <div className="flex-1 relative">
        {stars.map((star) => (
          <Star
            key={star.id}
            top={star.top}
            left={star.left}
            onError={() => console.error("Error with star", star.id)}
            onRemove={() => console.log("Star removed", star.id)}
          />
        ))}
      </div>
    </div>
  );
}
