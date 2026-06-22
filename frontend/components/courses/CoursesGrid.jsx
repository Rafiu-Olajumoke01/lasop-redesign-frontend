import CourseCard from "./CourseCard";

async function getCourses() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/`, {
    cache: "no-store"
  });
  const data = await response.json();
  return data;
}

export default async function CoursesGrid() {
  const courses = await getCourses();

  return (
    <section className="bg-[#071224] pb-24">
      <div className="container-width">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
            />
          ))}
        </div>
      </div>
    </section>
  );
}