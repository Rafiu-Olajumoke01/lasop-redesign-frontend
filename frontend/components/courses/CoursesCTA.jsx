import Link from "next/link";

export default function CoursesCTA() {
  return (
    <section className="bg-[#071224] pb-24">
      <div className="container-width">

        <div
          className="rounded-[32px] bg-gradient-to-r from-[#0057E7] to-[#004AC6] p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white">
            Need Help Choosing A Program?
          </h2>

          <p className="text-blue-100 mt-4 max-w-2xl mx-auto">
            Speak with our team and find the program
            that aligns with your goals.
          </p>

          <Link
            href="/contact"
            className="inline-block mt-8 bg-white text-[#0057E7] px-8 py-4 rounded-xl font-semibold"
          >
            Contact Admissions
          </Link>
        </div>

      </div>
    </section>
  );
}