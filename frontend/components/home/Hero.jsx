import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen bg-[#071224] pt-32">
      {/* Background Glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="container-width">
        <div className="grid lg:grid-cols-2 gap-14 items-center min-h-[85vh]">
          {/* LEFT CONTENT */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-800 bg-blue-900/30 backdrop-blur-md mb-7">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />

              <p className="text-sm text-blue-200">
                Career-focused tech training since 2009
              </p>
            </div>

            {/* Heading */}
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-white">
              Build Your Future With
              <span className="text-[#5EA2FF] block">
                Practical Tech Skills
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-lg mt-7 max-w-xl leading-8">
              Learn software development, cybersecurity, AI engineering,
              automation, data science, and more through practical,
              career-focused programs at LASOP.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[#0057E7] to-[#0A66FF] text-white px-7 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 ease-out shadow-[0_12px_40px_rgba(0,87,231,0.35)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,87,231,0.45)] active:scale-[0.98]"
              >
                Explore Courses
              </Link>

              <Link
                href="/contact"
                className="border border-blue-700 hover:border-blue-500 text-slate-200 px-7 py-4 rounded-xl font-semibold transition"
              >
                Contact Us
              </Link>
            </div>

            {/* Stats */}
            {/* <div className="flex gap-12 mt-14">
              <div>
                <h2 className="text-3xl font-bold text-white">10+</h2>

                <p className="text-slate-400 mt-1">Career Programs</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">15K+</h2>

                <p className="text-slate-400 mt-1">Students Trained</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">17+</h2>

                <p className="text-slate-400 mt-1">Years Experience</p>
              </div>
            </div> */}
          </div>

          {/* RIGHT CONTENT */}
          <div className="relative flex justify-center">
            {/* Blue Glow */}
            <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full" />

            {/* Main Image */}
            <div className="relative z-10 rounded-md overflow-hidden border border-blue-900/40 shadow-2xl">
              <Image
                src="/hero-image.avif"
                alt="LASOP students"
                width={700}
                height={700}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute left-[-30px] bottom-[70px] bg-white rounded-xl shadow-xl p-5 z-20">
              <p className="text-sm text-slate-500">Most Popular</p>

              <h3 className="font-bold text-slate-900 mt-1">
                Full-stack Development & AI
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
