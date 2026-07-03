"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_90bids9";
const EMAILJS_TEMPLATE_ID = "template_xjk0npe";
const EMAILJS_PUBLIC_KEY = "jmMjHWm08bK1xNwwI";

const webinars = [
  {
    id: 1,
    topic: "AI Engineering",
    title: "Building Production-Ready AI Apps with Python & LLMs",
    description:
      "Learn how to architect, build, and deploy real AI-powered applications using modern LLM APIs — prompt engineering, retrieval-augmented generation, and production cost control.",
    speaker: "Emeka Okafor",
    speakerRole: "Senior ML Engineer",
    date: "July 2, 2025",
    time: "6:00 PM WAT",
    duration: "90 min",
    seats: "340 registered",
    image: "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=800&q=80",
    speakerImage: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=120&q=80",
    featured: true,
    nextUp: true,
  },
  {
    id: 2,
    topic: "Cybersecurity",
    title: "Ethical Hacking Essentials: How Attackers Think",
    description:
      "Real penetration testing techniques, common web app vulnerabilities, and how to build a career in cybersecurity from scratch.",
    speaker: "Aisha Bello",
    speakerRole: "Security Researcher",
    date: "July 11, 2025",
    time: "5:00 PM WAT",
    duration: "75 min",
    seats: "210 registered",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    speakerImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80",
    featured: false,
    nextUp: false,
  },
  {
    id: 3,
    topic: "Full-Stack Dev",
    title: "From Zero to Full-Stack: Your 90-Day Roadmap",
    description:
      "A structured path from HTML basics to deploying full-stack apps with React and Node.js — with a personalized plan you leave with.",
    speaker: "Tunde Adeyemi",
    speakerRole: "Lead Software Engineer",
    date: "July 18, 2025",
    time: "6:30 PM WAT",
    duration: "60 min",
    seats: "180 registered",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
    featured: false,
    nextUp: false,
  },
  {
    id: 4,
    topic: "Data Science",
    title: "Data Science in Africa: Opportunities & How to Break In",
    description:
      "Three working data scientists share how they landed their roles, what skills actually matter, and what remote and local opportunities exist for Nigerian tech professionals.",
    speaker: "Panel · 3 speakers",
    speakerRole: "Industry Practitioners",
    date: "July 24, 2025",
    time: "4:00 PM WAT",
    duration: "90 min",
    seats: "95 registered",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    speakerImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80",
    featured: true,
    nextUp: false,
  },
];

/* ---------------- Icons ---------------- */

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/* ---------------- Cards ---------------- */

