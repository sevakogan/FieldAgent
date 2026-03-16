"use client";

import { useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"] as const;

export function Dialpad() {
  const [digits, setDigits] = useState("");

  return (
    <div>
      {/* Display */}
      <div className="bg-gray-100 rounded-[14px] px-5 py-3 mb-4 text-center min-h-[50px] flex items-center justify-center">
        <span className={`text-[28px] font-bold tracking-[4px] ${digits ? "text-gray-900" : "text-gray-300"}`}>
          {digits || "· · ·"}
        </span>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setDigits((prev) => prev + key)}
            className="bg-gray-100 border-none rounded-xl py-3.5 text-xl font-extrabold text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setDigits((prev) => prev.slice(0, -1))}
          className="w-[52px] bg-gray-100 border-none rounded-xl text-xl cursor-pointer shrink-0 hover:bg-gray-200 transition-colors py-3.5"
        >
          ⌫
        </button>
        <button
          className={`flex-1 border-none rounded-xl py-3.5 font-extrabold text-[15px] transition-all ${
            digits
              ? "bg-brand-dark text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-default"
          }`}
        >
          Call
        </button>
      </div>
    </div>
  );
}
