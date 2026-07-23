// // components/sections/products/description/ProductDescription.tsx
// 'use client';

// import { useState } from 'react';

// const COLLAPSE_LENGTH = 400;

// export default function ProductDescription({ description }: { description: string }) {
//   const [expanded, setExpanded] = useState(false);

//   if (!description) {
//     return <p className="text-sm text-gray-500">توضیحاتی برای این محصول ثبت نشده است.</p>;
//   }

//   const isLong = description.length > COLLAPSE_LENGTH;
//   const shown = expanded || !isLong ? description : `${description.slice(0, COLLAPSE_LENGTH)}...`;

//   return (
//     <div className="space-y-3">
//       <p className="leading-8 text-gray-700 dark:text-gray-300 whitespace-pre-line">{shown}</p>

//       {isLong && (
//         <button
//           type="button"
//           onClick={() => setExpanded(v => !v)}
//           className="text-sm font-medium text-blue-600 hover:underline"
//         >
//           {expanded ? 'مشاهده کمتر' : 'ادامه مطلب'}
//         </button>
//       )}
//     </div>
//   );
// }
