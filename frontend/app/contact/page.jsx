"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Inquiry from ${form.name}${form.course ? " - " + form.course : ""}`
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCourse: ${form.course}\n\n${form.message}`
    );

    window.location.href = `mailto:info@lasop.net?subject=${subject}&body=${body}`;
  };

  return (
    <main className="bg-[#071224] min-h-screen pt-40 pb-24">
      <div className="container-width">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 mb-6">
            Contact us
          </span>

          <h1 className="text-5xl lg:text-6xl font-bold text-white">
            Get in touch
          </h1>

          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            Have a question about a course, an application, or anything else?
            We are happy to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4"
          >
            <h2 className="text-white text-2xl font-bold mb-4">
              Send us a message
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-[#0B0E14] text-white">
                Course of interest (optional)
              </option>
              <option
                value="Full-stack Web Software Development & AI"
                className="bg-[#0B0E14] text-white"
              >
                Full-stack Web Software Development & AI
              </option>
              <option
                value="Data Science with Python & R"
                className="bg-[#0B0E14] text-white"
              >
                Data Science with Python & R
              </option>
              <option value="AI Automation" className="bg-[#0B0E14] text-white">
                AI Automation
              </option>
              <option value="Other" className="bg-[#0B0E14] text-white">
                Other / Not sure yet
              </option>
            </select>

            <textarea
              name="message"
              placeholder="Your message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="submit"
              className="w-full bg-[#0057E7] text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition cursor-pointer"
            >
              Send message
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
              <div className="text-blue-400 text-2xl">📍</div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Our location
                </h3>
                <p className="text-slate-400">Lagos, Nigeria</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
              <div className="text-blue-400 text-2xl">📞</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Call us</h3>
                <p className="text-slate-400">+234 000 000 0000</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
              <div className="text-blue-400 text-2xl">✉️</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Email us</h3>
                <p className="text-slate-400">info@lasop.net</p>
              </div>
            </div>

            <Link
              href="https://wa.me/234702 571 3326"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-[#0057E7] to-[#004AC6] rounded-2xl p-6 hover:scale-[1.02] transition"
            >
              <h3 className="text-white font-semibold">
                Chat with us on WhatsApp
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Fastest way to reach us directly
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}