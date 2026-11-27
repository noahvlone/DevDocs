import React, { useState, useEffect } from 'react';
import { AlignLeft, Edit3, Copy, Check, GitCommit } from 'lucide-react';
import type { Article } from '../types/doc';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  article: Article;
  commitSha: string;
  onEditInStudio?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  article,
  commitSha,
  onEditInStudio,
}) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [copiedMd, setCopiedMd] = useState(false);

  useEffect(() => {
    // Parse markdown headings
    const lines = (article.content || '').split('\n');
    const items: TOCItem[] = [];

    lines.forEach((line) => {
      const match = /^(#{2,3})\s+(.*)$/.exec(line);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        items.push({ id, text, level });
      }
    });

    setHeadings(items);
  }, [article]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(article.content);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden xl:block p-6 text-xs select-none">
      <div className="sticky top-20 space-y-6">
        {/* On this page links */}
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-3">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>On This Page</span>
          </div>

          {headings.length > 0 ? (
            <nav className="space-y-1.5 border-l border-[#d0d7de] dark:border-[#30363d] pl-3">
              {headings.map((h) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className={`block text-left truncate w-full transition-colors ${
                    h.level === 3 ? 'pl-3 text-[11px]' : 'text-xs'
                  } ${
                    activeId === h.id
                      ? 'text-[#0969da] dark:text-[#58a6ff] font-semibold'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          ) : (
            <p className="text-[#8c959f] dark:text-[#6e7681] italic">
              Overview document
            </p>
          )}
        </div>

        {/* Quick Utilities & Metadata */}
        <div className="pt-4 border-t border-[#d0d7de] dark:border-[#30363d] space-y-2.5">
          <div className="font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider text-[11px]">
            Page Metadata
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#57606a] dark:text-[#8b949e]">
            <GitCommit className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
            <span>Commit: </span>
            <code className="px-1.5 py-0.2 rounded bg-[#afb8c1]/20 dark:bg-[#8b949e]/20 text-[#1f2328] dark:text-[#f0f6fc]">
              {commitSha || 'latest'}
            </code>
          </div>

          {onEditInStudio && (
            <button
              onClick={onEditInStudio}
              className="flex items-center gap-2 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit this page in Studio</span>
            </button>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 text-xs text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                <span className="text-[#1a7f37] dark:text-[#3fb950]">Markdown Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy raw markdown</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
