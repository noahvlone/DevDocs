import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, CornerDownLeft, Loader2 } from 'lucide-react';
import type { SearchResultItem, HttpMethod } from '../types/doc';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (projectSlug: string, articleSlug: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResultItem[] = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onSelectResult(item.projectSlug, item.articleSlug);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const getMethodBadgeClass = (m?: HttpMethod) => {
    switch (m) {
      case 'GET': return 'bg-[#dafbe1] text-[#1a7f37] dark:bg-[#238636]/20 dark:text-[#3fb950]';
      case 'POST': return 'bg-[#ddf4ff] text-[#0969da] dark:bg-[#1f6feb]/20 dark:text-[#58a6ff]';
      case 'PUT':
      case 'PATCH': return 'bg-[#fff8c5] text-[#9a6700] dark:bg-[#d29922]/20 dark:text-[#e3b341]';
      case 'DELETE': return 'bg-[#ffebe9] text-[#cf222e] dark:bg-[#da3633]/20 dark:text-[#f85149]';
      default: return 'bg-[#f6f8fa] text-[#57606a] dark:bg-[#21262d] dark:text-[#8b949e]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] gap-3">
          <Search className="w-4 h-4 text-[#57606a] dark:text-[#8b949e]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, guides, or API endpoints..."
            className="flex-1 bg-transparent border-none text-sm text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#8c959f] dark:placeholder-[#6e7681] focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-[#0969da] dark:text-[#2f81f7] animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 rounded text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#57606a] dark:text-[#8b949e]">
              Type a keyword (e.g. <span className="font-mono text-[#0969da] dark:text-[#58a6ff]">"charge"</span>, <span className="font-mono text-[#0969da] dark:text-[#58a6ff]">"auth"</span>, <span className="font-mono text-[#0969da] dark:text-[#58a6ff]">"chat"</span>) to search across all program documentations.
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="py-8 text-center text-xs text-[#57606a] dark:text-[#8b949e]">
              No documents matched <strong className="text-[#1f2328] dark:text-[#f0f6fc]">"{query}"</strong>.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={`${item.projectId}-${item.articleId}`}
                  onClick={() => {
                    onSelectResult(item.projectSlug, item.articleSlug);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff]'
                      : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc]'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.type === 'api' ? (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${getMethodBadgeClass(
                          item.method
                        )}`}
                      >
                        {item.method || 'API'}
                      </span>
                    ) : (
                      <FileText className="w-4 h-4 text-[#57606a] dark:text-[#8b949e]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs mb-0.5">
                      <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                        {item.articleTitle}
                      </span>
                      <span className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
                        in {item.projectName} / {item.sectionTitle}
                      </span>
                    </div>

                    {item.path && (
                      <div className="font-mono text-[11px] text-[#57606a] dark:text-[#8b949e] mb-1">
                        {item.path}
                      </div>
                    )}

                    {item.snippet && (
                      <div className="text-xs text-[#57606a] dark:text-[#8b949e] line-clamp-1">
                        {item.snippet}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff] shrink-0 mt-1" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2 border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between text-[11px] text-[#57606a] dark:text-[#8b949e]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] font-mono">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] font-mono">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] font-mono">ESC</kbd> to close</span>
          </div>
          <div>DevDocs Global Search</div>
        </div>
      </div>
    </div>
  );
};
