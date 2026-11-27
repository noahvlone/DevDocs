import React, { useState } from 'react';
import { BookOpen, Star, GitFork, GitBranch, ArrowRight, Server, Plus, Code2, Search, Upload } from 'lucide-react';
import type { Project } from '../types/doc';

interface DashboardPageProps {
  projects: Project[];
  onSelectProject: (slug: string, articleSlug?: string) => void;
  onOpenStudio: () => void;
  onOpenImportModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  projects,
  onSelectProject,
  onOpenStudio,
  onOpenImportModal,
}) => {
  const [filter, setFilter] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.description.toLowerCase().includes(filter.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase()))
  );

  const totalArticles = projects.reduce(
    (sum, p) => sum + p.sections.reduce((sSum, sec) => sSum + sec.articles.length, 0),
    0
  );

  const totalApis = projects.reduce(
    (sum, p) =>
      sum +
      p.sections.reduce(
        (sSum, sec) => sSum + sec.articles.filter((a) => a.type === 'api').length,
        0
      ),
    0
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f8fa] dark:bg-[#010409] p-6 lg:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
                Documentation Hub
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e]">
                Developer Dashboard
              </span>
            </div>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
              Manage, explore, and test program documentations, SDKs, and REST API references.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border border-[#1a7f37] dark:border-[#2ea043] bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] hover:bg-[#c2f4cc] dark:hover:bg-[#238636]/30 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload & Test Project</span>
            </button>

            <button
              onClick={onOpenStudio}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1a7f37] dark:border-[#2ea043] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* System Vitals & Stats (GitHub / Linear Dashboard Metric Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
            <div className="flex items-center justify-between text-[#57606a] dark:text-[#8b949e] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Programs / Projects</span>
              <BookOpen className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <div className="text-2xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {projects.length}
            </div>
            <div className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1">
              Active documentation spaces
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
            <div className="flex items-center justify-between text-[#57606a] dark:text-[#8b949e] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">API Endpoints & Guides</span>
              <Code2 className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" />
            </div>
            <div className="text-2xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {totalArticles}
            </div>
            <div className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1">
              {totalApis} interactive endpoints testable
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
            <div className="flex items-center justify-between text-[#57606a] dark:text-[#8b949e] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Live Proxy & Mock Engine</span>
              <Server className="w-4 h-4 text-[#8250df] dark:text-[#a371f7]" />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a7f37] dark:text-[#3fb950] mt-1">
              <span className="w-2 h-2 rounded-full bg-[#1a7f37] dark:bg-[#3fb950] animate-pulse" />
              Online (CORS Bypass Active)
            </div>
            <div className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-2 font-mono">
              /api/proxy-test & /api/mock-api
            </div>
          </div>
        </div>

        {/* Project Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#57606a] dark:text-[#8b949e]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter repositories and programs by name or tag..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
            />
          </div>
        </div>

        {/* Repositories / Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const articleCount = p.sections.reduce((acc, s) => acc + s.articles.length, 0);
            const apiCount = p.sections.reduce(
              (acc, s) => acc + s.articles.filter((a) => a.type === 'api').length,
              0
            );

            return (
              <div
                key={p.id}
                className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-5 flex flex-col justify-between hover:border-[#8c959f] dark:hover:border-[#6e7681] transition-all shadow-xs"
              >
                <div>
                  {/* Card Header: Name + Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={() => onSelectProject(p.slug)}
                      className="font-bold text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline text-left"
                    >
                      {p.name}
                    </button>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#161b22]">
                      {p.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#57606a] dark:text-[#8b949e] line-clamp-3 mb-4 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-[#d0d7de] dark:border-[#30363d] text-xs">
                  <div className="flex items-center justify-between text-[#57606a] dark:text-[#8b949e] mb-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{p.branch}</span>
                      <span className="text-[#d0d7de] dark:text-[#30363d]">•</span>
                      <span>{p.version}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {p.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {p.forks}
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={() => onSelectProject(p.slug)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] transition-colors"
                  >
                    <span>Explore Docs ({articleCount} articles, {apiCount} APIs)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
