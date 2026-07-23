// components/shared/RichContentViewer.tsx
import sanitizeHtml from 'sanitize-html';

// این کامپوننت تنها جایی است که خروجی ادیتور (TipTap) نمایش داده می‌شود.
// هم PostContent (بلاگ) و هم تب توضیحات محصول باید از همین استفاده کنند
// تا تنظیمات RTL و ایمنی محتوا یک‌بار و به‌صورت یکسان اعمال شود.

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre',
  'img', 'video', 'source', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'span', 'div', 'mark',
];

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      // width/height مجاز شد تا سایزی که کاربر با ابزار resize خود ادیتور
      // انتخاب کرده حفظ بشه؛ overflow هم با max-width در CSS پایین کنترل می‌شود
      img: ['src', 'alt', 'width', 'height'],
      video: ['src', 'controls'],
      source: ['src', 'type'],
      '*': ['class', 'style'],
    },
    allowedStyles: {
      '*': {
        color: [/^#[0-9a-f]{3,6}$/i],
        'background-color': [/^#[0-9a-f]{3,6}$/i],
        'text-align': [/^(left|right|center|justify)$/],
      },
      img: {
        width: [/^\d{1,4}(px|%)$/, /^auto$/],
        height: [/^\d{1,4}(px|%)$/, /^auto$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
    },
  });
}

export default function RichContentViewer({ html }: { html: string }) {
  if (!html?.trim()) return null;

  return (
    <div
      dir="rtl"
      className="
        prose prose-neutral max-w-none dark:prose-invert
        text-right
        prose-headings:text-right prose-p:text-right prose-li:text-right
        prose-p:leading-8 prose-p:text-[17px]

        prose-blockquote:border-s-4 prose-blockquote:border-e-0
        prose-blockquote:border-blue-500
        prose-blockquote:bg-gray-100 dark:prose-blockquote:bg-gray-800
        prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:not-italic

        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100

        prose-code:bg-gray-200 dark:prose-code:bg-gray-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4
        prose-pre:text-left prose-pre:dir-ltr

        [&_img]:max-w-full [&_img]:h-auto
        [&_img]:rounded-xl [&_img]:shadow-md [&_img]:mx-auto [&_img]:my-4

        [&_ul]:pr-5 [&_ol]:pr-5
        [&_table]:w-full [&_table]:border [&_table]:border-collapse
        [&_th]:border [&_th]:bg-gray-50 dark:[&_th]:bg-gray-800 [&_th]:p-2 [&_th]:text-right
        [&_td]:border [&_td]:p-2 [&_td]:text-right

        [&_video]:w-full [&_video]:rounded-xl
      "
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
