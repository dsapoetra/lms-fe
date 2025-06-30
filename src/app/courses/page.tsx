"use client";

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const { token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCourses = async () => {
        try {
          const res = await fetch('http://localhost:8088/api/courses/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setCourses(data || []);
          } else {
            const data = await res.json();
            setMessage(data.error || 'Failed to fetch courses');
          }
        } catch (error) {
          console.error(error);
          setMessage('An error occurred. Please try again.');
        }
      };

      fetchCourses();
    }
  }, [isAuthenticated, token]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Please log in to view courses.</p>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Courses</h1>
        {/* We will add a create course button for instructors later */}
      </div>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id} className="block transition-transform duration-200 hover:scale-[1.02]">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Instructor ID: {course.instructor_id}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p>No courses available at the moment.</p>
      )}
    </div>
  );
}
