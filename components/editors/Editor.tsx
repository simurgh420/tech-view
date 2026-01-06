import { useCallback, useEffect, useMemo, useState } from 'react';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
const deleteImageRequest = async (imageUrl: string) => {
  try {
    await axios.post('/api/images/delete', {
      imagePath: imageUrl,
    });
  } catch (err) {
    console.error('Error deleting image:', err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getImagesFromEditor = (editor: any): string[] => {
  const images: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'image' && node.attrs.src) {
      images.push(node.attrs.src);
    }
  });
  return images;
};

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
  const [content, setContent] = useState(value || '');
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
      placeholder: "Press '/' for commands",
    }),
  ];

  const extensions = [
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
    TextAlign,
    Indent,
    LineHeight,
    TaskList,
    Link,
    Image.configure({
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

    TextDirection,
    SlashCommand,
    Callout,
  ];

  const debouncedUpdate = useMemo(
    () =>
      debounce((val: string) => {
        setContent(val);
        onChange(val);
      }, 300),
    [onChange]
  );

  const onValueChange = useCallback(
    (val: string) => {
      debouncedUpdate(val);
    },
    [debouncedUpdate]
  );

  const editor = useEditor({
    textDirection: 'auto',
    content,
    extensions,

    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);
      const currentImages = getImagesFromEditor(editor);
      const removedImages = prevImages.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => deleteImageRequest(img));
      setPrevImages(currentImages);
    },
  });
  const [prevImages, setPrevImages] = useState<string[]>(() => {
    if (editor) return getImagesFromEditor(editor);
    return [];
  });
  useEffect(() => {
    if (editor) {
      setPrevImages(getImagesFromEditor(editor));
    }
  }, [editor]);
  if (!editor) return null;

  return (
    <>
      <div className="border-b border-border shadow-md">
        <div className="w-full max-w-300 p-4  mx-auto my-0"></div>
      </div>

      <div className="w-full max-w-3xl mx-auto my-6 px-4 dark">
        <RichTextProvider editor={editor}>
          <div className="overflow-hidden rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 shadow-lg">
            <div className="flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2">
                <RichTextToolbar />
              </div>

              {/* Editor */}
              <EditorContent
                editor={editor}
                className="prose dark:prose-invert max-w-none px-4 py-6 text-gray-900 dark:text-gray-100"
              />

              {/* Bubble & Slash */}
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
        </RichTextProvider>
      </div>
    </>
  );
}
