export default function CoursesHero() {
  return (
    <section className="bg-[#050D1A] pt-36 pb-10">
      <div className="container-width">
        <p className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-3">
          LASOP Programs
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Find your program
          </h1>
          <p className="text-slate-500 text-sm max-w-xs sm:text-right leading-relaxed">
            Practical programs designed to get you job-ready fast.
          </p>
        </div>
      </div>
    </section>
  );
}