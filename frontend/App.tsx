import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NewsCard } from './components/NewsCard';
import { AIModal } from './components/AIModal';
import { ArticleDetail } from './components/ArticleDetail';
import { MOCK_NEWS } from './articles';
import { Category, NewsArticle } from './types';
import { Search, Filter, Github, Globe, Zap } from 'lucide-react';
import { summarizeArticle } from './services/geminiService';

// Get article slug (pre-generated in constants.ts via GitHub Actions)
const getSlug = (article: NewsArticle): string => {
  return article.slug || article.id;
};

// Find article by slug
const findArticleBySlug = (slug: string): NewsArticle | undefined => {
  return MOCK_NEWS.find(a => a.slug === slug || a.id === slug);
};

// Article Detail Page Component
const ArticlePage: React.FC<{
  onSummarize: (article: NewsArticle) => void;
}> = ({ onSummarize }) => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const navigate = useNavigate();

  const article = articleSlug ? findArticleBySlug(articleSlug) : undefined;

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-2xl font-black uppercase">Article Not Found</p>
        <Link to="/" className="mt-4 px-6 py-3 bg-yellow-400 border-2 border-black font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <ArticleDetail
      article={article}
      onBack={() => navigate('/')}
      onSummarize={onSummarize}
    />
  );
};

// Home Page Component
const HomePage: React.FC<{
  onSummarize: (article: NewsArticle) => void;
}> = ({ onSummarize }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(article => {
      const matchesCategory = activeCategory === Category.ALL || article.category === activeCategory;
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleReadMore = (article: NewsArticle) => {
    navigate(`/article/${getSlug(article)}`);
  };

  const categories = Object.values(Category);

  return (
    <>
      {/* Hero / Filter Section */}
      <section className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black mb-4 font-display uppercase leading-none">
              Latest<br />Updates
            </h2>
            <p className="text-xl font-medium text-gray-600 max-w-2xl border-l-4 border-black pl-4">
              Curated AI news, summaries, and breakthroughs. Powered by Gemini.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 h-12 px-4 bg-white border-2 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
            <button className="absolute right-0 top-0 h-12 w-12 bg-black text-white flex items-center justify-center border-2 border-black">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 pb-4 border-b-2 border-black/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-4 py-2 border-2 border-black text-sm font-bold uppercase transition-all
                ${activeCategory === cat
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_#facc15]'
                  : 'bg-white text-black hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* News Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 animate-in fade-in zoom-in-95 duration-500 delay-100">
          {filteredNews.map(article => (
            <NewsCard
              key={article.id}
              article={article}
              onSummarize={onSummarize}
              onReadMore={handleReadMore}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-black bg-gray-50 rounded-lg">
          <Filter size={48} className="mb-4 opacity-50" />
          <p className="text-2xl font-black uppercase">No Results Found</p>
          <p className="font-medium text-gray-600">Try adjusting your filters.</p>
        </div>
      )}
    </>
  );
};

// Main App Layout with Router
const AppContent: React.FC = () => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('');

  const handleSummarize = async (article: NewsArticle) => {
    setSummaryTitle(article.title);
    setSummaryContent('');
    setIsModalOpen(true);
    setIsSummarizing(true);

    const summary = await summarizeArticle(article.content);

    setSummaryContent(summary);
    setIsSummarizing(false);
  };

  return (
    <Layout>
      {/* Navbar */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl border-2 border-black transform -rotate-3 group-hover:rotate-0 transition-transform">
              AI
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block group-hover:tracking-normal transition-all">
              Nexus<span className="text-yellow-500">News</span>
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-4">
              <a
                href="https://github.com/CaoCharles/ai-nexus"
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
                className="p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all hover:bg-yellow-400"
              >
                <Github size={20} />
              </a>
              <a
                href="https://caocharles.github.io/ai-nexus/"
                target="_blank"
                rel="noopener noreferrer"
                title="Visit Live Website"
                className="p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all hover:bg-yellow-400"
              >
                <Globe size={20} />
              </a>
            </div>
            <div className="flex items-center px-4 py-2 bg-yellow-400 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Total: {MOCK_NEWS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Routes>
          <Route path="/" element={<HomePage onSummarize={handleSummarize} />} />
          <Route path="/article/:articleSlug" element={<ArticlePage onSummarize={handleSummarize} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 font-black text-2xl">
            <Zap className="text-yellow-400 fill-current" />
            AI NEXUS
          </div>
          <p className="font-mono text-gray-400">&copy; {new Date().getFullYear()} Brutalist Design Edition.</p>
        </div>
      </footer>

      <AIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isSummarizing}
        content={summaryContent}
        title={summaryTitle}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;