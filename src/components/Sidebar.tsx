import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, GitBranch, Plus } from 'lucide-react';
import type { Project, HttpMethod } from '../types/doc';

interface SidebarProps {
  project: Project;
  currentArticleSlug: string;
  onSelectArticle: (slug: string) => void;
  onOpenStudio?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  currentArticleSlug,
  onSelectArticle,
  onOpenStudio,
}) => {
  // Collapsed sections tracking
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [filterText, setFilterText] = useState('');

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getMethodBadgeClass = (m?: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#238636]/20';
      case 'POST':
        return 'text-[#0969da] dark:text-[#58a6ff] bg-[#ddf4ff] dark:bg-[#1f6feb]/20';
      case 'PUT':
      case 'PATCH':
        return 'text-[#9a6700] dark:text-[#e3b341] bg-[#fff8c5] dark:bg-[#d29922]/20';
      case 'DELETE':
        return 'text-[#cf222e] dark:text-[#f85149] bg-[#ffebe9] dark:bg-[#da3633]/20';
      default:
        return 'text-[#57606a] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#21262d]';
    }
  };

  return (
    <aside className="w-72 shrink-0 border-r border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#010409] flex flex-col h-[calc(100vh-56px)] select-none">
      {/* Branch & Version Header */}
      <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] font-mono">
            <GitBranch className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
            <span className="font-semibold">{project.branch || 'main'}</span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#161b22]">
            {project.version}
          </span>
        </div>

        {/* Tree Quick Filter */}
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter documents..."
          className="w-full px-2.5 py-1 text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7]"
        />
      </div>

      {/* Hierarchical Document Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {project.sections.map((section) => {
          const isCollapsed = !!collapsedSections[section.id];
          const filteredArticles = section.articles.filter((art) =>
            art.title.toLowerCase().includes(filterText.toLowerCase()) ||
            (art.path && art.path.toLowerCase().includes(filterText.toLowerCase()))
          );

          if (filterText && filteredArticles.length === 0) return null;

          return (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#eaeef2] dark:hover:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] font-semibold text-[11px] uppercase tracking-wider transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
                  )}
                  <span>{section.title}</span>
                </div>
                <span className="text-[10px] font-mono px-1 rounded bg-[#afb8c1]/20 dark:bg-[#8b949e]/20">
                  {section.articles.length}
                </span>
              </button>

              {/* Articles List */}
              {!isCollapsed && (
                <div className="mt-1 ml-2.5 pl-2.5 border-l border-[#d0d7de] dark:border-[#21262d] space-y-0.5">
                  {filteredArticles.map((art) => {
                    const isActive = art.slug === currentArticleSlug;

                    return (
                      <button
                        key={art.id}
                        onClick={() => onSelectArticle(art.slug)}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors font-medium ${
                          isActive
                            ? 'bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff] font-semibold'
                            : 'text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#eaeef2] dark:hover:bg-[#161b22]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {art.type === 'api' ? (
                            <span
                              className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded uppercase ${getMethodBadgeClass(
                                art.method
                              )}`}
                            >
                              {art.method || 'API'}
                            </span>
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e] shrink-0" />
                          )}
                          <span className="truncate">{art.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer with Studio quick action */}
      {onOpenStudio && (
        <div className="p-3 border-t border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
          <button
            onClick={onOpenStudio}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage in Studio</span>
          </button>
        </div>
      )}
    </aside>
  );
};
