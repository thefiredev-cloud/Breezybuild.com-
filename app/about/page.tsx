import Link from 'next/link';
import { BoltIcon, SparklesIcon, RocketLaunchIcon, LightBulbIcon } from '@heroicons/react/24/solid';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary-600">Breezy</span>
                <span className="text-zinc-800">Build</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium">
                Login
              </Link>
              <Link
                href="/login?signup=true"
                className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-16">
        {/* Hero */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
            Build with AI, Ship with Confidence
          </h1>
          <p className="text-xl text-zinc-600">
            BreezyBuild helps non-technical founders discover and evaluate the best AI dev tools
            so they can build their ideas without writing code.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-12 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Mission</h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The AI revolution has made it possible for anyone to build software. But with thousands
            of tools launching every week, how do you know which ones are actually worth your time?
          </p>
          <p className="text-zinc-700 leading-relaxed">
            We research, analyze, and score AI dev tools every single day, focusing on what matters
            most to non-technical founders: ease of use, business viability, and real-world results.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Daily Research</h3>
            <p className="text-zinc-600 text-sm">
              Every day, we deep-dive into one AI dev tool, providing comprehensive analysis
              you can&apos;t find anywhere else.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="w-12 h-12 bg-warm-100 rounded-lg flex items-center justify-center mb-4">
              <RocketLaunchIcon className="w-6 h-6 text-warm-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Founder-Focused</h3>
            <p className="text-zinc-600 text-sm">
              Our scoring system is designed specifically for non-technical founders who want
              to build real businesses, not side projects.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <LightBulbIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Honest Analysis</h3>
            <p className="text-zinc-600 text-sm">
              We tell you the truth about each tool&apos;s strengths, weaknesses, and who it&apos;s
              really for. No fluff, no hype.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Ready to start building?</h2>
          <p className="text-zinc-600 mb-6">
            Check out today&apos;s Tool of the Day and see how we can help you build smarter.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            <BoltIcon className="w-5 h-5" />
            See Today&apos;s Tool
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 mt-16">
        <div className="container-wide text-center">
          <p className="text-zinc-400 text-sm">
            &copy; {new Date().getFullYear()} BreezyBuild. Build with AI, ship with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}
