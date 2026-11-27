import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal } from 'lucide-react';
import Prism from 'prismjs';

// Common Prism grammars
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-markup';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  filename,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const cleanCode = (code || '').trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normLang = (language || 'text').toLowerCase();
  const grammar = Prism.languages[normLang] || Prism.languages.javascript || Prism.languages.clike;
  const highlighted = grammar ? Prism.highlight(cleanCode, grammar, normLang) : cleanCode;

  const lines = cleanCode.split('\n');

  return (
    <div className="my-4 rounded-md border border-[#d0d7de] dark:border-[#30363d] overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117] text-[#1f2328] dark:text-[#e6edf3] font-mono text-[13px] shadow-sm">
      {/* Top Bar (GitHub style) */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] select-none text-xs text-[#57606a] dark:text-[#8b949e]">
        <div className="flex items-center gap-2">
          {normLang === 'bash' || normLang === 'sh' ? (
            <Terminal className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
          )}
          <span className="font-semibold text-[#24292f] dark:text-[#c9d1d9]">
            {filename || normLang}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#57606a] dark:text-[#8b949e]">
            {lines.length} lines
          </span>
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d] hover:bg-white dark:hover:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#f0f6fc]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#2ea043]" />
              <span className="text-[#1a7f37] dark:text-[#2ea043]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="relative overflow-x-auto p-3 text-[13px] leading-relaxed bg-white dark:bg-[#0d1117]">
        {showLineNumbers ? (
          <div className="flex font-mono">
            {/* Line numbers column */}
            <div className="select-none pr-4 text-right text-[#8c959f] dark:text-[#6e7681] text-[12px] opacity-75 border-r border-[#d0d7de] dark:border-[#21262d] mr-4">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre className="flex-1 m-0 p-0 overflow-x-auto font-mono text-[#24292f] dark:text-[#e6edf3]">
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </div>
        ) : (
          <pre className="m-0 p-0 overflow-x-auto font-mono text-[#24292f] dark:text-[#e6edf3]">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        )}
      </div>
    </div>
  );
};
