"use client";

import { useState } from "react";
import Link from "next/link";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// NOTE: these dates are generated relative to today so the calendar always
// has visible events. Once the backend is ready, replace this whole array
// with events fetched from the API (same shape: id, title, date, time,
// duration, type, description, link).
function relativeDate(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split("T")[0];
}

const events = [
  {
    id: 1,
    title: "AI Engineering Webinar",
    date: relativeDate(2),
    time: "6:00 PM WAT",
    duration: "90 min",
    type: "webinar",
    description: "Building Production-Ready AI Apps with Python & LLMs",
    link: "/webinars",
  },
  {
    id: 2,
    title: "New Cohort Begins",
    date: relativeDate(7),
    time: "9:00 AM WAT",
    duration: "All day",
    type: "cohort",
    description: "New cohort kickoff — orientation and onboarding for new students.",
    link: "/apply",
  },
  {
    id: 3,
    title: "Cybersecurity Webinar",
    date: relativeDate(11),
    time: "5:00 PM WAT",
    duration: "75 min",
    type: "webinar",
    description: "Ethical Hacking Essentials: How Attackers Think",
    link: "/webinars",
  },
  {
    id: 4,
    title: "Enrollment Deadline",
    date: relativeDate(14),
    time: "11:59 PM WAT",
    duration: "",
    type: "deadline",
    description: "Last day to apply for the next cohort intake.",
    link: "/apply",
  },
  {
    id: 5,
    title: "Full-Stack Dev Webinar",
    date: relativeDate(18),
    time: "6:30 PM WAT",
    duration: "60 min",
    type: "webinar",
    description: "From Zero to Full-Stack: Your 90-Day Roadmap",
    link: "/webinars",
  },
  {
    id: 6,
    title: "Data Science Panel",
    date: relativeDate(24),
    time: "4:00 PM WAT",
    duration: "90 min",
    type: "webinar",
    description: "Data Science in Africa: Opportunities & How to Break In",
    link: "/webinars",
  },
  {
    id: 7,
    title: "Demo Day",
    date: relativeDate(30),
    time: "2:00 PM WAT",
    duration: "3 hrs",
    type: "special",
    description: "Students from the current cohort present their final projects to industry guests.",
    link: "/",
  },
];

const typeStyles = {
  webinar: {
    dot: "bg-[#5EA2FF]",
    badge: "bg-[#5EA2FF]/10 text-[#5EA2FF] border-[#5EA2FF]/20",
    label: "Webinar",
  },
  cohort: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    label: "Cohort",
  },
  deadline: {
    dot: "bg-rose-400",
    badge: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    label: "Deadline",
  },
  special: {
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    label: "Special",
  },
};

function ArrowIcon({ dir = "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {dir === "right" ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // upcoming events sorted
  const todayStr = today.toISOString().split("T")[0];
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <main className="relative bg-[#071224] min-h-screen overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <section className="pt-32 pb-10 relative z-10">
        <div className="container-width">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-800 bg-blue-900/30 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-sm text-blue-200">Events & Schedule</p>
          </div>
          <h1 className="text-3xl lg:text-[40px] font-bold text-white leading-tight mb-4">
            What's coming up<span className="text-[#5EA2FF]">.</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-lg leading-relaxed">
            Webinars, cohort kick-offs, deadlines, and demo days — all in one place.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="relative z-10 pb-24">
        <div className="container-width grid lg:grid-cols-[1fr_340px] gap-8">

          {/* Calendar */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <ArrowIcon dir="left" />
              </button>
              <h2 className="text-[16px] font-semibold text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <ArrowIcon dir="right" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 border-b border-white/[0.06]">
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square border-b border-r border-white/[0.04]" />;

                const dateStr = formatDate(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`aspect-square border-b border-r border-white/[0.04] flex flex-col items-center pt-2.5 gap-1 relative transition-all duration-150
                      ${isSelected ? "bg-[#5EA2FF]/10" : "hover:bg-white/[0.03]"}
                    `}
                  >
                    <span className={`text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all
                      ${isToday ? "bg-[#0057E7] text-white font-bold" : isSelected ? "text-[#5EA2FF]" : "text-slate-300"}
                    `}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center px-1">
                        {dayEvents.slice(0, 3).map(e => (
                          <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${typeStyles[e.type].dot}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex flex-wrap gap-5">
              {Object.entries(typeStyles).map(([key, val]) => (
                <span key={key} className="flex items-center gap-2 text-[12px] text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                  {val.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">

            {/* Selected date events */}
            {selectedDate && (
              <div className="bg-white/[0.02] border border-[#5EA2FF]/20 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <p className="text-[13px] font-semibold text-white">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                {selectedEvents.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-[13px] text-slate-500">No events this day.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {selectedEvents.map(e => (
                      <div key={e.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-[13px] font-semibold text-white leading-tight">{e.title}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${typeStyles[e.type].badge}`}>
                            {typeStyles[e.type].label}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">{e.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <ClockIcon /> {e.time}{e.duration ? ` · ${e.duration}` : ""}
                          </span>
                          <Link href={e.link} className="flex items-center gap-1 text-[11px] font-semibold text-[#5EA2FF] hover:text-white transition-colors">
                            View <LinkIcon />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming events */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="text-[13px] font-semibold text-white">Upcoming</p>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {upcomingEvents.map(e => {
                  const d = new Date(e.date + "T00:00:00");
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedDate(e.date)}
                      className="w-full px-5 py-4 flex items-start gap-3 hover:bg-white/[0.03] transition-all text-left"
                    >
                      <div className="flex flex-col items-center bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 min-w-[44px]">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                        <span className="text-[18px] font-bold text-white leading-tight">
                          {d.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-200 leading-tight mb-1 truncate">{e.title}</p>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <ClockIcon /> {e.time}
                        </span>
                      </div>
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeStyles[e.type].dot}`} />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}