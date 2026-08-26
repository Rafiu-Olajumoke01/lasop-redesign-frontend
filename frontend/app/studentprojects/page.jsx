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

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const res = await fetch(`${API_BASE}/api/cohorts/projects/all/`);
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        if (!cancelled) setError('Could not load projects right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "#08162F" }}>
      <section className="w-full py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 mb-6"
            >
              ← Back home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              What Our Students Have Built
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl">
              Every project submitted by LASOP students, across every cohort.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : error ? (
            <p className="text-rose-300 text-sm">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects to show yet — check back soon.</p>
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

                    <div className="flex flex-wrap gap-1.5 mt-auto mb-3">
                      {project.tech_stack_list?.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 text-xs font-semibold hover:text-indigo-200 transition"
                        >
                          Code →
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 text-xs font-semibold hover:text-indigo-200 transition"
                        >
                          Live →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}