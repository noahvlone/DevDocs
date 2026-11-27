import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, X, Terminal, Server } from 'lucide-react';
import { Project } from '../types/doc';

interface ProjectImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:5000');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const loadSampleSpec = () => {
    const sampleOpenApi = {
      openapi: "3.0.0",
      info: {
        title: "My Local App Service",
        version: "v1.0.0",
        description: "Live testable endpoints for my running local project."
      },
      servers: [
        { url: baseUrl || "http://localhost:5000" }
      ],
      paths: {
        "/api/users": {
          get: {
            summary: "List All Users",
            tags: ["Users"],
            parameters: [
              { name: "page", in: "query", required: false, schema: { type: "integer" }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer" }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    example: {
                      users: [{ id: 1, name: "Alice Developer", email: "alice@example.com" }]
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: "Create New User",
            tags: ["Users"],
            requestBody: {
              content: {
                "application/json": {
                  example: { name: "Budi Santoso", email: "budi@example.com", role: "admin" }
                }
              }
            },
            responses: {
              "201": { description: "User created" }
            }
          }
        },
        "/api/upload": {
          post: {
            summary: "Upload Document or Avatar File",
            tags: ["Files"],
            description: "Test live file upload via multipart/form-data to your backend server.",
            requestBody: {
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: { type: "string", format: "binary" },
                      category: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "File uploaded successfully"
              }
            }
          }
        }
      }
    };

    setRawText(JSON.stringify(sampleOpenApi, null, 2));
    setActiveTab('paste');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let res: Response;

      if (activeTab === 'upload') {
        if (!selectedFile) {
          setErrorMsg('Please select a file to upload (.json, .yaml, .yml)');
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('overrideBaseUrl', baseUrl);

        res = await fetch('/api/import-spec', {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!rawText.trim()) {
          setErrorMsg('Specification content cannot be empty.');
          setIsLoading(false);
          return;
        }

        res = await fetch('/api/import-spec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: rawText,
            filename: 'custom-spec.json',
            overrideBaseUrl: baseUrl,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import specification.');
      }

      onSuccess(data.project);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during import.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117]">
          <div>
            <h3 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              Import & Live Test Your Existing Project
            </h3>
            <p className="text-[#57606a] dark:text-[#8b949e] mt-0.5">
              Upload your OpenAPI / Swagger file or Postman Collection to automatically generate live documentation & interactive playground.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#57606a] dark:text-[#8b949e] hover:bg-[#eaeef2] dark:hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Target Base URL Input */}
          <div className="p-3 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117]">
            <label className="flex items-center gap-1.5 font-semibold text-[#1f2328] dark:text-[#f0f6fc] mb-1">
              <Server className="w-3.5 h-3.5 text-[#0969da] dark:text-[#2f81f7]" />
              <span>Where is your project running? (Target Base URL)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. http://localhost:5000 or http://localhost:8000"
              className="w-full px-2.5 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] font-mono text-xs text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
            />
            <span className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1 block">
              Requests will be relayed through the proxy engine so you won't hit CORS issues.
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-[#0969da] text-[#0969da] dark:border-[#2f81f7] dark:text-[#58a6ff]'
                  : 'border-transparent text-[#57606a] dark:text-[#8b949e]'
              }`}
            >
              Upload File (.json / .yaml)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`py-2 px-3 border-b-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-[#0969da] text-[#0969da] dark:border-[#2f81f7] dark:text-[#58a6ff]'
                  : 'border-transparent text-[#57606a] dark:text-[#8b949e]'
              }`}
            >
              Paste Raw JSON / YAML
            </button>
            <button
              onClick={loadSampleSpec}
              className="py-2 px-3 text-[#57606a] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#58a6ff] ml-auto flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Load Ready-to-Test Template</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#d0d7de] dark:border-[#30363d] rounded-lg p-8 text-center bg-white dark:bg-[#0d1117] hover:border-[#0969da] transition-colors"
            >
              <Upload className="w-8 h-8 text-[#57606a] dark:text-[#8b949e] mx-auto mb-2" />
              <div className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] mb-1">
                Drag and drop your API spec file here
              </div>
              <p className="text-[11px] text-[#57606a] dark:text-[#8b949e] mb-3">
                Supports Swagger 2.0, OpenAPI 3.0/3.1 (JSON/YAML), or Postman Collection v2
              </p>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] font-semibold cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] font-mono font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Content */}
          {activeTab === 'paste' && (
            <div>
              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your OpenAPI / Swagger JSON/YAML or Postman collection content here..."
                className="w-full p-3 font-mono text-xs rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0969da]"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#ffebe9] dark:bg-[#da3633]/20 border border-[#cf222e] dark:border-[#da3633] text-[#cf222e] dark:text-[#f85149]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117]">
          <span className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
            Auto-parses routes, parameters, payloads, and sets up live testing.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing & Parsing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Import & Open Live Tester</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
