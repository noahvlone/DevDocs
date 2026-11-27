import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Eye, Code, FileText, Globe, Check, RotateCcw } from 'lucide-react';
import type { Project, Article, HttpMethod, ParameterItem } from '../types/doc';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudioEditorProps {
  projects: Project[];
  activeProject: Project | null;
  onRefreshProjects: () => void;
  onNavigateToDoc: (projectSlug: string, articleSlug: string) => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  projects,
  activeProject,
  onRefreshProjects,
  onNavigateToDoc,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject?.id || (projects[0]?.id || ''));
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'api' | 'preview'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable article state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [docType, setDocType] = useState<'guide' | 'api'>('guide');
  const [content, setContent] = useState('');

  // Editable API endpoint state
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState('/v1/example');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [summary, setSummary] = useState('');
  const [headers, setHeaders] = useState<ParameterItem[]>([]);
  const [queryParams, setQueryParams] = useState<ParameterItem[]>([]);
  const [pathParams, setPathParams] = useState<ParameterItem[]>([]);
  const [requestBodySchema, setRequestBodySchema] = useState('{\n  "name": "example"\n}');
  const [mockStatus, setMockStatus] = useState(200);
  const [mockBody, setMockBody] = useState('{\n  "status": "success",\n  "message": "Sample response"\n}');

  // Modal for new project
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSlug, setNewProjectSlug] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectVersion, setNewProjectVersion] = useState('v1.0.0');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Load article when selection changes
  useEffect(() => {
    if (!currentProject) return;

    if (!selectedArticleId) {
      // Pick first article
      const firstSection = currentProject.sections[0];
      const firstArt = firstSection?.articles[0];
      if (firstArt) {
        loadArticleData(currentProject.slug, firstArt.slug);
      }
    }
  }, [selectedProjectId, currentProject]);

  const loadArticleData = async (projectSlug: string, articleSlug: string) => {
    try {
      const res = await fetch(`/api/projects/${projectSlug}/articles/${articleSlug}`);
      if (res.ok) {
        const art: Article = await res.json();
        setSelectedArticleId(art.id);
        setTitle(art.title);
        setSlug(art.slug);
        setDescription(art.description || '');
        setSectionId(art.sectionId);
        setDocType(art.type);
        setContent(art.content || '');

        if (art.endpoint) {
          setMethod(art.endpoint.method);
          setPath(art.endpoint.path);
          setBaseUrl(art.endpoint.baseUrl);
          setSummary(art.endpoint.summary || '');
          setHeaders(art.endpoint.headers || []);
          setQueryParams(art.endpoint.queryParams || []);
          setPathParams(art.endpoint.pathParams || []);
          setRequestBodySchema(art.endpoint.requestBodySchema || '');
          setMockStatus(art.endpoint.mockResponse?.status || 200);
          setMockBody(JSON.stringify(art.endpoint.mockResponse?.body || {}, null, 2));
        }
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    }
  };

  const handleCreateNewArticle = (type: 'guide' | 'api') => {
    const defaultSection = currentProject?.sections[0]?.id || '';
    setSelectedArticleId('');
    setTitle(type === 'guide' ? 'New Technical Guide' : 'New API Endpoint');
    setSlug(type === 'guide' ? `new-guide-${Date.now().toString().slice(-4)}` : `new-endpoint-${Date.now().toString().slice(-4)}`);
    setDescription('Brief summary of what this document covers.');
    setSectionId(defaultSection);
    setDocType(type);
    setContent(`# New Document\n\nWrite your markdown documentation here.\n\n> [!NOTE]\n> This is a callout note.`);

    if (type === 'api') {
      setMethod('GET');
      setPath('/v1/resource');
      setBaseUrl('https://api.example.com');
      setSummary('Retrieve a resource');
      setHeaders([{ name: 'Authorization', type: 'string', required: true, description: 'Bearer API Key', example: 'Bearer token_123' }]);
      setQueryParams([]);
      setPathParams([]);
      setRequestBodySchema('');
      setMockStatus(200);
      setMockBody('{\n  "status": "success",\n  "data": []\n}');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      alert('Title and Slug are required');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    let parsedMockBody = {};
    try {
      parsedMockBody = JSON.parse(mockBody);
    } catch {
      parsedMockBody = { raw: mockBody };
    }

    const payload: Partial<Article> = {
      id: selectedArticleId || undefined,
      projectId: selectedProjectId,
      sectionId: sectionId || (currentProject?.sections[0]?.id || 'sec_default'),
      title,
      slug,
      description,
      type: docType,
      order: 1,
      content,
      endpoint: docType === 'api' ? {
        method,
        path,
        baseUrl,
        summary,
        headers,
        queryParams,
        pathParams,
        requestBodySchema,
        mockResponse: {
          status: Number(mockStatus),
          statusText: mockStatus === 200 ? 'OK' : 'Created',
          headers: { 'Content-Type': 'application/json' },
          body: parsedMockBody,
        },
      } : undefined,
    };

    try {
      const url = selectedArticleId ? `/api/articles/${selectedArticleId}` : `/api/articles`;
      const res = await fetch(url, {
        method: selectedArticleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedArt = await res.json();
        setSelectedArticleId(savedArt.id);
        setSaveMessage('Saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
        onRefreshProjects();
      } else {
        const err = await res.json();
        alert('Failed to save: ' + (err.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticleId) return;
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${selectedArticleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedArticleId('');
        onRefreshProjects();
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleResetFactoryData = async () => {
    if (!confirm('Reset entire database to default factory showcase projects?')) return;
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      alert('Reset complete!');
      onRefreshProjects();
    } catch (err) {
      alert('Reset failed');
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectSlug.trim()) {
      alert('Name and slug are required');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          slug: newProjectSlug,
          description: newProjectDesc || 'Program documentation project',
          version: newProjectVersion || 'v1.0.0',
          branch: 'main',
          commitSha: Math.random().toString(16).substring(2, 9),
          icon: 'BookOpen',
          badge: 'Public',
          tags: ['REST API', 'Docs'],
          sections: [
            {
              id: `sec_${Date.now()}`,
              title: 'Getting Started',
              slug: 'getting-started',
              order: 1,
              articles: [],
            },
          ],
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectSlug('');
        setNewProjectDesc('');
        onRefreshProjects();
        setSelectedProjectId(created.id);
      }
    } catch (err: any) {
      alert('Failed to create project: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-[#f6f8fa] dark:bg-[#010409] overflow-hidden select-none">
      {/* Top Studio Control Bar */}
      <div className="h-14 border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-xs text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider">
            Project:
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedArticleId('');
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.version})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>

        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="flex items-center gap-1 text-xs text-[#1a7f37] dark:text-[#3fb950] font-medium mr-2">
              <Check className="w-3.5 h-3.5" />
              {saveMessage}
            </span>
          )}

          {selectedArticleId && currentProject && (
            <button
              onClick={() => onNavigateToDoc(currentProject.slug, slug)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] text-xs font-medium hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
              <span>View in Docs</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1a7f37] dark:border-[#2ea043] transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            onClick={handleResetFactoryData}
            title="Reset to factory sample data"
            className="p-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] text-[#cf222e] dark:text-[#f85149] hover:bg-[#ffebe9] dark:hover:bg-[#da3633]/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left List + Center Form/Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tree Explorer in Studio */}
        <div className="w-72 shrink-0 border-r border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] flex flex-col overflow-y-auto p-3 text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d0d7de] dark:border-[#30363d]">
            <span className="font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider text-[11px]">
              Articles in {currentProject?.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCreateNewArticle('guide')}
                title="Add Guide"
                className="p-1 rounded hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] text-[#0969da] dark:text-[#58a6ff]"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCreateNewArticle('api')}
                title="Add API Endpoint"
                className="p-1 rounded hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] text-[#1a7f37] dark:text-[#3fb950]"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {currentProject?.sections.map((sec) => (
            <div key={sec.id} className="mb-3">
              <div className="font-semibold text-[11px] text-[#57606a] dark:text-[#8b949e] uppercase px-1 mb-1">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.articles.map((art) => {
                  const isSelected = art.id === selectedArticleId;
                  return (
                    <button
                      key={art.id}
                      onClick={() => loadArticleData(currentProject.slug, art.slug)}
                      className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors truncate ${
                        isSelected
                          ? 'bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff] font-semibold'
                          : 'text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {art.type === 'api' ? (
                          <span className="text-[10px] font-mono font-bold text-[#1a7f37] dark:text-[#3fb950]">
                            {art.method || 'API'}
                          </span>
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" />
                        )}
                        <span className="truncate">{art.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Center / Right Editor Panes */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0d1117]">
          {/* Metadata Inputs Bar */}
          <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e] uppercase mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Create Payment Charge"
                className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] font-semibold focus:outline-none focus:border-[#0969da]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e] uppercase mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. create-charge"
                className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e] uppercase mb-1">
                Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
              >
                <option value="guide">Technical Guide</option>
                <option value="api">API Endpoint Reference</option>
              </select>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between px-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-xs font-semibold">
            <div className="flex">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
                    : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Markdown Editor</span>
              </button>

              {docType === 'api' && (
                <button
                  onClick={() => setActiveTab('api')}
                  className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'api'
                      ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
                      : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>API Endpoint Schema & Mock</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
                    : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            {selectedArticleId && (
              <button
                onClick={handleDeleteArticle}
                className="text-[#cf222e] dark:text-[#f85149] hover:underline flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Document
              </button>
            )}
          </div>

          {/* Active Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'content' && (
              <div className="h-full flex flex-col">
                <div className="mb-2 flex items-center gap-2 text-xs text-[#57606a] dark:text-[#8b949e]">
                  <span>Supports GitHub Alerts:</span>
                  <code className="text-[11px]">&gt; [!NOTE]</code>
                  <code className="text-[11px]">&gt; [!TIP]</code>
                  <code className="text-[11px]">&gt; [!WARNING]</code>
                  <code className="text-[11px]">&gt; [!CAUTION]</code>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write documentation markdown here..."
                  className="flex-1 w-full p-4 font-mono text-[13px] leading-relaxed rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
                />
              </div>
            )}

            {activeTab === 'api' && docType === 'api' && (
              <div className="space-y-6 max-w-4xl text-xs">
                {/* Endpoint Route Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
                  <div>
                    <label className="block font-semibold mb-1">HTTP Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as HttpMethod)}
                      className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono font-bold"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1">Path Pattern</label>
                    <input
                      type="text"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="/v1/charges or /v1/charges/:id"
                      className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold mb-1">Base URL</label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.example.com"
                      className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono"
                    />
                  </div>
                </div>

                {/* Request Body JSON */}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                      Default Request Body (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={requestBodySchema}
                      onChange={(e) => setRequestBodySchema(e.target.value)}
                      className="w-full p-3 font-mono text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                    />
                  </div>
                )}

                {/* Mock Engine Response Config */}
                <div className="p-4 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                      Simulated Mock Engine Response
                    </label>
                    <div className="flex items-center gap-2">
                      <span>Status Code:</span>
                      <input
                        type="number"
                        value={mockStatus}
                        onChange={(e) => setMockStatus(Number(e.target.value))}
                        className="w-16 px-2 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    value={mockBody}
                    onChange={(e) => setMockBody(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="max-w-4xl mx-auto py-4">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 text-xs shadow-xl">
            <h3 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] mb-4">
              Create New Documentation Project
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. AuthEngine SDK"
                  className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="e.g. authengine"
                  className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Version</label>
                <input
                  type="text"
                  value={newProjectVersion}
                  onChange={(e) => setNewProjectVersion(e.target.value)}
                  placeholder="e.g. v1.0.0"
                  className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description of the program/API"
                  className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-3 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 rounded bg-[#1f883d] text-white font-semibold hover:bg-[#1a7f37]"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
