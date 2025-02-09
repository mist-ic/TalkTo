import { NextResponse } from 'next/server';
import { testTTSAccess } from '../test';

export async function GET() {
  try {
    const hasAccess = await testTTSAccess();
    
    if (hasAccess) {
      return NextResponse.json({ status: 'success', message: 'Text-to-Speech API access verified' });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Failed to access Text-to-Speech API' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Error testing Text-to-Speech API access' },
      { status: 500 }
    );
  }
} 