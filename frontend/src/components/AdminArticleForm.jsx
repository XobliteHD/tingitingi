import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './AdminArticleForm.css';

const slugify = (text) => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="tiptap-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>H3</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>List</button>
    </div>
  );
};

export default function AdminArticleForm({ onSubmit, initialData = null, isLoading = false }) {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [summary, setSummary] = useState('');
    const [mainImage, setMainImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [isPublished, setIsPublished] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialData?.content || '',
    });

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setSlug(initialData.slug || '');
            setSummary(initialData.summary || '');
            setExistingImage(initialData.mainImage || null);
            setIsPublished(initialData.isPublished || false);
            if (editor && !editor.isDestroyed) {
                editor.commands.setContent(initialData.content || '');
            }
        }
    }, [initialData, editor]);
    
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!slug || slug === slugify(title)) {
            setSlug(slugify(newTitle));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!editor) return;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('summary', summary);
        formData.append('content', editor.getHTML());
        formData.append('isPublished', isPublished);
        if (mainImage) {
            formData.append('mainImage', mainImage);
        }
        onSubmit(formData);
    };
    
    return (
        <form onSubmit={handleFormSubmit}>
            <div className="field">
                <label className="label">Title</label>
                <div className="control"><input className="input" type="text" value={title} onChange={handleTitleChange} required /></div>
            </div>
            <div className="field">
                <label className="label">URL Slug</label>
                <div className="control"><input className="input" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required /></div>
                <p className="help">URL-friendly identifier (e.g., my-first-post)</p>
            </div>
            <div className="field">
                <label className="label">Summary</label>
                <div className="control"><textarea className="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} required></textarea></div>
            </div>
            <div className="field">
                <label className="label">Main Image</label>
                {existingImage && <img src={existingImage} alt="Current" style={{ maxHeight: '150px', marginBottom: '1rem' }} />}
                <div className="control"><input className="input" type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} /></div>
            </div>

            <div className="field">
                <label className="label">Content</label>
                <div className="tiptap-container">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                </div>
            </div>

            <div className="field">
                <label className="checkbox"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />{' '} Publish Article</label>
            </div>

            <div className="field">
                <button type="submit" className={`button is-primary ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                    {initialData ? 'Update Article' : 'Create Article'}
                </button>
            </div>
        </form>
    );
}