function FeaturedCard({ webinar, onRegister }) {
  return (
    <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] hover:border-[#5EA2FF]/30 transition-all duration-200">
      <div className="relative min-h-[260px]">
        <Image src={webinar.image} alt={webinar.title} fill className="object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#071224]/80" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5EA2FF] bg-black/50 backdrop-blur-md border border-[#5EA2FF]/25 rounded-lg px-3 py-1.5">
            {webinar.topic}
          </span>
          {webinar.nextUp && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-black/50 backdrop-blur-md border border-emerald-400/25 rounded-lg px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Next up
            </span>
          )}
        </div>
      </div>

      <div className="p-7 flex flex-col justify-between">
        <div>
          <h2 className="text-[19px] font-bold text-white leading-[1.35] mb-3">{webinar.title}</h2>
          <p className="text-[13px] text-slate-400 leading-[1.8] mb-5">{webinar.description}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
            <span className="flex items-center gap-1.5 text-[12px] text-slate-500"><CalendarIcon /> {webinar.date}</span>
            <span className="flex items-center gap-1.5 text-[12px] text-slate-500"><ClockIcon /> {webinar.time} · {webinar.duration}</span>
            <span className="flex items-center gap-1.5 text-[12px] text-slate-500"><UsersIcon /> {webinar.seats}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#5EA2FF]/20 shrink-0">
              <Image src={webinar.speakerImage} alt={webinar.speaker} width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-200 leading-tight">{webinar.speaker}</p>
              <p className="text-[11px] text-slate-500">{webinar.speakerRole}</p>
            </div>
          </div>
          <button
            onClick={() => onRegister(webinar)}
            className="inline-flex items-center gap-2 bg-[#0057E7] hover:bg-[#0A66FF] text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            Register Free <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ webinar, onRegister }) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] hover:border-[#5EA2FF]/30 hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[170px]">
        <Image src={webinar.image} alt={webinar.title} fill className="object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071224]/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5EA2FF] bg-black/50 backdrop-blur-md border border-[#5EA2FF]/25 rounded-lg px-3 py-1.5">
            {webinar.topic}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-[15px] font-bold text-white leading-[1.4] mb-2.5">{webinar.title}</h2>
        <p className="text-[12px] text-slate-500 leading-[1.75] mb-4 flex-1">{webinar.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 pb-4 border-b border-white/[0.06]">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarIcon /> {webinar.date}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><ClockIcon /> {webinar.time} · {webinar.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#5EA2FF]/20 shrink-0">
              <Image src={webinar.speakerImage} alt={webinar.speaker} width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-300 leading-tight">{webinar.speaker}</p>
              <p className="text-[10px] text-slate-500">{webinar.speakerRole}</p>
            </div>
          </div>
          <button
            onClick={() => onRegister(webinar)}
            className="inline-flex items-center gap-1.5 bg-[#0057E7] hover:bg-[#0A66FF] text-white text-[11px] font-semibold px-3.5 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Register <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Register Modal ---------------- */

function RegisterModal({ webinar, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  useEffect(() => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");

    try {
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_name: formData.fullName,
        to_email: formData.email,
        webinar_title: webinar.title,
        webinar_date: webinar.date,
        webinar_time: webinar.time,
      });

      console.log("EmailJS success:", result);
      setStatus("success");
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0B1830] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <CloseIcon />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center text-center px-8 py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
              <CheckIcon />
            </div>
            <h3 className="text-[18px] font-bold text-white mb-2">You're registered!</h3>
            <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
              We've saved your spot for <span className="text-slate-200">{webinar.title}</span>. Check your inbox for confirmation details.
            </p>
            <button
              onClick={onClose}
              className="bg-[#0057E7] hover:bg-[#0A66FF] text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-7 pt-7 pb-8">
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5EA2FF]">
              {webinar.topic}
            </span>
            <h3 className="text-[18px] font-bold text-white leading-snug mt-1.5 mb-1">
              {webinar.title}
            </h3>
            <p className="text-[12px] text-slate-500 mb-6">
              {webinar.date} · {webinar.time}
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor="fullName" className="block text-[12px] font-medium text-slate-300 mb-1.5">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`w-full rounded-xl bg-white/[0.04] border ${
                    errors.fullName ? "border-red-500/60" : "border-white/[0.08]"
                  } text-white text-[13px] placeholder:text-slate-600 px-4 py-3 outline-none focus:border-[#5EA2FF]/50 transition-colors`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-400 mt-1.5">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-[12px] font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl bg-white/[0.04] border ${
                    errors.email ? "border-red-500/60" : "border-white/[0.08]"
                  } text-white text-[13px] placeholder:text-slate-600 px-4 py-3 outline-none focus:border-[#5EA2FF]/50 transition-colors`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-400 mt-1.5">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-[12px] font-medium text-slate-300 mb-1.5">
                  Phone number <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="080..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder:text-slate-600 px-4 py-3 outline-none focus:border-[#5EA2FF]/50 transition-colors"
                />
              </div>

              {status === "error" && (
                <p className="text-[12px] text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-all duration-200"
              >
                {status === "loading" ? "Registering..." : "Confirm Registration"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function WebinarsPage() {
  const [selectedWebinar, setSelectedWebinar] = useState(null);

  const featuredWebinars = webinars.filter((w) => w.featured);
  const smallWebinars = webinars.filter((w) => !w.featured);

  function handleRegister(webinar) {
    setSelectedWebinar(webinar);
  }

  function handleCloseModal() {
    setSelectedWebinar(null);
  }

  return (
    <main className="relative bg-[#071224] min-h-screen overflow-hidden">
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="pt-32 pb-10 relative z-10">
        <div className="container-width">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-800 bg-blue-900/30 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-sm text-blue-200">Free Online Webinars</p>
          </div>
          <h1 className="text-3xl lg:text-[40px] font-bold text-white leading-tight mb-4">
            Learn from people doing
            <span className="text-[#5EA2FF]"> the real work.</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-lg leading-relaxed">
            Live sessions with industry practitioners — no fluff, no recycled slides. Practical, free, and built for people serious about tech careers.
          </p>
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/[0.06]">
            {[
              { num: "4", label: "Upcoming sessions" },
              { num: "825+", label: "Registered attendees" },
              { num: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[22px] font-bold text-white">{s.num}</p>
                <p className="text-[12px] text-slate-500 mt-0.5 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="container-width flex flex-col gap-5">
          <FeaturedCard webinar={featuredWebinars[0]} onRegister={handleRegister} />
          <div className="grid lg:grid-cols-2 gap-5">
            {smallWebinars.map((w) => (
              <SmallCard key={w.id} webinar={w} onRegister={handleRegister} />
            ))}
          </div>
          {featuredWebinars[1] && <FeaturedCard webinar={featuredWebinars[1]} onRegister={handleRegister} />}
        </div>
      </section>

      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="container-width py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-[14px] font-semibold text-white mb-1">Missed a session?</p>
            <p className="text-[13px] text-slate-500">All recordings are shared with registered attendees within 24 hours.</p>
          </div>
          <a href="/contact" className="inline-flex items-center gap-2 border border-blue-700 hover:border-blue-500 text-slate-200 hover:text-white text-[13px] font-semibold px-5 py-[11px] rounded-xl transition-all duration-200 whitespace-nowrap">
            Get notified <ArrowIcon />
          </a>
        </div>
      </section>

      {selectedWebinar && (
        <RegisterModal webinar={selectedWebinar} onClose={handleCloseModal} />
      )}
    </main>
  );
}