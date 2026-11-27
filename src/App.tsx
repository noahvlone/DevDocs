import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DocContent } from './components/DocContent';
import { TableOfContents } from './components/TableOfContents';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ProjectImportModal } from './components/ProjectImportModal';
import { DashboardPage } from './pages/DashboardPage';
import { StudioEditor } from './components/StudioEditor';
import type { Project, Article, ArticleMeta } from './types/doc';
import { Loader2 } from 'lucide-react';

export function AppContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string>('paynusantara');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string>('overview');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [currentView, setCurrentView] = useState<'docs' | 'dashboard' | 'studio'>('docs');
  const [searchOpen, setSearchOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects list
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: Project[] = await res.json();
        setProjects(data);

        // Verify if current project still exists
        if (data.length > 0 && !data.some((p) => p.slug === currentProjectSlug)) {
          setCurrentProjectSlug(data[0].slug);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current project reference
  const currentProject = projects.find((p) => p.slug === currentProjectSlug) || projects[0] || null;

  // Flatten articles in current project for previous/next pagination
  const allArticlesInProject: ArticleMeta[] = React.useMemo(() => {
    if (!currentProject) return [];
    const list: ArticleMeta[] = [];
    currentProject.sections.forEach((sec) => {
      sec.articles.forEach((art) => list.push(art));
    });
    return list;
  }, [currentProject]);

  // Load article content when project or article slug changes
  useEffect(() => {
    if (!currentProjectSlug) return;

    // Default to first article if not set
    let targetSlug = currentArticleSlug;
    if (!targetSlug && allArticlesInProject.length > 0) {
      targetSlug = allArticlesInProject[0].slug;
      setCurrentArticleSlug(targetSlug);
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/projects/${currentProjectSlug}/articles/${targetSlug}`);
        if (res.ok) {
          const art: Article = await res.json();
          setCurrentArticle(art);
        } else if (allArticlesInProject.length > 0 && targetSlug !== allArticlesInProject[0].slug) {
          // Fallback to first article
          const fallback = allArticlesInProject[0].slug;
          setCurrentArticleSlug(fallback);
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
      }
    };

    fetchArticle();
  }, [currentProjectSlug, currentArticleSlug, allArticlesInProject]);

  // Handle article selection
  const handleSelectArticle = (slug: string) => {
    setCurrentArticleSlug(slug);
    setCurrentView('docs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle project selection
  const handleSelectProject = (slug: string, articleSlug?: string) => {
    setCurrentProjectSlug(slug);
    const proj = projects.find((p) => p.slug === slug);
    if (proj && proj.sections[0]?.articles[0]) {
      setCurrentArticleSlug(articleSlug || proj.sections[0].articles[0].slug);
    }
    setCurrentView('docs');
  };

  // Find previous and next articles
  const currentIndex = allArticlesInProject.findIndex((a) => a.slug === currentArticleSlug);
  const prevArticle = currentIndex > 0 ? allArticlesInProject[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticlesInProject.length - 1
      ? allArticlesInProject[currentIndex + 1]
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#010409] flex flex-col items-center justify-center text-xs text-[#57606a] dark:text-[#8b949e]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0969da] dark:text-[#2f81f7] mb-2" />
        <span>Initializing DevDocs Engine...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#e6edf3]">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        currentProject={currentProject}
        currentView={currentView}
        onSelectProject={(slug) => handleSelectProject(slug)}
        onNavigateView={(view) => setCurrentView(view)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenImportModal={() => setImportModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'dashboard' && (
          <DashboardPage
            projects={projects}
            onSelectProject={(slug, artSlug) => handleSelectProject(slug, artSlug)}
            onOpenStudio={() => setCurrentView('studio')}
            onOpenImportModal={() => setImportModalOpen(true)}
          />
        )}

        {currentView === 'studio' && (
          <StudioEditor
            projects={projects}
            activeProject={currentProject}
            onRefreshProjects={fetchProjects}
            onNavigateToDoc={(projSlug, artSlug) => {
              setCurrentProjectSlug(projSlug);
              setCurrentArticleSlug(artSlug);
              setCurrentView('docs');
            }}
          />
        )}

        {currentView === 'docs' && currentProject && (
          <div className="flex-1 flex overflow-hidden">
            {/* Hierarchical Sidebar */}
            <Sidebar
              project={currentProject}
              currentArticleSlug={currentArticleSlug}
              onSelectArticle={handleSelectArticle}
              onOpenStudio={() => setCurrentView('studio')}
            />

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto">
              {currentArticle ? (
                <DocContent
                  article={currentArticle}
                  projectSlug={currentProject.slug}
                  prevArticle={prevArticle}
                  nextArticle={nextArticle}
                  onNavigate={handleSelectArticle}
                />
              ) : (
                <div className="p-12 text-center text-xs text-[#57606a] dark:text-[#8b949e]">
                  Select an article from the sidebar to view documentation.
                </div>
              )}
            </div>

            {/* Right TOC Sidebar */}
            {currentArticle && (
              <TableOfContents
                article={currentArticle}
                commitSha={currentProject.commitSha}
                onEditInStudio={() => setCurrentView('studio')}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(projSlug, artSlug) => {
          handleSelectProject(projSlug, artSlug);
        }}
      />

      {/* Project Import / File Upload Modal */}
      <ProjectImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={(newProj) => {
          fetchProjects();
          handleSelectProject(newProj.slug);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
