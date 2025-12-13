import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the site URL for the function call
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8888';
    const generateUrl = `${siteUrl}/.netlify/functions/generate-post-content`;

    // Trigger the generation function
    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pipeline-Secret': process.env.PIPELINE_SECRET_KEY || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Post generation failed:', errorText);
      return NextResponse.json(
        { success: false, error: 'Generation failed', details: errorText },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: result.success,
      topic: result.topic,
      title: result.title,
      status: result.status,
      qualityScore: result.qualityScore,
      qualityIssues: result.qualityIssues,
      message: result.message,
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
