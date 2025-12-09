// All landing page copy in one place for easy editing

export const SITE = {
  name: 'Breezy Build',
  tagline: 'Build with AI, ship with confidence',
  url: 'https://breezybuild.com',
};

export const HERO = {
  eyebrow: 'Daily AI Insights',
  headline: 'Ship Apps Without Writing Code',
  subheadline: 'Daily 5-minute insights for non-technical founders learning AI-assisted development. Free members see today\'s post. Upgrade for full archive access.',
  cta: 'Create Free Account',
  privacy: 'Free forever. Upgrade anytime.',
  trustSignals: [
    { label: 'Daily', description: 'new insights' },
    { label: '5 min', description: 'reads' },
    { label: 'Free', description: 'to start' },
  ],
};

export const SUCCESS = {
  headline: "You're In!",
  subheadline: 'Your account is ready. Start exploring.',
  deliverables: [
    'Daily AI tool updates & tutorials',
    'Step-by-step project breakdowns',
    'Curated learning resources',
    'Exclusive templates & prompts',
  ],
};

export const PROBLEMS = {
  headline: 'Sound Familiar?',
  items: [
    {
      icon: '1',
      problem: 'Spending hours on tutorials...',
      pain: '...that are outdated by next week. AI tools change faster than you can learn them.',
    },
    {
      icon: '2',
      problem: 'Too many AI tools to choose from...',
      pain: '...no idea which ones actually work. Everyone has a different opinion.',
    },
    {
      icon: '3',
      problem: 'Want to build but feel stuck...',
      pain: '...coding feels like a foreign language. You have ideas but no way to execute.',
    },
  ],
  agitation: 'Every day you wait, someone else ships the app you dreamed about.',
  transition: 'What if there was a better way?',
};

export const PRICING = {
  headline: 'Choose Your Plan',
  subheadline: 'Start free, upgrade for full archive access',
  tiers: [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Today\'s daily post',
        'Basic AI tool recommendations',
        'Community Discord access',
      ],
      highlighted: false,
      cta: 'Get Started Free',
    },
    {
      name: 'Starter',
      price: 4.99,
      period: '/month',
      description: 'Unlock the archive',
      features: [
        'Everything in Free',
        'Full archive access',
        'Curated AI tool database',
        'Prompt template library',
        'Priority email support',
      ],
      highlighted: false,
      cta: 'Unlock Archive',
    },
    {
      name: 'Pro',
      price: 14.99,
      period: '/month',
      description: 'Most popular for founders',
      features: [
        'Everything in Starter',
        '10+ hours of video tutorials',
        'Real project walkthroughs',
        'Private Pro Discord channel',
        'Monthly live Q&A sessions',
        'Early access to new content',
      ],
      highlighted: true,
      badge: 'Most Popular',
      cta: 'Go Pro',
    },
    {
      name: 'Enterprise',
      price: 99,
      period: '/month',
      description: 'For teams & serious scaling',
      features: [
        'Everything in Pro',
        '1:1 AI development coaching',
        'Custom project roadmap',
        'Weekly accountability calls',
        'Team access (up to 5)',
        'White-glove onboarding',
      ],
      highlighted: false,
      cta: 'Contact Us',
    },
  ],
};

export const TESTIMONIALS = {
  headline: 'What You Will Learn',
  items: [
    {
      quote: "Which AI coding tools actually work for non-developers, and which ones are overhyped.",
      author: 'Tool Reviews',
      role: 'Daily Coverage',
      result: 'Honest assessments',
      avatar: 'TR',
    },
    {
      quote: "Step-by-step breakdowns of real projects built entirely with AI assistance.",
      author: 'Project Guides',
      role: 'Practical Tutorials',
      result: 'Learn by example',
      avatar: 'PG',
    },
    {
      quote: "The latest updates, new features, and changes to tools like Claude, Cursor, v0, Bolt, and more.",
      author: 'AI News',
      role: 'Stay Current',
      result: 'Never miss updates',
      avatar: 'AN',
    },
  ],
};

export const TRANSFORMATION = {
  headline: 'Your Journey',
  stages: [
    {
      time: 'Day 1',
      title: 'First Insight',
      description: 'Get your first actionable AI development tip. No fluff, just something you can use today.',
    },
    {
      time: 'Week 1',
      title: 'Building Confidence',
      description: 'Complete your first AI-assisted micro-project. See what\'s possible without writing code.',
    },
    {
      time: 'Month 1',
      title: 'Shipping Products',
      description: 'Launch your first real app to actual users. Get feedback, iterate, improve.',
    },
    {
      time: '3 Months',
      title: 'New Opportunities',
      description: 'Freelance, start a SaaS, or level up your career. Build becomes your superpower.',
    },
  ],
};

export const SECONDARY_CTA = {
  headline: 'Ready to start building?',
  subheadline: 'Get daily AI development insights delivered straight to your feed.',
  cta: "Start Learning Free",
  avatarCount: 0,
};

export const FOOTER = {
  links: {
    product: [
      { label: 'The Daily', href: '/daily' },
      { label: 'Archive', href: '/daily/archive' },
      { label: 'Pricing', href: '#pricing' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  social: {
    twitter: 'https://twitter.com/breezybuild',
    linkedin: 'https://linkedin.com/company/breezybuild',
  },
  copyright: `${new Date().getFullYear()} Breezy Build. All rights reserved.`,
  madeWith: 'Made with Claude + Next.js',
};
