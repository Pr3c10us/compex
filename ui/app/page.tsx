"use client";

import { useState } from "react";
import Buyer from "./components/buyer";
import Seller from "./components/seller";

type Role = "buyer" | "seller";

export default function Home() {
  const [role, setRole] = useState<Role>("seller");

  return (
    <main className="flex flex-col items-center min-h-screen p-8">
      <div className="flex rounded-full border border-gray-300 overflow-hidden mb-8">
        <button
          onClick={() => setRole("buyer")}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            role === "buyer"
              ? "bg-black text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Buyer
        </button>
        <button
          onClick={() => setRole("seller")}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            role === "seller"
              ? "bg-black text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Seller
        </button>
      </div>

      <div className="w-full max-w-2xl">
        {role === "buyer" ? <Buyer /> : <Seller />}
      </div>
    </main>
  );
}
