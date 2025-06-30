"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Course, Lesson, Content, Enrollment, User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getApiUrl } from '@/lib/api';

export default function EditCoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id && token) {
      const fetchCourse = async () => {
                const res = await fetch(getApiUrl(`courses/${id}`), { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data: Course = await res.json();
          if (user?.id !== data.instructor_id) {
            setMessage('Access Denied. You are not the instructor of this course.');
            return;
          }
          setCourse(data);
          setTitle(data.title);
          setDescription(data.description);
          setLessons((data.lessons || []).map(lesson => ({
            ...lesson,
            content: lesson.content.sort((a, b) => a.order - b.order)
          })));
        }
      };
      fetchCourse();
    }
  }, [id, token, user?.id]);

  useEffect(() => {
    if (id && token && user?.role === 'instructor') {
      const fetchEnrollments = async () => {
        try {
                    const res = await fetch(getApiUrl(`courses/${id}/enrollments/`), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch enrollments');

          const enrollments: Enrollment[] = await res.json();

          if (enrollments && enrollments.length > 0) {
            const userPromises = enrollments.map(enrollment =>
                            fetch(getApiUrl(`users/${enrollment.user_id}`), {
                headers: { 'Authorization': `Bearer ${token}` },
              }).then(res => res.json())
            );
            const users = await Promise.all(userPromises);
            setEnrolledUsers(users.filter(u => u.id)); // Filter out any potential errors
          }
        } catch (error) {
          console.error("Failed to load enrolled students:", error);
          setMessage('Failed to load enrolled students.');
        }
      };

      fetchEnrollments();
    }
  }, [id, token, user?.role]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;

        const res = await fetch(getApiUrl(`courses/${id}/`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, description, lessons }),
    });

    if (res.ok) {
      setMessage('Course updated successfully!');
      router.push(`/courses/${id}`);
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!token || !id || !window.confirm('Are you sure you want to delete this course?')) return;

        const res = await fetch(getApiUrl(`courses/${id}/`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      setMessage('Course deleted successfully!');
      router.push('/courses');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed to delete course');
    }
  };

  const handleLessonChange = (index: number, value: string) => {
    const newLessons = [...lessons];
    newLessons[index].title = value;
    setLessons(newLessons);
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `new-lesson-${Date.now()}`,
      course_id: id as string,
      title: 'New Lesson',
      content: [
        {
          id: `new-content-${Date.now()}`,
          lesson_id: '',
          title: 'New Content',
          type: 'text',
          text_content: '',
          video_url: '',
          order: 0,
        },
      ],
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (index: number) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    setLessons(newLessons);
  };

  const handleContentChange = (lessonIndex: number, contentIndex: number, field: keyof Content, value: string) => {
    const newLessons = [...lessons];
    const contentItem = newLessons[lessonIndex].content[contentIndex];
    
    // @ts-expect-error - This is a safe way to handle dynamic key assignment
    contentItem[field] = value;

    if (field === 'type') {
      if (value === 'text') {
        contentItem.video_url = '';
      } else if (value === 'video') {
        contentItem.text_content = '';
      }
    }
    
    setLessons(newLessons);
  };

  const addContentItem = (lessonIndex: number) => {
    const newLessons = [...lessons];
    const newContent: Content = {
      id: `new-content-${Date.now()}`,
      lesson_id: newLessons[lessonIndex].id,
      title: 'New Content',
      type: 'text',
      text_content: '',
      video_url: '',
      order: newLessons[lessonIndex].content.length,
    };
    newLessons[lessonIndex].content.push(newContent);
    setLessons(newLessons);
  };

  const removeContentItem = (lessonIndex: number, contentIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].content = newLessons[lessonIndex].content.filter((_, i) => i !== contentIndex);
    setLessons(newLessons);
  };

  const handleReorderContent = (lessonIndex: number, contentIndex: number, direction: 'up' | 'down') => {
    const newLessons = [...lessons];
    const lesson = newLessons[lessonIndex];
    const content = lesson.content;

    if (direction === 'up' && contentIndex > 0) {
        [content[contentIndex - 1], content[contentIndex]] = [content[contentIndex], content[contentIndex - 1]];
    } else if (direction === 'down' && contentIndex < content.length - 1) {
        [content[contentIndex + 1], content[contentIndex]] = [content[contentIndex], content[contentIndex + 1]];
    }

    content.forEach((item, index) => {
        item.order = index;
    });

    setLessons(newLessons);
  };

  if (!course && !message) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (message.startsWith('Access Denied')) return <div className="flex items-center justify-center min-h-screen">{message}</div>;

  return (
    <div className="container py-8 mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <Button variant="destructive" onClick={handleDelete}>Delete Course</Button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-6">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Lessons</h3>
              {lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id || lessonIndex} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-lg">Lesson {lessonIndex + 1}</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(lessonIndex)}>Remove Lesson</Button>
                  </div>
                  <Input
                    placeholder="Lesson Title"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(lessonIndex, e.target.value)}
                    className="mb-4"
                  />
                  
                  <h4 className="font-semibold">Content</h4>
                  {lesson.content.map((contentItem, contentIndex) => (
                    <div key={contentItem.id || contentIndex} className="p-3 mt-2 space-y-3 border rounded-md bg-white">
                      <div className="flex items-center justify-between">
                        <Label>Content Item {contentIndex + 1}</Label>
                        <div className="flex items-center">
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleReorderContent(lessonIndex, contentIndex, 'up')} disabled={contentIndex === 0}>Up</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleReorderContent(lessonIndex, contentIndex, 'down')} disabled={contentIndex === lesson.content.length - 1}>Down</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeContentItem(lessonIndex, contentIndex)}>Remove</Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Content Title"
                        value={contentItem.title}
                        onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'title', e.target.value)}
                      />
                      <select
                        value={contentItem.type}
                        onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'type', e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                      </select>
                      {contentItem.type === 'text' ? (
                        <Textarea
                          placeholder="Text Content"
                          value={contentItem.text_content || ''}
                          onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'text_content', e.target.value)}
                        />
                      ) : (
                        <Input
                          placeholder="Video URL (e.g., YouTube)"
                          value={contentItem.video_url || ''}
                          onChange={(e) => handleContentChange(lessonIndex, contentIndex, 'video_url', e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addContentItem(lessonIndex)}>Add Content Item</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLesson}>Add Lesson</Button>
            </div>

            <Button type="submit">Save Changes</Button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}

        <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Enrolled Students</h2>
            {enrolledUsers.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrolledUsers.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.id}</TableCell>
                                <TableCell>{student.username}</TableCell>
                                <TableCell>{student.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No students are currently enrolled in this course.</p>
            )}
        </div>
    </div>
  );
}
