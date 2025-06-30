"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserManagementPage() {
  const { user, token, isLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'instructor' && token) {
      const fetchUsers = async () => {
        try {
          const res = await fetch(`http://localhost:8088/api/users/`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch users.');
          }

          const data: User[] = await res.json();
          setUsers(data);
        } catch (error) {
          setMessage('Failed to load users.');
          console.error(error);
        }
      };

      fetchUsers();
    }
  }, [user, token]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'instructor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Access Denied. You do not have permission to view this page.</p>
        <Link href="/"><Button>Go to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">User Management</h1>
      {message && <p className="text-red-500">{message}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
