import CoursesHero from "@/components/courses/CoursesHero";
import CourseFilters from "@/components/courses/CourseFilters";
import CoursesGrid from "@/components/courses/CoursesGrid";
import CoursesCTA from "@/components/courses/CoursesCTA";

export default function CoursesPage() {
  return (
    <main className="bg-[#071224] min-h-screen">

      <CoursesHero />

      <div className="container-width">
        <CourseFilters />
      </div>

      <CoursesGrid />

      <CoursesCTA />

    </main>
  );
}