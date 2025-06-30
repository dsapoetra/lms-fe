export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'instructor';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  course_id: string;
  content: Content[];
}

export interface Content {
  id: string;
  title: string;
  type: 'text' | 'video';
  text_content?: string;
  video_url?: string;
  order: number;
  lesson_id: string;
}

export interface Enrollment {
  id:string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}
