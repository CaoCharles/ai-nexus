import React from 'react';
import { NewsArticle } from '../types';
import { ArrowLeft, Calendar, User, Sparkles, Clock, Share2, Tag } from 'lucide-react';

interface ArticleDetailProps {
  article: NewsArticle;
  onBack: () => void;
  onSummarize: (article: NewsArticle) => void;
}

/**
 * Simple markdown to HTML converter
 */
const parseMarkdown = (markdown: string): string => {
  return markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-black font-display text-black mt-6 mb-3 border-l-4 border-yellow-400 pl-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black font-display text-black mt-8 mb-4 border-l-4 border-yellow-400 pl-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black font-display text-black mt-10 mb-5">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
    .replace(/__(.+?)__/g, '<strong class="font-bold text-black">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-2">• $1</li>')
    .replace(/^\d+\) (.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
    // Line breaks for paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Single line breaks
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>');
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onSummarize }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      
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
        
        {/* Hero Image Section */}
        <div className="relative h-[400px] w-full border-b-4 border-black bg-gray-200">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
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
            <div className="prose prose-xl max-w-none text-gray-800 leading-relaxed">
              <p className="text-2xl font-bold leading-relaxed mb-8 text-black first-letter:text-6xl first-letter:font-black first-letter:mr-2 first-letter:float-left">
                {article.summary}
              </p>
              <div 
                className="space-y-2 text-lg text-gray-700 markdown-content"
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