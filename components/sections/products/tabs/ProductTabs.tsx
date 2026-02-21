// components/product/tabs/ProductTabs.tsx
'use client';

import { useState } from 'react';
import TabHeader from './TabHeader';
import TabPanel from './TabPanel';

type Specs = Record<string, string | number | boolean>;

type Props = {
  description: string;
  specs: Specs;
  reviews?: { user: string; rating: number; comment: string }[];
  questions?: { user: string; question: string }[];
};

export default function ProductTabs({ description, specs, reviews = [], questions = [] }: Props) {
  const [active, setActive] = useState<'description' | 'specs' | 'reviews' | 'questions'>(
    'description'
  );

  return (
    <div className="mt-10">
      {/* Header */}
      <TabHeader active={active} onChange={setActive} />

      {/* Panels */}
      <div className="mt-6">
        {/* Description */}
        <TabPanel active={active} tab="description">
          <div className="prose dark:prose-invert leading-relaxed">{description}</div>
        </TabPanel>

        {/* Specs */}
        <TabPanel active={active} tab="specs">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
              </div>
            ))}
          </div>
        </TabPanel>

        {/* Reviews */}
        <TabPanel active={active} tab="reviews">
          {reviews.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">هنوز نظری ثبت نشده است.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="font-semibold">{r.user}</div>
                  <div className="text-yellow-500">⭐ {r.rating}</div>
                  <p className="text-gray-600 dark:text-gray-300">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </TabPanel>

        {/* Questions */}
        <TabPanel active={active} tab="questions">
          {questions.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">هنوز پرسشی ثبت نشده است.</div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="font-semibold">{q.user}</div>
                  <p className="text-gray-600 dark:text-gray-300">{q.question}</p>
                </div>
              ))}
            </div>
          )}
        </TabPanel>
      </div>
    </div>
  );
}
