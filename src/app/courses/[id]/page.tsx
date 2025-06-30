"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

const getVideoEmbedUrl = (url: string): string => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' && urlObj.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
    }
    if (urlObj.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
    }
  } catch (error) {
    console.error("Invalid URL for video embed:", error);
    return "";
  }
  // For other video providers or direct links
  return url;
};

export default function CourseDetailPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState('');
  const { token, user } = useAuth();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id && token) {
      const fetchCourse = async () => {
        try {
          const res = await fetch(`http://localhost:8088/api/courses/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setCourse(data);
          } else {
            setMessage('Failed to fetch course details');
          }
        } catch (error) {
          console.error(error);
          setMessage('An error occurred');
        }
      };
      fetchCourse();
    }
  }, [id, token]);

  const handleEnroll = async () => {
    if (!id || !token) return;
    try {
      const res = await fetch('http://localhost:8088/api/enrollments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: id }),
      });
      if (res.ok) {
        setMessage('Successfully enrolled!');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred during enrollment');
    }
  };

  if (!course) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="container py-8 mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold">{course.title}</CardTitle>
            {user?.role === 'student' && (
              <Button onClick={handleEnroll}>Enroll</Button>
            )}
            {user?.id === course.instructor_id && (
                <Link href={`/courses/${course.id}/edit`}>
                    <Button variant="outline">Edit Course</Button>
                </Link>
            )}
          </div>
          <CardDescription className="text-lg">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="mb-4 text-2xl font-semibold">Lessons</h3>
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-6">
              {course.lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lesson.content.map((contentItem) => (
                      <div key={contentItem.id} className="p-4 mb-2 border rounded-md">
                        <h4 className="font-semibold">{contentItem.title}</h4>
                        {contentItem.type === 'video' && contentItem.video_url ? (
                          <div className="aspect-w-16 aspect-h-9 mt-2">
                            <iframe
                              src={getVideoEmbedUrl(contentItem.video_url)}
                              title={contentItem.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full rounded-md"
                            ></iframe>
                          </div>
                        ) : (
                          <p>{contentItem.text_content}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No lessons available for this course yet.</p>
          )}
        </CardContent>
      </Card>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}
