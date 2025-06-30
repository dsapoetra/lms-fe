"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Course, Enrollment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token, isLoading, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'student' && token) {
      const fetchEnrollments = async () => {
        try {
          const res = await fetch(`http://localhost:8088/api/users/${user.id}/enrollments/`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!res.ok) throw new Error('Failed to fetch enrollments.');

          const enrollments: Enrollment[] = await res.json();
          if (enrollments && enrollments.length > 0) {
            // Fetch details for each enrolled course
            const coursePromises = enrollments.map(enrollment =>
              fetch(`http://localhost:8088/api/courses/${enrollment.course_id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
              }).then(res => res.json())
            );
            const courses = await Promise.all(coursePromises);
            setEnrolledCourses(courses);
          }
        } catch (error) {
          setMessage('Failed to load enrolled courses.');
          console.error(error);
        }
      };

      fetchEnrollments();
    }
  }, [user, token]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Please log in to view your dashboard.</p>
        <Link href="/auth/login"><Button>Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </CardContent>
      </Card>

      {user.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {message && <p className="text-red-500">{message}</p>}
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {enrolledCourses.map(course => (
                  <Link href={`/courses/${course.id}`} key={course.id} className="block transition-transform duration-200 hover:scale-[1.02]">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p>You are not enrolled in any courses yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
