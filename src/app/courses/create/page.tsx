"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentItem {
  title: string;
  type: 'text' | 'video';
  text_content?: string;
  video_url?: string;
}

interface LessonItem {
  title: string;
  content: ContentItem[];
}

export default function CreateCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<LessonItem[]>([{ title: '', content: [] }]);
  const [message, setMessage] = useState('');
  const { token, user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'instructor') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied. Only instructors can create courses.</div>;
  }

  const handleAddLesson = () => {
    setLessons([...lessons, { title: '', content: [] }]);
  };

  const handleAddContent = (lessonIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].content.push({ title: '', type: 'text' });
    setLessons(newLessons);
  };

  const handleLessonChange = (index: number, value: string) => {
    const newLessons = [...lessons];
    newLessons[index].title = value;
    setLessons(newLessons);
  };

  const handleContentChange = (lessonIndex: number, contentIndex: number, field: keyof ContentItem, value: string) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].content[contentIndex] = {
      ...newLessons[lessonIndex].content[contentIndex],
      [field]: value,
    };
    setLessons(newLessons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8088/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, lessons }),
      });

      if (res.ok) {
        setMessage('Course created successfully!');
        router.push('/courses');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred');
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Create a New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        {lessons.map((lesson, lessonIndex) => (
          <Card key={lessonIndex}>
            <CardHeader>
              <CardTitle>Lesson {lessonIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Lesson Title</Label>
                <Input value={lesson.title} onChange={(e) => handleLessonChange(lessonIndex, e.target.value)} required />
              </div>
              {lesson.content.map((contentItem, contentIndex) => (
                <div key={contentIndex} className="p-4 space-y-4 border rounded-md">
                  <Label>Content {contentIndex + 1}</Label>
                  <Input placeholder="Content Title" value={contentItem.title} onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'title', e.target.value)} required />
                  <select value={contentItem.type} onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'type', e.target.value)} className="w-full p-2 border rounded-md">
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                  </select>
                  {contentItem.type === 'text' ? (
                    <Textarea placeholder="Text Content" value={contentItem.text_content || ''} onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'text_content', e.target.value)} />
                  ) : (
                    <Input placeholder="Video URL" value={contentItem.video_url || ''} onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'video_url', e.target.value)} />
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddContent(lessonIndex)}>Add Content</Button>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={handleAddLesson}>Add Another Lesson</Button>
          <Button type="submit">Create Course</Button>
        </div>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}
