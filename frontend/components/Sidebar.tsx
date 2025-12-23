import React from 'react';
import { Category } from '../types';
import { 
  LayoutGrid, 
  Sparkles,
  Zap,
  MessageSquare,
  Search,
  Code,
  Globe,
  BarChart
} from 'lucide-react';

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { category: Category.ALL, label: 'All', icon: <LayoutGrid size={20} /> },
  { category: Category.GEMINI, label: 'Gemini', icon: <Sparkles size={20} /> },
  { category: Category.GPT, label: 'GPT', icon: <Zap size={20} /> },
  { category: Category.CLAUDE, label: 'Claude', icon: <MessageSquare size={20} /> },
  { category: Category.GROK, label: 'Grok', icon: <Search size={20} /> },
  { category: Category.QWEN, label: 'Qwen', icon: <Code size={20} /> },
  { category: Category.MISTRAL, label: 'Mistral', icon: <Globe size={20} /> },
  { category: Category.EVALUATION, label: 'Evaluation', icon: <BarChart size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-bg border-r border-dark-border transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-dark-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Nexus</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.category}
              onClick={() => {
                onSelectCategory(item.category);
                onCloseMobile();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${activeCategory === item.category 
                  ? 'bg-primary-600/10 text-primary-500 shadow-sm shadow-primary-900/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}
              `}
            >
              <span className={`transition-colors ${activeCategory === item.category ? 'text-primary-500' : 'group-hover:text-primary-400'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {activeCategory === item.category && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};