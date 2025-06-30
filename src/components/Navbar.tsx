"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">LMS</Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-600">Welcome, {user.username}!</span>
                <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
                <Link href="/courses"><Button variant="ghost">Courses</Button></Link>
                <Link href="/upload"><Button variant="ghost">Upload</Button></Link>
                {user.role === 'instructor' && (
                  <>
                    <Link href="/courses/create"><Button variant="ghost">Create Course</Button></Link>
                    <Link href="/admin/users"><Button variant="ghost">User Management</Button></Link>
                  </>
                )}
                <Button onClick={logout} variant="destructive">Logout</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/auth/register"><Button>Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
