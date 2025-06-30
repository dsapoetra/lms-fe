# Learning Management System (LMS) Frontend

This is the frontend for a modern, full-featured Learning Management System (LMS) built with Next.js, React, and Tailwind CSS. It provides a clean, role-based interface for students and instructors to manage courses, lessons, and enrollments.

## Features

-   **User Authentication**: Secure user registration and login with JWT-based authentication.
-   **Role-Based Access Control**: Distinct user roles (Student and Instructor) with corresponding permissions and a tailored user interface.
-   **Course Management**: Instructors can create, edit, and delete courses, including detailed descriptions and lesson plans.
-   **Rich Lesson Content**: Supports multiple content types within lessons, including text and embedded videos (e.g., YouTube).
-   **Content Reordering**: Instructors can easily reorder lesson content using a simple up/down interface.
-   **Student Dashboard**: Students have a personalized dashboard to view their enrolled courses.
-   **Course Enrollment**: Students can browse and enroll in available courses.
-   **File Uploads**: Instructors can upload course materials.
-   **Admin User Management**: Instructors can view a list of all users in the system.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components.
-   **State Management**: React Context API for authentication.
-   **Linting**: ESLint

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/dsapoetra/lms-fe.git
    cd lms-fe
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project. You will need to create this file manually as it is ignored by git.

    Open `.env.local` and add the following line, pointing to your running LMS backend instance.
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8088/api
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend API

This frontend is designed to work with a corresponding backend service. The backend provides the necessary API endpoints for authentication, course management, and user data. Ensure the backend server is running and accessible at the URL specified in your `.env.local` file.

