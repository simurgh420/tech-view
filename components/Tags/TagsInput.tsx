'use client';
import { useState } from 'react';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagsInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');
  const normalizeTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed.includes('_')) return trimmed;
    if (trimmed.includes(' ')) return trimmed.replace(/\s+/g, '_');
    return trimmed;
  };
  const addTag = () => {
    const rawTag = input.trim();
    if (!rawTag) return;
    const newTag = normalizeTag(rawTag);
    if (!value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInput('');
  };
  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 px-2 py-1  rounded text-sm">
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="تگ جدید..."
        className="border px-2 py-1 rounded"
      />
    </div>
  );
}
