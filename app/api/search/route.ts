import { dbSearch } from '@/features/search/server/queries';
import { normalizeSearchResults } from '@/features/search/server/searchNormalizer';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const raw = await dbSearch(q);
  const results = normalizeSearchResults(raw);

  return NextResponse.json(results);
}
