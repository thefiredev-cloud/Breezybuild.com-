import Link from 'next/link';
import { BoltIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function ContactPage() {
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
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-zinc-600">
              Have questions, feedback, or tool suggestions? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-primary-600" />
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Email Us</h2>
            <p className="text-zinc-600 mb-6">
              For general inquiries, partnerships, or tool suggestions, reach out to:
            </p>

            <a
              href="mailto:hello@breezybuild.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-lg"
            >
              <EnvelopeIcon className="w-5 h-5" />
              hello@breezybuild.com
            </a>

            <div className="mt-8 pt-8 border-t border-zinc-200">
              <h3 className="font-semibold text-zinc-900 mb-3">Looking for support?</h3>
              <p className="text-zinc-600 text-sm">
                If you&apos;re a subscriber and need help with your account, email us at{' '}
                <a href="mailto:support@breezybuild.com" className="text-primary-600 hover:underline">
                  support@breezybuild.com
                </a>
              </p>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="text-center mt-8">
            <p className="text-zinc-600">
              Check our{' '}
              <Link href="/pricing" className="text-primary-600 hover:underline font-medium">
                Pricing FAQ
              </Link>{' '}
              for common questions.
            </p>
          </div>
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
