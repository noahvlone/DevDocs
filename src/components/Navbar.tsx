import React from 'react';
import { BookOpen, Search, Sun, Moon, LayoutDashboard, Edit3, ChevronDown, Check, Upload } from 'lucide-react';
import { useTheme } from './ThemeContext';
import type { Project } from '../types/doc';

interface NavbarProps {
  projects: Project[];
  currentProject: Project | null;
  currentView: 'docs' | 'dashboard' | 'studio';
  onSelectProject: (slug: string) => void;
  onNavigateView: (view: 'docs' | 'dashboard' | 'studio') => void;
  onOpenSearch: () => void;
  onOpenImportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  currentProject,
  currentView,
  onSelectProject,
  onNavigateView,
  onOpenSearch,
  onOpenImportModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="h-14 border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#010409] px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand Logo & Project Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigateView('dashboard')}
          className="flex items-center gap-2 text-[#1f2328] dark:text-[#f0f6fc] hover:opacity-85 font-semibold text-sm"
        >
          <div className="w-7 h-7 rounded bg-[#24292f] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4 text-[#58a6ff]" />
          </div>
          <span className="font-bold tracking-tight text-[15px]">DevDocs</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] font-mono">
            Hub
          </span>
        </button>

        <span className="text-[#d0d7de] dark:text-[#30363d]">/</span>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] transition-colors"
          >
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {currentProject ? currentProject.name : 'Select Project'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 mt-1.5 w-64 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-xl py-1 z-50 text-xs"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider text-[10px] border-b border-[#d0d7de] dark:border-[#30363d]">
                Switch Documentation Project
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.slug);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors"
                >
                  <div>
                    <div className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">{p.name}</div>
                    <div className="text-[11px] text-[#57606a] dark:text-[#8b949e] font-mono">{p.version}</div>
                  </div>
                  {currentProject?.id === p.id && (
                    <Check className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Navigation Mode Tabs */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
        <button
          onClick={() => onNavigateView('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            currentView === 'dashboard'
              ? 'bg-[#eaeef2] dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] font-semibold'
              : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigateView('docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            currentView === 'docs'
              ? 'bg-[#eaeef2] dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] font-semibold'
              : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Docs & API</span>
        </button>

        <button
          onClick={() => onNavigateView('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            currentView === 'studio'
              ? 'bg-[#eaeef2] dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] font-semibold'
              : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Studio (CMS)</span>
        </button>
      </nav>

      {/* Right: Upload Project CTA, Search bar & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenImportModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#1a7f37] dark:border-[#2ea043] bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload & Test Project</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] hover:border-[#8c959f] dark:hover:border-[#6e7681] text-xs transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search docs...</span>
          </div>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[10px] font-mono">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
