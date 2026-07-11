'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { RichTextProvider } from 'reactjs-tiptap-editor';

// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';

// build extensions
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { History, RichTextRedo, RichTextUndo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { MoreMark, RichTextMoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { RichTextSearchAndReplace, SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { RichTextStrike, Strike } from 'reactjs-tiptap-editor/strike';
import { Table } from 'reactjs-tiptap-editor/table';
import { RichTextTaskList, TaskList } from 'reactjs-tiptap-editor/tasklist';
import { RichTextAlign, TextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextDirection } from 'reactjs-tiptap-editor/textdirection';
import { RichTextUnderline, TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { RichTextVideo, Video } from 'reactjs-tiptap-editor/video';
import { RichTextCallout, Callout } from 'reactjs-tiptap-editor/callout';

// Slash Command
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';

// Bubble
import {
  RichTextBubbleImage,
  RichTextBubbleImageGif,
  RichTextBubbleLink,
  RichTextBubbleText,
  RichTextBubbleVideo,
  RichTextBubbleMenuDragHandle,
  RichTextBubbleCallout,
} from 'reactjs-tiptap-editor/bubble';

import 'reactjs-tiptap-editor/style.css';
import { EditorContent, useEditor } from '@tiptap/react';
import axios from 'axios';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const deleteImageRequest = async (imageUrl: string) => {
  try {
    await axios.post('/api/images/delete', { imagePath: imageUrl });
  } catch (err) {
    console.error('Error deleting image:', err);
  }
};

// استخراج src عکس‌ها از سند فعال ادیتور (بعد از mount شدن)
const getImagesFromEditor = (editor: any): string[] => {
  const images: string[] = [];
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'image' && node.attrs.src) {
      images.push(node.attrs.src);
    }
  });
  return images;
};

// استخراج src عکس‌ها مستقیم از رشتهٔ HTML اولیه (قبل از mount شدن ادیتور)
function extractImageSrcs(html: string): string[] {
  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
  return Array.from(matches, m => m[1]);
}

const RichTextToolbar = () => {
  return (
    <div className="flex items-center p-1 gap-2 flex-wrap border-b border-solid border-border">
      <RichTextUndo />
      <RichTextRedo />
      <RichTextSearchAndReplace />
      <RichTextClear />
      <RichTextFontFamily />
      <RichTextHeading />
      <RichTextFontSize />
      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextMoreMark />
      <RichTextEmoji />
      <RichTextColor />
      <RichTextHighlight />
      <RichTextBulletList />
      <RichTextOrderedList />
      <RichTextAlign />
      <RichTextIndent />
      <RichTextLineHeight />
      <RichTextTaskList />
      <RichTextLink />
      <RichTextImage />
      <RichTextVideo />
      <RichTextImageGif />
      <RichTextBlockquote />
      <RichTextHorizontalRule />
      <RichTextCode />
      <RichTextCodeBlock />
      <RichTextCallout />
    </div>
  );
};

type Props = {
  value: string;
  onChange: (val: string) => void;
  slug: string;
};

export default function Editor({ value, onChange, slug }: Props) {
  // فقط برای بوکیپینگ بین رندرها استفاده می‌شود (نه برای نمایش UI)،
  // پس useRef درسته نه useState — هیچ رندری تریگر نمی‌کند
  const prevImagesRef = useRef<string[]>(extractImageSrcs(value || ''));
  const debouncedOnChange = useRef<(val: string) => void>(() => {});

  // آخرین HTMLـی که خودمان از طریق onChange به بیرون فرستادیم.
  // برای تشخیص "این تغییرِ value، اکوی خودمونه یا واقعاً از بیرون اومده؟"
  const lastEmittedRef = useRef<string>(value || '');

  // ─────────────────────────────────────────────────────────────
  // ریشهٔ اصلی باگ چشمک‌زدن اینجا بود:
  // قبلاً extensions هر بار که کامپوننت رندر می‌شد از نو ساخته می‌شد،
  // چون Image.configure(...) / TextDirection.configure(...) و بقیه
  // هر بار یک شیء (object) کاملاً جدید برمی‌گردانند — یعنی رفرنس آرایه
  // هیچ‌وقت پایدار نبود.
  //
  // useEditor با دیدن رفرنس جدید extensions، فکر می‌کند پیکربندی عوض
  // شده و کل ادیتور را نابود و از نو می‌سازد. ساختن دوبارهٔ ادیتور خودش
  // یک آپدیت داخلی تولید می‌کند که onUpdate را صدا می‌زند؛ onUpdate هم
  // (بعد از debounce) دوباره باعث رندر کامپوننت می‌شود؛ رندر دوباره یعنی
  // extensions دوباره ساخته می‌شود؛ و این چرخه بی‌نهایت ادامه پیدا می‌کند
  // — دقیقاً همان چشمک‌زدن مداوم، حتی بدون اینکه کاربر کاری کرده باشد.
  //
  // با useMemo و وابستگی فقط به slug، این آرایه بین رندرها پایدار
  // می‌ماند و ادیتور دیگر هرگز به‌خاطر رندر مجدد کامپوننت از نو
  // ساخته نمی‌شود.
  // ─────────────────────────────────────────────────────────────
  const extensions = useMemo(() => {
    const BaseKit = [
      Document,
      Text,
      Paragraph,
      Dropcursor,
      Gapcursor,
      HardBreak,
      ListItem,
      TextStyle,
      Placeholder.configure({
        placeholder: 'برای دستورات از / استفاده کنید',
      }),
    ];

    return [
      ...BaseKit,
      History,
      SearchAndReplace,
      Clear,
      FontFamily,
      Heading,
      FontSize,
      Bold,
      Italic,
      TextUnderline,
      Strike,
      MoreMark,
      Emoji,
      Color,
      Highlight,
      BulletList,
      OrderedList,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Indent,
      LineHeight,
      TaskList,
      Link,
      Image.configure({
        // width/height را عمداً روی خود المان با استایل اینلاین ست نمی‌کنیم؛
        // نمایش نهایی (RichContentViewer) خودش تصویر را ریسپانسیو می‌کند.
        async upload(file: File) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', `blogs/${slug}/editor`);
          formData.append('baseName', file.name);
          const res = await axios.post('/api/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return res.data.imageUrl as string;
        },
      }),
      Video.configure({
        upload: (files: File) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(URL.createObjectURL(files));
            }, 300);
          });
        },
      }),
      ImageGif.configure({
        provider: 'giphy',
        API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY as string,
      }),
      Blockquote,
      HorizontalRule,
      Code,
      CodeBlock,
      Table,

      TextDirection.configure({
        types: ['heading', 'paragraph'],
        defaultDirection: 'rtl',
      }),

      SlashCommand,
      Callout,
    ];
    // فقط وقتی slug عوض بشه extensions باید دوباره ساخته بشه
    // (چون مسیر آپلود عکس به آن وابسته است)؛ به value/onChange عمداً
    // وابسته نیست تا رفرنس این آرایه هرگز به‌خاطر تایپ‌کردن عوض نشود.
  }, [slug]);

  useEffect(() => {
    debouncedOnChange.current = debounce((val: string) => {
      lastEmittedRef.current = val;
      onChange(val);
    }, 300);
  }, [onChange]);

  const onValueChange = useCallback((val: string) => {
    debouncedOnChange.current(val);
  }, []);

  const editor = useEditor({
    // این مقدار فقط برای ساخت اولیهٔ سند استفاده می‌شود؛ بعد از این هرگز
    // دستی به این option برنمی‌گردیم (برخلاف قبل که content یک state بود
    // و هر تغییرش دوباره به اینجا فید می‌شد و باعث ریست شدن انتخاب/سند می‌شد)
    content: value || '',
    extensions,
    immediatelyRender: false,
    // جهت راست‌به‌چپ باید روی خودِ DOM ادیتور هم ست بشه، نه فقط روی محتوای تولیدشده.
    editorProps: {
      attributes: {
        dir: 'rtl',
        class: 'text-right',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);

      // مقایسهٔ عکس‌های فعلی با عکس‌های قبلی و حذف خودکار عکس‌های حذف‌شده از استوریج
      const currentImages = getImagesFromEditor(editor);
      const removedImages = prevImagesRef.current.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => deleteImageRequest(img));
      prevImagesRef.current = currentImages;
    },
  });

  // اگر value واقعاً از بیرون تغییر کند (مثلاً بعد از fetch شدن دیتای اولیه
  // با تأخیر، یا سوییچ بین دو مقالهٔ مختلف)، فقط در آن صورت محتوای ادیتور
  // را sync کن. اگر این تغییر، خودِ اکوی onChange قبلیِ خودمان باشد،
  // هیچ کاری نکن — وگرنه هر بار وسط تایپ‌کردن دوباره چرخهٔ ریست‌شدن
  // برمی‌گردد. این افکت یک "سیستم خارجی" (خود instance ادیتور) را
  // sync می‌کند، نه یک React state، پس با قوانین Effect هم مغایرتی ندارد.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    if (value === editor.getHTML()) return;

    editor.commands.setContent(value || '', {
      emitUpdate: false,
    });
    lastEmittedRef.current = value || '';
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4" dir="rtl">
      <RichTextProvider editor={editor}>
        <div
          className="
            overflow-hidden
            rounded-xl
            bg-white dark:bg-zinc-900
            border border-gray-200 dark:border-zinc-700
            shadow-md hover:shadow-lg
            transition-shadow duration-300 ease-in-out
          "
        >
          <div className="flex flex-col">
            {/* Toolbar */}
            <div
              className="
                flex items-center flex-wrap gap-2
                border-b border-gray-200 dark:border-zinc-700
                bg-gray-50 dark:bg-zinc-800
                px-3 py-2
                sticky top-0 z-10
              "
            >
              <RichTextToolbar />
            </div>

            {/* Editor */}
            <EditorContent
              editor={editor}
              dir="rtl"
              className="
                prose dark:prose-invert
                max-w-none
                px-4 py-6
                text-gray-900 dark:text-gray-100
                leading-relaxed
                text-right
                focus:outline-none
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
              "
            />

            {/* Bubble & Slash menus */}
            <div className="relative">
              <RichTextBubbleLink />
              <RichTextBubbleImage />
              <RichTextBubbleVideo />
              <RichTextBubbleImageGif />
              <RichTextBubbleText />
              <RichTextBubbleCallout />
              <SlashCommandList />
              <RichTextBubbleMenuDragHandle />
            </div>
          </div>
        </div>
      </RichTextProvider>
    </div>
  );
}
