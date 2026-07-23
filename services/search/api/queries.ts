import axios from 'axios';

export const searchQueryKey = (query: string) => ['search', query];

export async function searchApi(query: string) {
  if (!query || query.trim() === '') return [];

  const res = await axios.get('/api/search', {
    params: { q: query },
  });

  return res.data;
}
