import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, Terminal, Code2, Sliders, Server, Loader2, Upload, Plus, Trash2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ApiEndpoint, HttpMethod } from '../types/doc';
import { CodeBlock } from './CodeBlock';
import { generateCodeSnippet } from '../lib/code-generator';

interface ApiPlaygroundProps {
  endpoint: ApiEndpoint;
  projectSlug: string;
}

interface FormFieldItem {
  id: string;
  name: string;
  type: 'text' | 'file';
  textValue?: string;
  fileValue?: File | null;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ endpoint, projectSlug }) => {
  const [activeTab, setActiveTab] = useState<'params' | 'body' | 'snippets'>('params');
  const [bodyMode, setBodyMode] = useState<'json' | 'form-data'>('json');
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python' | 'go' | 'php'>('curl');

  // Environment and target URL
  const [envMode, setEnvMode] = useState<'live' | 'mock'>('live');
  const [customBaseUrl, setCustomBaseUrl] = useState(endpoint.baseUrl || 'http://localhost:5000');

  // Interactive inputs state
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState(endpoint.requestBodySchema || '');

  // Form-Data / File Upload Fields
  const [formFields, setFormFields] = useState<FormFieldItem[]>([
    { id: '1', name: 'file', type: 'file', fileValue: null },
    { id: '2', name: 'description', type: 'text', textValue: 'Test document' },
  ]);

  // Response execution state
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [proxyError, setProxyError] = useState<any>(null);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [responseAnalysis, setResponseAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Initialize defaults from endpoint schema
  useEffect(() => {
    const initHeaders: Record<string, string> = {};
    endpoint.headers?.forEach((h) => {
      if (h.example) initHeaders[h.name] = h.example;
    });
    setHeaderValues(initHeaders);

    const initQueries: Record<string, string> = {};
    endpoint.queryParams?.forEach((q) => {
      if (q.example) initQueries[q.name] = q.example;
    });
    setQueryValues(initQueries);

    const initPaths: Record<string, string> = {};
    endpoint.pathParams?.forEach((p) => {
      if (p.example) initPaths[p.name] = p.example;
    });
    setPathValues(initPaths);

    setBodyText(endpoint.requestBodySchema || '');
    setCustomBaseUrl(endpoint.baseUrl || 'http://localhost:5000');
    setHasExecuted(false);
    setResponseStatus(null);
    setResponseBody(null);
    setProxyError(null);
    setResponseAnalysis(null);
    setAnalysisError(null);
  }, [endpoint]);

  // Method color schemes (GitHub style)
  const getMethodBadgeClass = (m: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b] dark:bg-[#238636]/20 dark:text-[#3fb950] dark:border-[#238636]';
      case 'POST':
        return 'bg-[#ddf4ff] text-[#0969da] border-[#54aeff] dark:bg-[#1f6feb]/20 dark:text-[#58a6ff] dark:border-[#1f6feb]';
      case 'PUT':
      case 'PATCH':
        return 'bg-[#fff8c5] text-[#9a6700] border-[#d4a72c] dark:bg-[#d29922]/20 dark:text-[#e3b341] dark:border-[#d29922]';
      case 'DELETE':
        return 'bg-[#ffebe9] text-[#cf222e] border-[#ff8182] dark:bg-[#da3633]/20 dark:text-[#f85149] dark:border-[#da3633]';
    }
  };

  // Build resolved path
  let resolvedPath = endpoint.path;
  Object.entries(pathValues).forEach(([k, v]) => {
    resolvedPath = resolvedPath.replace(`:${k}`, v || `:${k}`);
  });

  const queryEntries = Object.entries(queryValues).filter(([, v]) => v.trim() !== '');
  const queryStr = queryEntries.length > 0 ? '?' + new URLSearchParams(queryValues).toString() : '';

  const fullLiveTargetUrl = `${customBaseUrl.replace(/\/$/, '')}${resolvedPath}${queryStr}`;

  const handleAddFormField = (type: 'text' | 'file') => {
    setFormFields([
      ...formFields,
      {
        id: String(Date.now()),
        name: type === 'file' ? 'attachment' : 'param_key',
        type,
        textValue: '',
        fileValue: null,
      },
    ]);
  };

  const handleRemoveFormField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setProxyError(null);
    setResponseAnalysis(null);
    setAnalysisError(null);
    const startTime = performance.now();

    try {
      if (envMode === 'mock') {
        // Run against local Mock Engine
        const mockUrl = `/api/mock-api/${projectSlug}${resolvedPath}${queryStr}`;
        const opts: RequestInit = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            ...headerValues,
          },
        };

        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && bodyText.trim()) {
          opts.body = bodyText;
        }

        const res = await fetch(mockUrl, opts);
        const duration = Math.round(performance.now() - startTime);
        setResponseStatus(res.status);
        setResponseTime(duration);

        try {
          const json = await res.json();
          setResponseBody(json);
        } catch {
          const txt = await res.text();
          setResponseBody({ raw: txt });
        }
      } else {
        // Run against Live Project via /api/proxy-test relay (CORS bypass & Multipart forwarder)
        const proxyUrl = `/api/proxy-test`;
        const headers: Record<string, string> = {
          'x-target-url': fullLiveTargetUrl,
          ...headerValues,
        };

        let reqBody: any = undefined;

        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
          if (bodyMode === 'form-data') {
            const formData = new FormData();
            formFields.forEach((field) => {
              if (field.type === 'file' && field.fileValue) {
                formData.append(field.name, field.fileValue);
              } else if (field.type === 'text') {
                formData.append(field.name, field.textValue || '');
              }
            });
            reqBody = formData;
            // Let browser set boundary for multipart
            delete headers['content-type'];
          } else if (bodyText.trim()) {
            headers['content-type'] = 'application/json';
            reqBody = bodyText;
          }
        }

        const res = await fetch(proxyUrl, {
          method: endpoint.method,
          headers,
          body: reqBody,
        });

        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();

        if (data._liveProxy) {
          setResponseStatus(data.status);
          setResponseTime(data.durationMs || duration);
          setResponseHeaders(data.headers || {});
          setResponseBody(data.data || data);

          if (data.status === 502) {
            setProxyError(data);
          }
        } else {
          setResponseStatus(res.status);
          setResponseTime(duration);
          setResponseBody(data);
        }
      }

      setHasExecuted(true);
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResponseStatus(500);
      setResponseTime(duration);
      setResponseBody({ error: err.message, note: 'Failed to complete network request' });
      setHasExecuted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeResponse = async () => {
    if (responseStatus === null) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResponseAnalysis(null);

    try {
      const res = await fetch('/api/ai/explain-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: endpoint.method,
          path: resolvedPath,
          status: responseStatus,
          durationMs: responseTime ?? 0,
          responseBody,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI analysis request failed.');
      }

      if (typeof data.analysis !== 'string' || !data.analysis.trim()) {
        throw new Error('AI did not return an explanation. Please try again.');
      }

      setResponseAnalysis(data.analysis);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'AI analysis request failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseBody) {
      navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="mt-8 mb-12 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] shadow-sm overflow-hidden select-none">
      {/* Playground Header */}
      <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getMethodBadgeClass(
                endpoint.method
              )}`}
            >
              {endpoint.method}
            </span>
            <code className="text-[14px] font-mono font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
              {resolvedPath}
            </code>
          </div>

          {/* Target Environment Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#57606a] dark:text-[#8b949e] flex items-center gap-1 font-semibold">
              <Server className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" /> Mode:
            </span>
            <button
              onClick={() => setEnvMode('live')}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1 ${
                envMode === 'live'
                  ? 'border-[#1a7f37] dark:border-[#2ea043] bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] font-semibold'
                  : 'border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Live Project (Proxy Relay)</span>
            </button>

            <button
              onClick={() => setEnvMode('mock')}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                envMode === 'mock'
                  ? 'border-[#0969da] dark:border-[#2f81f7] bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff] font-semibold'
                  : 'border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]'
              }`}
            >
              Simulated Mock
            </button>
          </div>
        </div>

        {/* Live Target Base URL Config Bar */}
        {envMode === 'live' && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
            <span className="text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e] whitespace-nowrap">
              Project Base URL:
            </span>
            <input
              type="text"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              placeholder="e.g. http://localhost:5000 or http://localhost:8000"
              className="flex-1 px-2 py-0.5 font-mono text-xs text-[#1f2328] dark:text-[#f0f6fc] bg-transparent border-none focus:outline-none"
            />
            <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] px-1.5 py-0.5 rounded bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">
              CORS-Free
            </span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center px-3 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] font-mono text-xs text-[#57606a] dark:text-[#8b949e] overflow-x-auto select-all">
            <span className="text-[#8c959f] dark:text-[#6e7681] mr-1">
              {envMode === 'live' ? customBaseUrl : 'http://localhost:3000/api/mock-api/' + projectSlug}
            </span>
            <span className="text-[#1f2328] dark:text-[#f0f6fc] font-semibold">
              {resolvedPath}{queryStr}
            </span>
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1a7f37] dark:border-[#2ea043] transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'params'
              ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
              : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Parameters</span>
        </button>

        {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
          <button
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'body'
                ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
                : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Body & File Upload</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'snippets'
              ? 'border-[#fd8c73] text-[#1f2328] dark:text-[#f0f6fc]'
              : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Code Snippets</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4">
        {activeTab === 'params' && (
          <div className="space-y-4">
            {/* Path Params */}
            {endpoint.pathParams && endpoint.pathParams.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  Path Variables
                </h4>
                <div className="space-y-2">
                  {endpoint.pathParams.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 text-xs">
                      <div className="w-1/3">
                        <span className="font-mono font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                          {p.name}
                        </span>
                        <span className="ml-2 text-[#cf222e] dark:text-[#f85149]">*required</span>
                        <div className="text-[11px] text-[#57606a] dark:text-[#8b949e]">{p.description}</div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pathValues[p.name] || ''}
                          onChange={(e) => setPathValues({ ...pathValues, [p.name]: e.target.value })}
                          placeholder={`Value for :${p.name}`}
                          className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] font-mono text-xs focus:outline-none focus:border-[#0969da]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query Params */}
            {endpoint.queryParams && endpoint.queryParams.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  Query Parameters
                </h4>
                <div className="space-y-2">
                  {endpoint.queryParams.map((q) => (
                    <div key={q.name} className="flex items-center gap-3 text-xs">
                      <div className="w-1/3">
                        <span className="font-mono font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                          {q.name}
                        </span>
                        {q.required && <span className="ml-2 text-[#cf222e] dark:text-[#f85149]">*required</span>}
                        <div className="text-[11px] text-[#57606a] dark:text-[#8b949e]">{q.description}</div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={queryValues[q.name] || ''}
                          onChange={(e) => setQueryValues({ ...queryValues, [q.name]: e.target.value })}
                          placeholder={q.example || `Optional value for ${q.name}`}
                          className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] font-mono text-xs focus:outline-none focus:border-[#0969da]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headers */}
            {endpoint.headers && endpoint.headers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  HTTP Headers
                </h4>
                <div className="space-y-2">
                  {endpoint.headers.map((h) => (
                    <div key={h.name} className="flex items-center gap-3 text-xs">
                      <div className="w-1/3">
                        <span className="font-mono font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                          {h.name}
                        </span>
                        {h.required && <span className="ml-2 text-[#cf222e] dark:text-[#f85149]">*required</span>}
                        <div className="text-[11px] text-[#57606a] dark:text-[#8b949e]">{h.description}</div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={headerValues[h.name] || ''}
                          onChange={(e) => setHeaderValues({ ...headerValues, [h.name]: e.target.value })}
                          placeholder={h.example || `Header value`}
                          className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] font-mono text-xs focus:outline-none focus:border-[#0969da]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div className="space-y-4">
            {/* Body Mode Switcher */}
            <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e]">Payload Type:</span>
                <button
                  onClick={() => setBodyMode('json')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    bodyMode === 'json'
                      ? 'border-[#0969da] dark:border-[#2f81f7] bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff]'
                      : 'border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]'
                  }`}
                >
                  application/json
                </button>
                <button
                  onClick={() => setBodyMode('form-data')}
                  className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                    bodyMode === 'form-data'
                      ? 'border-[#0969da] dark:border-[#2f81f7] bg-[#ddf4ff] dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff]'
                      : 'border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>multipart/form-data (File Upload)</span>
                </button>
              </div>

              {bodyMode === 'json' && (
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(bodyText);
                      setBodyText(JSON.stringify(parsed, null, 2));
                    } catch {
                      alert('Invalid JSON');
                    }
                  }}
                  className="text-xs text-[#0969da] dark:text-[#2f81f7] hover:underline"
                >
                  Format JSON
                </button>
              )}
            </div>

            {/* JSON Mode */}
            {bodyMode === 'json' && (
              <textarea
                rows={8}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
              />
            )}

            {/* Multipart Form-Data / File Upload Mode */}
            {bodyMode === 'form-data' && (
              <div className="space-y-3">
                <div className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
                  Upload files directly to test file upload endpoints on your live running project.
                </div>

                <div className="space-y-2">
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-xs"
                    >
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          setFormFields(
                            formFields.map((f) => (f.id === field.id ? { ...f, name: e.target.value } : f))
                          )
                        }
                        placeholder="Field name (e.g. file, avatar)"
                        className="w-36 px-2 py-1 font-mono text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                      />

                      <select
                        value={field.type}
                        onChange={(e) =>
                          setFormFields(
                            formFields.map((f) =>
                              f.id === field.id ? { ...f, type: e.target.value as any } : f
                            )
                          )
                        }
                        className="px-2 py-1 text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                      >
                        <option value="file">File (Binary)</option>
                        <option value="text">Text (String)</option>
                      </select>

                      <div className="flex-1">
                        {field.type === 'file' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null;
                                setFormFields(
                                  formFields.map((item) =>
                                    item.id === field.id ? { ...item, fileValue: f } : item
                                  )
                                );
                              }}
                              className="text-xs text-[#57606a] dark:text-[#8b949e] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-[#d0d7de] dark:file:border-[#30363d] file:text-xs file:font-semibold file:bg-white dark:file:bg-[#0d1117] file:text-[#1f2328] dark:file:text-[#f0f6fc] cursor-pointer"
                            />
                            {field.fileValue && (
                              <span className="text-[11px] text-[#1a7f37] dark:text-[#3fb950] font-mono">
                                ({(field.fileValue.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={field.textValue || ''}
                            onChange={(e) =>
                              setFormFields(
                                formFields.map((item) =>
                                  item.id === field.id ? { ...item, textValue: e.target.value } : item
                                )
                              )
                            }
                            placeholder="Field value text"
                            className="w-full px-2 py-1 text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]"
                          />
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveFormField(field.id)}
                        className="p-1 text-[#cf222e] dark:text-[#f85149] hover:bg-white dark:hover:bg-[#0d1117] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleAddFormField('file')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <Plus className="w-3 h-3" /> Add File Field
                  </button>
                  <button
                    onClick={() => handleAddFormField('text')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <Plus className="w-3 h-3" /> Add Text Field
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'snippets' && (
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-[#d0d7de] dark:border-[#30363d] pb-2">
              {(['curl', 'javascript', 'python', 'go', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase font-semibold transition-colors ${
                    codeLang === lang
                      ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                      : 'text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <CodeBlock
              language={codeLang === 'curl' ? 'bash' : codeLang}
              code={generateCodeSnippet(endpoint, codeLang, {
                baseUrl: envMode === 'live' ? customBaseUrl : 'http://localhost:3000',
                headers: headerValues,
                queryParams: queryValues,
                pathParams: pathValues,
                body: bodyText,
              })}
              filename={`request.${codeLang === 'curl' ? 'sh' : codeLang === 'javascript' ? 'js' : codeLang === 'python' ? 'py' : codeLang}`}
            />
          </div>
        )}
      </div>

      {/* Response Panel */}
      <div className="border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider">
              Response Console
            </span>
            {hasExecuted && responseStatus !== null && (
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-[#dafbe1] text-[#1a7f37] dark:bg-[#238636]/20 dark:text-[#3fb950]'
                      : 'bg-[#ffebe9] text-[#cf222e] dark:bg-[#da3633]/20 dark:text-[#f85149]'
                  }`}
                >
                  {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'Created' : 'Response'}
                </span>
                {responseTime !== null && (
                  <span className="text-[#57606a] dark:text-[#8b949e] font-mono">
                    {responseTime} ms
                  </span>
                )}
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] font-medium">
                  {envMode === 'live' ? 'Live Project Proxy' : 'Simulated Mock'}
                </span>
              </div>
            )}
          </div>

          {hasExecuted && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyzeResponse}
                disabled={isAnalyzing}
                className="flex items-center gap-1 text-xs font-medium text-[#0969da] dark:text-[#58a6ff] hover:underline disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isAnalyzing ? 'Menganalisis...' : 'Jelaskan dengan AI'}
              </button>
              {responseBody && (
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-xs text-[#57606a] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#2f81f7]"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {hasExecuted && (
          <p className="mb-2 text-[11px] text-[#57606a] dark:text-[#8b949e]">
            Analisis mengirim status dan isi response ke Groq; jangan kirim data sensitif.
          </p>
        )}

        {analysisError && (
          <div className="mb-3 p-3 rounded-md bg-[#ffebe9] dark:bg-[#da3633]/15 border border-[#cf222e] dark:border-[#da3633] text-xs text-[#cf222e] dark:text-[#f85149]">
            Gagal menganalisis hasil: {analysisError}
          </div>
        )}

        {responseAnalysis && (
          <div className="mb-3 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
              <Sparkles className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
              Kesimpulan & arti hasil tes
            </h4>
            <div className="markdown-body ai-analysis-markdown text-[#1f2328] dark:text-[#c9d1d9]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {responseAnalysis}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Live Proxy Unreachable Helper Alert */}
        {proxyError && (
          <div className="mb-3 p-3 rounded-md bg-[#ffebe9] dark:bg-[#da3633]/15 border border-[#cf222e] dark:border-[#da3633] text-xs space-y-1 text-[#cf222e] dark:text-[#f85149]">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Target server unreachable at {proxyError.targetUrl}</span>
            </div>
            <div className="text-[11px] opacity-90 pl-5">
              Make sure your backend project is actively running (e.g. at <code>{customBaseUrl}</code>). If not running yet, you can switch to <strong>"Simulated Mock"</strong> mode above to test response schemas.
            </div>
          </div>
        )}

        {hasExecuted ? (
          <div className="mt-2">
            <CodeBlock
              language="json"
              code={typeof responseBody === 'object' ? JSON.stringify(responseBody, null, 2) : String(responseBody)}
              filename="response.json"
              showLineNumbers={true}
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#d0d7de] dark:border-[#30363d] p-6 text-center text-xs text-[#57606a] dark:text-[#8b949e] bg-white dark:bg-[#0d1117]">
            <p className="mb-1 font-semibold text-[#1f2328] dark:text-[#c9d1d9]">
              No request has been sent yet
            </p>
            <p>
              Set your parameters above and click <strong className="text-[#1a7f37] dark:text-[#3fb950]">"Send Request"</strong> to test live against your project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
