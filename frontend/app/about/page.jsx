import Image from "next/image";
import Link from "next/link";

export default function About() {
  const features = [
    {
      title: "Practical, Project-Based Learning",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: "Every program is built around real projects, not just theory — students leave with a portfolio, not just a certificate.",
    },
    {
      title: "Industry-Aligned Curriculum",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: "Courses are updated continuously to match what employers are actually hiring for — from web development to AI engineering.",
    },
    {
      title: "Expert-Led Instruction",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      description: "Learn directly from working developers, engineers, and analysts who bring real-world context to every lesson.",
    },
    {
      title: "Flexible Learning Modes",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: "Choose in-person, online, or hybrid learning across our branches, designed to fit around work and life.",
    },
    {
      title: "Career Support",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "From resume reviews to interview prep, we support students well beyond graduation day.",
    },
    {
      title: "Hands-On Labs & Tools",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: "Work with the same tools and platforms used in the industry, in guided lab sessions and live builds.",
    },
  ];

  const stats = [
    { number: "X,000+", label: "Students Trained" },
    { number: "X+", label: "Career Programs" },
    { number: "X+", label: "Years of Experience" },
    { number: "X+", label: "Hiring Partners" },
  ];

  return (
    <div className="bg-[#071224]">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="LASOP students learning"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071224]/90 to-[#071224]/60"></div>
        </div>
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              About <span className="text-[#5EA2FF]">LASOP</span>
            </h1>
            <div className="w-24 h-1 bg-[#0A66FF] mx-auto mb-6"></div>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Career-focused tech training, empowering the next generation of African tech talent
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-20 px-6 bg-[#0A1830] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="container-width relative">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Left: label + heading */}
            <div className="lg:col-span-1">
              <div className="inline-flex p-3 bg-blue-900/30 border border-blue-800 rounded-xl mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#5EA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[#5EA2FF] font-semibold text-sm tracking-wider uppercase mb-2 block">
                Why We're Here
              </span>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Our Mission
              </h2>
              <div className="h-1 w-16 bg-[#0A66FF]"></div>
            </div>

            {/* Right: statement + supporting pillars */}
            <div className="lg:col-span-2">
              <p className="text-xl text-slate-200 leading-relaxed mb-10 font-medium">
                We believe practical tech skills open doors. LASOP exists to turn ambitious
                beginners into confident, job-ready professionals — through real projects,
                expert mentorship, and training built around what the industry actually needs.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: "Skill", desc: "Hands-on training in in-demand tech disciplines" },
                  { label: "Confidence", desc: "Real projects and portfolios, not just certificates" },
                  { label: "Career", desc: "A clear path from classroom to employment" },
                ].map((pillar, i) => (
                  <div
                    key={i}
                    className="bg-[#0F1F3D] border border-blue-900/40 rounded-xl p-5"
                  >
                    <div className="text-[#5EA2FF] font-bold text-sm tracking-wide uppercase mb-2">
                      {pillar.label}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20 px-6">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-[#5EA2FF] font-semibold text-sm tracking-wider uppercase mb-2 block">
                Our Journey
              </span>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                A Legacy of <span className="text-[#5EA2FF]">Tech Education</span>
              </h2>
              <div className="h-1 w-16 bg-[#0A66FF] mb-8"></div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                LASOP was founded with a simple goal: make career-focused tech training accessible
                and practical. From day one, our programs have been built around what learners
                actually need to land jobs and build real products.
              </p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Over the years, our curriculum has evolved alongside the industry — adding tracks
                in cybersecurity, automation, AI engineering, and data science, while staying rooted
                in hands-on, project-based learning.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Today, LASOP graduates are building careers across software development, security,
                and data — proof that practical skills, taught well, change outcomes.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full" />
              <div className="relative z-10 rounded-md overflow-hidden border border-blue-900/40 shadow-2xl">
                <Image
                  src="\aboutLasop.jpeg"
                  alt="LASOP classroom"
                  width={700}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values & Philosophy */}
      <div className="py-20 px-6 bg-[#0A1830]">
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-[#5EA2FF] font-semibold text-sm tracking-wider uppercase mb-2 block">
              Core Values
            </span>
            <h2 className="text-4xl font-bold text-white mb-6">What Sets Us Apart</h2>
            <div className="h-1 w-24 bg-[#0A66FF] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Career-First Approach",
                desc: "Every course is designed backward from employability — what skills, projects, and portfolio pieces actually get graduates hired.",
              },
              {
                title: "Practical Over Theoretical",
                desc: "Less lecture, more building. Students write real code, ship real projects, and learn by doing from week one.",
              },
              {
                title: "Accessible Learning",
                desc: "Online, in-person, or hybrid — flexible formats designed to fit around work, school, and life.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#0F1F3D] p-8 rounded-xl border border-blue-900/40 hover:border-blue-700 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="mb-4 text-[#5EA2FF]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services / Features Section */}
      <div className="py-20 px-6">
        <div className="container-width">
          <div className="text-center mb-16">
            <span className="text-[#5EA2FF] font-semibold text-sm tracking-wider uppercase mb-2 block">
              Why LASOP
            </span>
            <h2 className="text-4xl font-bold text-white mb-6">What We Offer</h2>
            <div className="h-1 w-24 bg-[#0A66FF] mx-auto mb-6"></div>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              A complete learning experience designed to take students from beginner to
              job-ready, practical tech professional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#0A1830] p-8 rounded-xl border border-blue-900/30 hover:border-blue-700 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-6 text-[#5EA2FF]">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-[#0057E7] to-[#0A66FF] text-white">
        <div className="container-width">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="py-6">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm md:text-base uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-[#0A1830]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join the LASOP Community</h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Join thousands of students already building real tech careers with LASOP. Start
            your journey today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#0057E7] to-[#0A66FF] text-white px-10 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 ease-out shadow-[0_12px_40px_rgba(0,87,231,0.35)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,87,231,0.45)] active:scale-[0.98] text-lg"
            >
              Explore Courses
            </Link>
            <Link
              href="/contact"
              className="border border-blue-700 hover:border-blue-500 text-slate-200 px-10 py-4 rounded-xl font-semibold transition text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}