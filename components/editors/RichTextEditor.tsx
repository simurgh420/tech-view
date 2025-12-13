'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';

type Props = {
  value: string;
  onChange: (val: string) => void;
};

function RichTextEditor({ value, onChange }: Props) {
  // فقط روی کلاینت اجازه ساختن ادیتور بده
  const isClient = typeof window !== 'undefined';

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), TextStyle],
    content: value,
    immediatelyRender: false, // جلوگیری از hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  if (!isClient || !editor) return null;
  const setLink = () => {
    const url = window.prompt('آدرس لینک را وارد کنید:', 'https://example.com');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded p-2 min-h-[200px]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-300 px-2' : 'px-2'}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-300 px-2' : 'px-2'}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-300 px-2' : 'px-2'}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 px-2' : 'px-2'}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-300 px-2' : 'px-2'}
        >
          List
        </button>

        {/* رنگ متن */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#ef4444').run()}
          className="px-2 text-red-500"
        >
          Red
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
          className="px-2 text-blue-500"
        >
          Blue
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="px-2"
        >
          Clear
        </button>

        {/* لینک */}
        <button type="button" onClick={setLink} className="px-2">
          Link
        </button>
        <button onClick={() => editor.chain().focus().unsetLink().run()} className="px-2">
          Unlink
        </button>

        {/* Undo/Redo */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="px-2">
          Undo
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="px-2">
          Redo
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="tiptap min-h-[200px] p-4 outline-none whitespace-pre-wrap wrap-break"
      />
    </div>
  );
}

export default RichTextEditor;
