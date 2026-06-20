"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const faqCategories = [
  {
    name: "General",
    faqs: [
      {
        q: "What is LASOP?",
        a: "LASOP is a career-focused tech training platform that turns ambitious beginners into job-ready professionals through real projects, expert mentorship, and an industry-aligned curriculum.",
      },
      {
        q: "Who can apply to LASOP programs?",
        a: "Anyone ready to commit to learning a new skill can apply — no degree or background in tech is required. Each course page lists any specific requirements for that program.",
      },
      {
        q: "Do I need prior tech experience to enroll?",
        a: "No. Our courses are built to take beginners from zero to job-ready, though some advanced tracks may recommend foundational knowledge first.",
      },
    ],
  },
  {
    name: "Applying",
    faqs: [
      {
        q: "How do I apply for a course?",
        a: "Create an account, select a course, choose your preferred learning mode, and pick a location if one applies. You'll land on your dashboard as soon as your application is submitted.",
      },
      {
        q: "Can I apply for more than one course?",
        a: "Yes. Once you have a dashboard, you can add additional course applications at any time.",
      },
      {
        q: "What happens after I submit my application?",
        a: "Your application is recorded against your account immediately and shows up on your dashboard. Our team will reach out with onboarding details ahead of your start date.",
      },
      {
        q: "Can I change my course after applying?",
        a: "Reach out to support before your course starts and we'll help you switch — your original application stays on record either way.",
      },
    ],
  },
  {
    name: "Courses",
    faqs: [
      {
        q: "What categories of courses does LASOP offer?",
        a: "Courses are grouped into technology, business, and vocational tracks, covering everything from software development to professional and hands-on trade skills.",
      },
      {
        q: "Are courses project-based?",
        a: "Yes. Every course is built around real projects so you graduate with a portfolio, not just a certificate.",
      },
      {
        q: "How long do courses take to complete?",
        a: "Duration varies by course — each course page lists its specific length so you can plan around work or school.",
      },
    ],
  },
  {
    name: "Learning Mode & Location",
    faqs: [
      {
        q: "What learning modes are available?",
        a: "Most courses can be taken online or in person (physical), depending on the course.",
      },
      {
        q: "Can I switch my learning mode later?",
        a: "Yes, contact support and we'll update your application to reflect your new preference, subject to seat availability at a location.",
      },
    ],
  },
  {
    name: "Tuition & Support",
    faqs: [
      {
        q: "How much do courses cost?",
        a: "Fees vary by course and are listed on each course's page before you apply, so there are no surprises.",
      },
      {
        q: "Do you offer payment plans?",
        a: "Reach out to our support team to discuss available payment options for your chosen course.",
      },
      {
        q: "What support do I get after applying?",
        a: "From onboarding to graduation, you'll have access to mentorship, lab sessions, and career support including resume reviews and interview prep.",
      },
    ],
  },
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Highlight({ text, query }) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-blue-600/30 text-[#8FC1FF] rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function FAQ() {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqCategories;
    return faqCategories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (item) =>
            item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [query]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.faqs.length,
    0
  );

  return (
    <div className="bg-[#071224] min-h-screen">
      {/* Hero */}
      <div className="relative h-80 overflow-hidden pt-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071224] via-[#0A1830] to-[#071224]" />
        <div className="absolute top-8 left-1/4 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-72 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="relative text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Frequently Asked <span className="text-[#5EA2FF]">Questions</span>
          </h1>
          <div className="w-24 h-1 bg-[#0A66FF] mx-auto mb-6"></div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Search for an answer, or browse everything below
          </p>
        </div>
      </div>

      {/* Search + jump links */}
      <div className="px-6 pt-16">
        <div className="container-width">
          <div className="relative max-w-xl mx-auto mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs — e.g. payment plans, physical classes"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!query && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
              {faqCategories.map((cat) => (
                <a
                  key={cat.name}
                  href={`#${slugify(cat.name)}`}
                  className="hover:text-[#5EA2FF] underline-offset-4 hover:underline transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          )}

          {query && (
            <p className="text-center text-sm text-slate-500 mb-4">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* FAQ Body */}
      <div className="py-12 px-6">
        <div className="container-width max-w-3xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-200 text-lg mb-2">
                No matches for &ldquo;{query}&rdquo;
              </p>
              <p className="text-slate-500 mb-8">
                Try a different word, or ask us directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[#0057E7] to-[#0A66FF] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,87,231,0.35)]"
              >
                Contact Us
              </Link>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <section
                key={cat.name}
                id={slugify(cat.name)}
                className="scroll-mt-28 mb-14"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[#5EA2FF] font-semibold text-sm tracking-wider uppercase whitespace-nowrap">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-px bg-blue-900/40" />
                </div>

                <div className="space-y-4">
                  {cat.faqs.map((item) => (
                    <div
                      key={item.q}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-700 transition-colors duration-300"
                    >
                      <h3 className="text-white font-semibold text-lg mb-2">
                        <Highlight text={item.q} query={query} />
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        <Highlight text={item.a} query={query} />
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 bg-[#0A1830]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Can't find what you're looking for? Our team is happy to walk you
            through anything before you apply.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#0057E7] to-[#0A66FF] text-white px-10 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 ease-out shadow-[0_12px_40px_rgba(0,87,231,0.35)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,87,231,0.45)] active:scale-[0.98] text-lg"
            >
              Contact Us
            </Link>
            <Link
              href="/courses"
              className="border border-blue-700 hover:border-blue-500 text-slate-200 px-10 py-4 rounded-xl font-semibold transition text-lg"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}