'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Appointment Manager</h1>
      <p className="mb-8">Manage your appointments</p>
      <div className="space-x-4">
        <Link href="/signin" className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign In
        </Link>
        <Link href="/signup" className="bg-gray-500 text-white px-4 py-2 rounded">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
