'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development, could send to error service in production
    console.error('[BreezyBuild Error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
          <Image
            src="/logo.jpg"
            alt="Breezy Build Logo"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <span className="text-2xl font-bold text-sand-900">
          Breezy<span className="text-breezy-500">Build</span>
        </span>
      </div>

      {/* Error Content */}
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-sand-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-sand-600 mb-8">
          We hit a snag loading this page. Don&apos;t worry - these things happen.
          Try again or head back home.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-cta text-white font-semibold rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-breezy-600 font-semibold rounded-xl border-2 border-breezy-200 hover:border-breezy-400 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Error Details (dev mode) */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <div className="mt-8 max-w-lg w-full">
          <details className="bg-sand-100 rounded-lg p-4">
            <summary className="text-sm font-medium text-sand-700 cursor-pointer">
              Error Details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-sand-600 overflow-auto max-h-40">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
