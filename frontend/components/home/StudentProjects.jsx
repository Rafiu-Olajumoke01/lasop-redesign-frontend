import Image from "next/image";
import Link from "next/link";

const studentProjects = [
  {
    id: 1,
    title: "TaskFlow - Team Productivity App",
    studentName: "Chiamaka Okoro",
    cohort: "Full-Stack Cohort 4",
    image: "/images/projects/taskflow.png",
    description: "A Kanban-style task manager built for small teams to track projects in real time.",
    techStack: ["React", "Django REST", "PostgreSQL"],
    liveLink: "https://taskflow-demo.vercel.app",
    githubLink: "https://github.com/chiamaka/taskflow",
  },
  {
    id: 2,
    title: "MediCare Connect",
    studentName: "Tunde Bakare",
    cohort: "Full-Stack Cohort 4",
    image: "/images/projects/medicare-connect.png",
    description: "A platform connecting patients with nearby clinics for appointment booking.",
    techStack: ["Next.js", "Django", "Tailwind"],
    liveLink: "https://medicare-connect-demo.vercel.app",
    githubLink: "https://github.com/tundebakare/medicare-connect",
  },
  {
    id: 3,
    title: "ShopEase - E-commerce Storefront",
    studentName: "Ifeoma Nwachukwu",
    cohort: "Full-Stack Cohort 3",
    image: "/images/projects/shopease.png",
    description: "A full online store with cart, checkout, and admin inventory management.",
    techStack: ["React", "Django REST", "Stripe"],
    liveLink: "https://shopease-demo.vercel.app",
    githubLink: "https://github.com/ifeoma/shopease",
  },
  {
    id: 4,
    title: "EduTrack - Attendance System",
    studentName: "Segun Adeyemi",
    cohort: "Full-Stack Cohort 3",
    image: "/images/projects/edutrack.png",
    description: "A digital attendance tracker for schools with real-time reporting for admins.",
    techStack: ["Next.js", "Django", "Chart.js"],
    liveLink: "https://edutrack-demo.vercel.app",
    githubLink: "https://github.com/segunadeyemi/edutrack",
  },
];

export default function StudentProjects() {
  return (
    <section className="w-full bg-white py-16 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            What Our Students Have Built
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Real projects, built by real students, during their time at LASOP.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="relative w-full h-40">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs font-medium text-indigo-600 mb-1">
                  {project.cohort}
                </span>

                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {project.title}
                </h3>

                <p className="text-sm text-gray-500 mb-2">
                  by {project.studentName}
                </p>

                <p className="text-sm text-gray-600 mb-3 flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 text-sm font-medium mt-auto">
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Live Demo
                  </a>
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:underline"
                  >
                    GitHub
                  </a>
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