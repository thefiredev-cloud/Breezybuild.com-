import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
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

      {/* 404 Content */}
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-breezy-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-sand-900 mb-4">
          Page not found
        </h2>
        <p className="text-sand-600 mb-8">
          Looks like this page took a detour. It happens to the best of us.
          Let&apos;s get you back on track.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-cta text-white font-semibold rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Back to Home
          </Link>
          <Link
            href="/browse"
            className="px-6 py-3 bg-white text-breezy-600 font-semibold rounded-xl border-2 border-breezy-200 hover:border-breezy-400 transition-all duration-200"
          >
            Browse Tools
          </Link>
        </div>
      </div>

      {/* Helpful Links */}
      <div className="mt-12 text-center">
        <p className="text-sm text-sand-500 mb-3">Or try one of these:</p>
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/pricing" className="text-breezy-600 hover:text-breezy-700 hover:underline">
            Pricing
          </Link>
          <span className="text-sand-300">|</span>
          <Link href="/posts" className="text-breezy-600 hover:text-breezy-700 hover:underline">
            Blog
          </Link>
          <span className="text-sand-300">|</span>
          <Link href="/login" className="text-breezy-600 hover:text-breezy-700 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
