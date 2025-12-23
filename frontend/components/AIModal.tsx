import React from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string;
  title: string;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, isLoading, content, title }) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-yellow-400/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-400" />
            <h3 className="font-bold font-display text-lg tracking-wide uppercase">AI Summary</h3>
          </div>
          <button 
            onClick={onClose}
            className="bg-white text-black p-1 hover:bg-red-500 hover:text-white transition-colors border-2 border-transparent hover:border-white"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 relative min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
               <div className="w-16 h-16 border-8 border-black border-t-yellow-400 rounded-full animate-spin"></div>
               <p className="text-black font-bold text-lg animate-pulse uppercase tracking-widest">Processing...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase mb-2">
                Source: {title}
              </div>
              <div className="prose prose-lg max-w-none text-black font-medium leading-relaxed border-l-4 border-yellow-400 pl-4 bg-gray-50 p-4">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="bg-gray-100 px-6 py-4 border-t-4 border-black flex justify-end gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-black bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-white bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-900 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};