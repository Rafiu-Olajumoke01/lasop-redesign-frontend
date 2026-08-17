import Link from "next/link";

const studentProjects = [
  {
    id: 1,
    title: "TaskFlow - Team Productivity App",
    studentName: "Chiamaka Okoro",
    cohort: "Full-Stack Cohort 4",
    gradient: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    description: "A Kanban-style task manager built for small teams to track projects in real time.",
    techStack: ["React", "Django REST", "PostgreSQL"],
  },
  {
    id: 2,
    title: "MediCare Connect",
    studentName: "Tunde Bakare",
    cohort: "Full-Stack Cohort 4",
    gradient: "linear-gradient(135deg, #0EA5E9, #06B6D4)",
    description: "A platform connecting patients with nearby clinics for appointment booking.",
    techStack: ["Next.js", "Django", "Tailwind"],
  },
  {
    id: 3,
    title: "ShopEase - E-commerce Storefront",
    studentName: "Ifeoma Nwachukwu",
    cohort: "Full-Stack Cohort 3",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    description: "A full online store with cart, checkout, and admin inventory management.",
    techStack: ["React", "Django REST", "Stripe"],
  },
  {
    id: 4,
    title: "EduTrack - Attendance System",
    studentName: "Segun Adeyemi",
    cohort: "Full-Stack Cohort 3",
    gradient: "linear-gradient(135deg, #F59E0B, #EA580C)",
    description: "A digital attendance tracker for schools with real-time reporting for admins.",
    techStack: ["Next.js", "Django", "Chart.js"],
  },
];

export default function StudentProjects() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl overflow-hidden flex flex-col border border-white/10 hover:border-indigo-400/40 transition-colors duration-200"
              style={{ backgroundColor: "#0F2143" }}
            >
              <div
                className="relative w-full aspect-video shrink-0 flex items-center justify-center"
                style={{ background: project.gradient }}
              >
                <span className="text-white/90 font-semibold text-lg tracking-wide">
                  {project.title}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs font-medium text-indigo-400 mb-1">
                  {project.cohort}
                </span>

                <h3 className="text-base font-semibold text-white mb-1 leading-snug">
                  {project.title}
                </h3>

                <p className="text-sm text-gray-400 mb-2">
                  by {project.studentName}
                </p>

                <p className="text-sm text-gray-300 mb-4 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.techStack.map((tech) => (
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

        <div className="text-center mt-10">
          <Link
            href="/student-projects"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            See More Projects
          </Link>
        </div>
      </div>
    </section>
  );
}