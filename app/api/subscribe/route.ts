import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lazy-initialize client to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface SubscribeRequest {
  email: string;
  source?: string;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const body: SubscribeRequest = await req.json();
    const { email, source = 'landing_page' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      // Already subscribed - return success (don't reveal existence)
      return NextResponse.json({
        success: true,
        message: "You're all set! Check your inbox.",
      });
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('email_leads')
      .insert({
        email: normalizedEmail,
        source,
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, message: 'Unable to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to Breezy Build! Check your inbox.',
    });

  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
