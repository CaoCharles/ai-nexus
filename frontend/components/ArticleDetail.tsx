import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { ArrowLeft, Calendar, User, Sparkles, Clock, Share2, Tag, X, ZoomIn } from 'lucide-react';

interface ArticleDetailProps {
  article: NewsArticle;
  onBack: () => void;
  onSummarize: (article: NewsArticle) => void;
}

// Image Lightbox Component
const ImageLightbox: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {/* Click anywhere hint */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        點擊任意處關閉
      </p>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

/**
 * Simple markdown to HTML converter
 */
const parseMarkdown = (markdown: string): string => {
  return markdown
    // Links [text](url) - do this first before escaping
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 break-words">$1</a>')
    // Escape HTML (but not already processed links)
    .replace(/&(?!amp;|lt;|gt;)/g, '&amp;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-black font-display text-black mt-8 mb-4 border-l-4 border-yellow-400 pl-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black font-display text-black mt-10 mb-5 border-l-4 border-yellow-400 pl-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black font-display text-black mt-12 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
    .replace(/__(.+?)__/g, '<strong class="font-bold text-black">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 list-disc list-outside marker:text-yellow-500">$1</li>')
    // Numbered lists
    .replace(/^\d+\) (.+)$/gm, '<li class="ml-6 mb-2 list-decimal list-outside marker:font-bold">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-t-2 border-gray-300" />')
    // Line breaks for paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-6 leading-loose text-lg text-gray-800">')
    // Single line breaks
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph
    .replace(/^/, '<p class="mb-6 leading-loose text-lg text-gray-800">')
    .replace(/$/, '</p>');
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onSummarize }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* Image Lightbox */}
      <ImageLightbox
        src={article.imageUrl}
        alt={article.title}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Navigation Bar */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO NEWS
        </button>
      </div>

      <article className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* Hero Image Section - Clickable */}
        <div
          className="relative h-[400px] w-full border-b-4 border-black bg-gray-200 cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
          />
          {/* Zoom indicator on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 font-bold border-2 border-black shadow-lg">
              <ZoomIn size={20} />
              點擊查看大圖
            </div>
          </div>
          <div className="absolute bottom-0 left-0 bg-yellow-400 border-t-4 border-r-4 border-black px-6 py-3">
            <span className="text-xl font-black uppercase tracking-widest">{article.category}</span>
          </div>
        </div>

        {/* Article Header */}
        <div className="p-6 md:p-12 border-b-2 border-black/10">
          <div className="flex flex-wrap gap-4 items-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              {article.date}
            </div>
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="flex items-center gap-2 text-black">
              <User size={18} />
              {article.author}
            </div>
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="flex items-center gap-2">
              <Clock size={18} />
              5 MIN READ
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight font-display mb-8">
            {article.title}
          </h1>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onSummarize(article)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors"
            >
              <Sparkles size={18} />
              GENERATE AI SUMMARY
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 transition-colors">
              <Share2 size={18} />
              SHARE
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Text */}
          <div className="lg:col-span-8">
            <div className="prose prose-xl max-w-none text-gray-800">
              <p className="text-2xl font-bold leading-relaxed mb-10 text-black border-l-4 border-black pl-6">
                {article.summary}
              </p>
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content) }}
              />
            </div>
          </div>

          {/* Sidebar / Tags */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-50 border-2 border-black p-6 rounded-lg">
              <h3 className="font-black text-xl mb-4 uppercase flex items-center gap-2">
                <Tag size={20} />
                Related Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white border border-black text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer transition-all">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-yellow-400 border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-xl mb-2 uppercase">Subscribe</h3>
              <p className="font-medium text-sm mb-4">Get the latest AI news directly to your inbox. No spam, strictly brutal.</p>
              <input type="email" placeholder="Email address" className="w-full p-2 border-2 border-black mb-2 font-bold" />
              <button className="w-full bg-black text-white py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors">
                SIGN UP
              </button>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
};