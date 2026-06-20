import Link from "next/link";
import Image from "next/image";

export default function CourseCard({ course }) {
  const imageUrl = course.image
    ? `http://localhost:8000${course.image}`
    : "/placeholder.jpg";

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden hover:-translate-y-2 hover:border-blue-500/40 transition-all duration-300">
      <div className="relative h-56">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-900/20 text-blue-300 text-sm mb-4">
          {course.category}
        </span>

        <h3 className="text-xl font-semibold text-white mb-4">
          {course.title}
        </h3>

        <div className="space-y-2 text-slate-400">
          <p>Duration: {course.duration}</p>
          <p>Fee: {course.fee}</p>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="mt-6 inline-block w-full text-center bg-[#0057E7] hover:bg-[#0A66FF] text-white py-3 rounded-xl font-medium transition"
        >
          View Program
        </Link>
      </div>
    </div>
  );
}