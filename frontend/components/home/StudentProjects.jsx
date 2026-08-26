'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const GRADIENTS = [
  "linear-gradient(135deg, #4F46E5, #7C3AED)",
  "linear-gradient(135deg, #0EA5E9, #06B6D4)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F59E0B, #EA580C)",
];

export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const res = await fetch(`${API_BASE}/api/cohorts/projects/featured/`);
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true; };
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section className="w-full py-16 px-4 md:px-10" style={{ backgroundColor: "#08162F" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            What Our Students Have Built
          </h2>
          <p className="text-gray-300 mt-2 max-w-xl mx-auto">
            Real projects, built by real students, during their time at LASOP.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10 animate-pulse" style={{ backgroundColor: "#0F2143" }}>
                <div className="w-full aspect-video bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                  <div className="h-3 w-full bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="rounded-xl overflow-hidden flex flex-col border border-white/10 hover:border-indigo-400/40 transition-colors duration-200"
                style={{ backgroundColor: "#0F2143" }}
              >
                <div
                  className="relative w-full aspect-video shrink-0 flex items-center justify-center"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                >
                  <span className="text-white/90 font-semibold text-lg tracking-wide px-4 text-center">
                    {project.title}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm text-gray-400 mb-2">
                    by {project.student_name}
                  </p>

                  <h3 className="text-base font-semibold text-white mb-1 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-sm text-gray-300 mb-4 leading-relaxed flex-1">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.tech_stack_list?.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/studentprojects"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            See More Projects
          </Link>
        </div>
      </div>
    </section>
  );
}