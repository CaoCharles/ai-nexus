import React from 'react';
import { NewsArticle } from '../types';
import { Sparkles, ExternalLink } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  onSummarize: (article: NewsArticle) => void;
  onReadMore: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSummarize, onReadMore }) => {
  return (
    <article className="group relative flex flex-col bg-white border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all duration-200 cursor-pointer" onClick={() => onReadMore(article)}>
      
      {/* Header / Meta */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black bg-gray-50 rounded-t-lg">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          @{article.author.split(' ')[0].toUpperCase()}
        </span>
        <span className="text-xs font-medium text-gray-500">{article.date}</span>
      </div>

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden border-b-2 border-black bg-gray-200 group-hover:bg-yellow-100 transition-colors">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-all duration-300"
        />
        <div className="absolute bottom-0 left-0 bg-yellow-400 border-t-2 border-r-2 border-black px-3 py-1">
           <span className="text-xs font-black uppercase">{article.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        <h3 className="text-xl font-black text-black mb-3 leading-tight font-display group-hover:underline decoration-4 decoration-yellow-400 underline-offset-4">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed font-medium">
          {article.summary}
        </p>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          {/* AI Button (Secondary) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSummarize(article);
            }}
            className="flex items-center justify-center gap-2 text-sm font-bold text-black bg-white border-2 border-black py-2.5 rounded hover:bg-gray-100 transition-colors"
          >
            <Sparkles size={16} />
            <span>AI Summary</span>
          </button>

          {/* Read Direct Button (Primary) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(article);
            }}
            className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-black border-2 border-black py-2.5 rounded shadow-[2px_2px_0px_0px_#facc15] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:text-yellow-400 transition-all"
          >
            <ExternalLink size={16} />
            <span>Read Directly</span>
          </button>
        </div>
      </div>
    </article>
  );
};