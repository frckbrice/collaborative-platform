// app/auth/auth-code-error/page.jsx
import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-2">We encountered a problem with your authentication.</p>
        <div className="mt-6">
          <Link href="/login" className="text-blue-600 hover:underline">
            Go back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
