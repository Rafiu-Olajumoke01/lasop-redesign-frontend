import { FiAward, FiUsers, FiCode, FiTrendingUp, FiBriefcase } from "react-icons/fi";

const stats = [
  {
    icon: <FiUsers />,
    title: "5K+",
    subtitle: "Students Trained",
  },
  {
    icon: <FiAward />,
    title: "17+",
    subtitle: "Years Experience",
  },
  {
    icon: <FiCode />,
    title: "100%",
    subtitle: "Practical Training",
  },
  {
    icon: <FiTrendingUp />,
    title: "Career",
    subtitle: "Focused Programs",
  },
  {
    icon: <FiBriefcase />,
    title: "Expert",
    subtitle: "Mentorship",
  },
];

export default function TrustStrip() {
  return (
    <section className="relative bg-[#071224] py-12">
      <div className="container-width">

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">

          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:border-blue-500/40 hover:bg-blue-900/10 transition-all duration-300"
            >
              <div className="text-blue-400 text-2xl mb-4">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold text-white">
                {item.title}
              </h3>

              <p className="text-slate-400 mt-1 text-sm">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}