"use client";

import CoursesPage from "./courses/page";

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Learn, Grow, Succeed
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your journey to knowledge starts here. Browse our available courses below.
        </p>
      </div>
      <CoursesPage />
    </div>
  );
}
