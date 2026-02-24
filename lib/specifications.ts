export function recordToArray(record: Record<string, { label: string; value: string | number }[]>) {
  return Object.entries(record).map(([group, items]) => ({
    group,
    items: Array.isArray(items) ? items : [],
  }));
}

export function arrayToRecord(
  arr: { group: string; items: { label: string; value: string | number }[] }[]
) {
  const result: Record<string, { label: string; value: string | number }[]> = {};
  for (const spec of arr) {
    result[spec.group] = spec.items;
  }
  return result;
}
