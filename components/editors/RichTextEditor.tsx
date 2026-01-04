'use client';
import '@/styles/tiptap.css';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import axios from 'axios';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  List,
  Minus,
  Quote,
  Redo,
  UnderlineIcon,
  Undo,
} from 'lucide-react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  slug: string;
};

export default function RichTextEditor({ value, onChange, slug }: Props) {
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `blogs/${slug}/editor`);
    formData.append('baseName', file.name);

    const res = await axios.post('/api/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.imageUrl as string;
  };

  const deleteImageRequest = async (imageUrl: string) => {
    try {
      await axios.post(`/api/images/delete`, {
        imagePath: imageUrl,
      });
    } catch (err) {
      console.error('Error deleting image from server:', err);
    }
  };

  const handleImageInsert = async (file: File, editor: Editor) => {
    const url = await uploadImage(file);
    editor.chain().focus().setImage({ src: url }).run();
  };

  const editor = useEditor({
    content: value,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({}),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Highlight,
      Placeholder.configure({
        placeholder: 'شروع به نوشتن کنید...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
      }).extend({
        addNodeView() {
          return ({ node, editor }) => {
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = node.attrs.src;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '4px';

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'image-delete-btn';
            deleteBtn.innerText = '×';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '4px';
            deleteBtn.style.right = '4px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.background = 'rgba(0,0,0,0.6)';
            deleteBtn.style.color = '#fff';
            deleteBtn.style.borderRadius = '999px';
            deleteBtn.style.width = '20px';
            deleteBtn.style.height = '20px';
            deleteBtn.style.display = 'flex';
            deleteBtn.style.alignItems = 'center';
            deleteBtn.style.justifyContent = 'center';
            deleteBtn.style.fontSize = '14px';

            deleteBtn.onclick = async () => {
              const imageUrl = node.attrs.src as string;
              editor.chain().focus().deleteNode('image').run();
              await deleteImageRequest(imageUrl);
            };

            container.appendChild(img);
            container.appendChild(deleteBtn);

            return { dom: container };
          };
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await handleImageInsert(file, editor);
    };

    input.click();
  };

  return (
    <div className="border rounded p-2">
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded border ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded border ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded border ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        >
          <UnderlineIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded border ${editor.isActive('highlight') ? 'bg-yellow-200' : ''}`}
        >
          <Highlighter size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded border ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading1 size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded border ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading2 size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded border ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        >
          <Heading3 size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded border ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <List size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded border ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          <Quote size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded border ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          <Code size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded border"
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded border ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded border ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded border ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignRight size={18} />
        </button>

        <button type="button" onClick={addImage} className="p-2 rounded border">
          <ImageIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded border"
        >
          <Undo size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded border"
        >
          <Redo size={18} />
        </button>
      </div>

      <EditorContent editor={editor} className="tiptap min-h-62.5 p-4" />
    </div>
  );
}
