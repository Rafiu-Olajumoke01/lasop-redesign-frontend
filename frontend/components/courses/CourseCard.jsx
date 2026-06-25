import Link from "next/link";
import Image from "next/image";

export default function CourseCard({ course }) {
  const imageUrl = course.image
    ? `${process.env.NEXT_PUBLIC_API_URL}${course.image}`
    : "/placeholder.jpg";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block bg-[#0B1628] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Bottom fade so image blends into card */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1628] via-transparent to-transparent" />

        {/* Category badge sitting on the image */}
        <span className="absolute top-3 left-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300">
          {course.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base leading-snug mb-4">
          {course.title}
        </h3>

        {/* Duration + Fee row */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.06] pt-4 mb-4">
          <span>{course.duration}</span>
          <span className="text-slate-400 font-medium">{course.fee}</span>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
            View program →
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <span className="text-blue-400 text-xs">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}