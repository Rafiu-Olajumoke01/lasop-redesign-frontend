"use client";
import { useState } from "react";

const categories = ["All", "Technology", "Business", "Vocational"];

export default function CourseFilters() {
  const [active, setActive] = useState("All");

  return (
    <div className="bg-[#050D1A] border-b border-white/[0.06] sticky top-0 z-30 backdrop-blur-sm">
      <div className="container-width">
        <div className="flex items-center overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                active === cat
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}