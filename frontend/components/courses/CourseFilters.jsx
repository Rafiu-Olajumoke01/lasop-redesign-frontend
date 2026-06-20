export default function CourseFilters() {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-14">

      <button className="px-5 py-2 rounded-full bg-[#0057E7] text-white cursor-pointer">
        All
      </button>

      <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500 cursor-pointer">
        Technology
      </button>

      <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500 cursor-pointer">
        Business
      </button>

      <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500 cursor-pointer">
        Vocational
      </button>

    </div>
  );
}