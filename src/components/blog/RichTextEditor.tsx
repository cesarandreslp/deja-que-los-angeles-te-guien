'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Code2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Crear instancia de lowlight
const lowlight = createLowlight(common)

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Escribe el contenido de tu artículo...',
  className = ''
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 hover:text-purple-700 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  }, [content, onChange, placeholder])

  const addImage = useCallback(() => {
    const url = window.prompt('URL de la imagen:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Negrita (Ctrl+B)"
            type="button"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Cursiva (Ctrl+I)"
            type="button"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Tachado"
            type="button"
          >
            <Strikethrough size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Código inline"
            type="button"
          >
            <Code size={18} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Título 1"
            type="button"
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Título 2"
            type="button"
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Título 3"
            type="button"
          >
            <Heading3 size={18} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Lista con viñetas"
            type="button"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Lista numerada"
            type="button"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        {/* Block Elements */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Cita"
            type="button"
          >
            <Quote size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Bloque de código"
            type="button"
          >
            <Code2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Línea horizontal"
            type="button"
          >
            <Minus size={18} />
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : ''
            }`}
            title="Insertar enlace"
            type="button"
          >
            <Link2 size={18} />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Insertar imagen"
            type="button"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Deshacer (Ctrl+Z)"
            type="button"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rehacer (Ctrl+Y)"
            type="button"
          >
            <Redo size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
