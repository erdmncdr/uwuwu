import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/locale - Set user locale
export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();

    if (!['en', 'tr'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('NEXT_LOCALE', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    // Also update user preference in database if logged in
    // This would be done in a real implementation

    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Error setting locale:', error);
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    );
  }
}
