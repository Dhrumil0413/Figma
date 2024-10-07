"use client";


import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react';
import { Room } from "./Room";
import RealApp from './RealApp';

export default function Page() {

  const router = useRouter(); // Initialize the router
  const { data: session, status } = useSession(); // Get session data and status

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md">
        <h1 className="text-xl mb-4">Sign In</h1>
        <button 
          onClick={() => signIn('google')}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
    )
  }

  if (session) {
    return (
      <Room>
        <RealApp />
      </Room>
    );
  }
}