import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, Info, Flame, ShieldAlert } from 'lucide-react';
import type { Article, ArticleMeta } from '../types/doc';
import { CodeBlock } from './CodeBlock';
import { ApiPlayground } from './ApiPlayground';

interface DocContentProps {
  article: Article;
  projectSlug: string;
  prevArticle?: ArticleMeta | null;
  nextArticle?: ArticleMeta | null;
  onNavigate: (slug: string) => void;
}

export const DocContent: React.FC<DocContentProps> = ({
  article,
  projectSlug,
  prevArticle,
  nextArticle,
  onNavigate,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  // Helper to extract id from heading text
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 lg:px-10">
      {/* Article Title & Metadata Header */}
      <div className="mb-6 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-2">
          {article.type === 'api' ? (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase bg-[#ddf4ff] text-[#0969da] border border-[#54aeff] dark:bg-[#1f6feb]/20 dark:text-[#58a6ff] dark:border-[#1f6feb]">
              API Reference
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase bg-[#f6f8fa] text-[#57606a] border border-[#d0d7de] dark:bg-[#161b22] dark:text-[#8b949e] dark:border-[#30363d]">
              Technical Guide
            </span>
          )}
          <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
            Updated {new Date(article.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
          {article.title}
        </h1>

        {article.description && (
          <p className="mt-2 text-base text-[#57606a] dark:text-[#8b949e] leading-relaxed">
            {article.description}
          </p>
        )}
      </div>

      {/* Markdown Body */}
      <div className="markdown-body text-[#1f2328] dark:text-[#e6edf3]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1({ children }) {
              const text = String(children);
              const id = slugify(text);
              return <h1 id={id}>{children}</h1>;
            },
            h2({ children }) {
              const text = String(children);
              const id = slugify(text);
              return (
                <h2 id={id} className="group flex items-center gap-2">
                  <span>{children}</span>
                  <a
                    href={`#${id}`}
                    aria-label={`Link to ${text}`}
                    className="opacity-0 group-hover:opacity-100 text-[#0969da] dark:text-[#2f81f7] text-sm"
                  >
                    #
                  </a>
                </h2>
              );
            },
            h3({ children }) {
              const text = String(children);
              const id = slugify(text);
              return (
                <h3 id={id} className="group flex items-center gap-2">
                  <span>{children}</span>
                  <a
                    href={`#${id}`}
                    aria-label={`Link to ${text}`}
                    className="opacity-0 group-hover:opacity-100 text-[#0969da] dark:text-[#2f81f7] text-sm"
                  >
                    #
                  </a>
                </h3>
              );
            },
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !String(children).includes('\n');

              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 text-xs font-mono rounded bg-[rgba(175,184,193,0.2)] dark:bg-[rgba(110,118,129,0.2)] text-[#1f2328] dark:text-[#f0f6fc]">
                    {children}
                  </code>
                );
              }

              const language = match ? match[1] : 'text';
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                />
              );
            },
            blockquote({ children }) {
              // Check if blockquote is a GitHub Alert
              const text = React.Children.toArray(children)
                .map((child: any) => (child?.props?.children ? String(child.props.children) : ''))
                .join('');

              let alertType: 'note' | 'tip' | 'important' | 'warning' | 'caution' | null = null;
              if (text.includes('[!NOTE]')) alertType = 'note';
              else if (text.includes('[!TIP]')) alertType = 'tip';
              else if (text.includes('[!IMPORTANT]')) alertType = 'important';
              else if (text.includes('[!WARNING]')) alertType = 'warning';
              else if (text.includes('[!CAUTION]')) alertType = 'caution';

              if (alertType) {
                const getAlertIcon = () => {
                  switch (alertType) {
                    case 'note':
                      return <Info className="w-4 h-4 text-[#0969da] dark:text-[#2f81f7]" />;
                    case 'tip':
                      return <Flame className="w-4 h-4 text-[#1a7f37] dark:text-[#2ea043]" />;
                    case 'important':
                      return <AlertCircle className="w-4 h-4 text-[#8250df] dark:text-[#a371f7]" />;
                    case 'warning':
                      return <AlertCircle className="w-4 h-4 text-[#9a6700] dark:text-[#d29922]" />;
                    case 'caution':
                      return <ShieldAlert className="w-4 h-4 text-[#cf222e] dark:text-[#f85149]" />;
                  }
                };

                const getAlertTitle = () => {
                  switch (alertType) {
                    case 'note': return 'Note';
                    case 'tip': return 'Tip';
                    case 'important': return 'Important';
                    case 'warning': return 'Warning';
                    case 'caution': return 'Caution';
                  }
                };

                return (
                  <div className={`my-4 p-3.5 rounded-md border text-sm leading-relaxed ${
                    alertType === 'note'
                      ? 'border-[#54aeff] bg-[#ddf4ff]/40 dark:border-[#1f6feb] dark:bg-[#1f6feb]/10'
                      : alertType === 'tip'
                      ? 'border-[#4ac26b] bg-[#dafbe1]/40 dark:border-[#238636] dark:bg-[#238636]/10'
                      : alertType === 'important'
                      ? 'border-[#d8b9ff] bg-[#fbefff]/40 dark:border-[#8957e5] dark:bg-[#8957e5]/10'
                      : alertType === 'warning'
                      ? 'border-[#d4a72c] bg-[#fff8c5]/40 dark:border-[#d29922] dark:bg-[#d29922]/10'
                      : 'border-[#ff8182] bg-[#ffebe9]/40 dark:border-[#da3633] dark:bg-[#da3633]/10'
                  }`}>
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1 uppercase tracking-wide">
                      {getAlertIcon()}
                      <span>{getAlertTitle()}</span>
                    </div>
                    <div className="text-xs leading-normal opacity-95">
                      {children}
                    </div>
                  </div>
                );
              }

              return <blockquote>{children}</blockquote>;
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Interactive API Playground if this article is an API endpoint */}
      {article.endpoint && (
        <ApiPlayground endpoint={article.endpoint} projectSlug={projectSlug} />
      )}

      {/* Bottom Feedback Widget */}
      <div className="mt-12 pt-6 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-4 text-xs text-[#57606a] dark:text-[#8b949e]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#1f2328] dark:text-[#f0f6fc]">
            Was this documentation helpful?
          </span>
          {feedbackGiven ? (
            <span className="flex items-center gap-1 text-[#1a7f37] dark:text-[#2ea043] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Thank you for your feedback!
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFeedbackGiven('yes')}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] transition-colors"
              >
                <ThumbsUp className="w-3 h-3" /> Yes
              </button>
              <button
                onClick={() => setFeedbackGiven('no')}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] transition-colors"
              >
                <ThumbsDown className="w-3 h-3" /> No
              </button>
            </div>
          )}
        </div>

        <div>
          <span>Found a typo or issue? Open a pull request.</span>
        </div>
      </div>

      {/* Pagination Navigation (Previous / Next Article) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevArticle ? (
          <button
            onClick={() => onNavigate(prevArticle.slug)}
            className="flex flex-col items-start p-3.5 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0969da] dark:hover:border-[#2f81f7] text-left transition-colors group"
          >
            <span className="flex items-center gap-1 text-[11px] text-[#57606a] dark:text-[#8b949e] mb-1">
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </span>
            <span className="font-semibold text-xs text-[#0969da] dark:text-[#58a6ff]">
              {prevArticle.title}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextArticle ? (
          <button
            onClick={() => onNavigate(nextArticle.slug)}
            className="flex flex-col items-end p-3.5 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0969da] dark:hover:border-[#2f81f7] text-right transition-colors group"
          >
            <span className="flex items-center gap-1 text-[11px] text-[#57606a] dark:text-[#8b949e] mb-1">
              Next
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="font-semibold text-xs text-[#0969da] dark:text-[#58a6ff]">
              {nextArticle.title}
            </span>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
