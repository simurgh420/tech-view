import { dbSearch } from '@/services/search/db/queries';
import { normalizeSearchResults } from '@/services/search/searchNormalizer';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const raw = await dbSearch(q);
  const results = normalizeSearchResults(raw);

  return NextResponse.json(results);
}
