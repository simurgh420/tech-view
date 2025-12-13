'use client';
import { useState } from 'react';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagsInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');
  const addTag = () => {
    const newTag = input.trim();
    if (newTag !== '' && !value.includes(newTag)) {
      const updated = [...(value ?? []), newTag];
      onChange(updated);
    }
    setInput('');
  };
  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-sm">
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
