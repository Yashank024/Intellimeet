"use client";

import { useState } from 'react';
import { Upload, FileText, ClipboardList } from 'lucide-react';

interface UploadBoxProps {
  onProcessText: (text: string, title: string, project: string) => void;
  onProcessFile: (file: File, title: string, project: string) => void;
  isProcessing: boolean;
}

export default function UploadBox({ onProcessText, onProcessFile, isProcessing }: UploadBoxProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Payment checkout blocker sync');
  const [project, setProject] = useState('Payment Integration');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !title.trim()) return;
    onProcessText(text, title, project);
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    onProcessFile(file, title, project);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl shadow-xs overflow-hidden">
      {/* Selector Tabs */}
      <div className="flex border-b border-border-slate bg-slate-50/50">
        <button
          onClick={() => setActiveTab('text')}
          disabled={isProcessing}
          className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'text'
              ? 'border-accent text-primary bg-card-bg'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Raw Text / Transcript</span>
        </button>
        <button
          onClick={() => setActiveTab('file')}
          disabled={isProcessing}
          className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'file'
              ? 'border-accent text-primary bg-card-bg'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>PDF / Note Image (OCR)</span>
        </button>
      </div>

      <div className="p-6">
        {/* Global Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Meeting Title</label>
            <input
              type="text"
              required
              disabled={isProcessing}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="e.g. API Blockers Alignment Sync"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Connected Project</label>
            <input
              type="text"
              required
              disabled={isProcessing}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full text-sm font-semibold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="e.g. Payment Integration"
            />
          </div>
        </div>

        {activeTab === 'text' ? (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Meeting Transcript / Summary Notes</label>
              <textarea
                required
                disabled={isProcessing}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full text-sm font-medium text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg p-3.5 focus:outline-none focus:border-accent leading-relaxed"
                placeholder="Paste raw conversation logs or freeform meeting notes here..."
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !text.trim() || !title.trim()}
              className="w-full bg-primary hover:bg-slate-900 disabled:bg-slate-300 text-white py-3 rounded-lg text-sm font-bold tracking-wide transition-colors cursor-pointer"
            >
              {isProcessing ? 'Processing Information...' : 'Extract Intelligence'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-accent bg-accent/5' : 'border-border-slate hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                disabled={isProcessing}
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileText className="h-10 w-10 text-slate-400 mb-3" />
              {file ? (
                <div>
                  <p className="text-sm font-bold text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={isProcessing}
                    className="text-xs text-red-500 hover:text-red-700 font-bold mt-2"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-bold text-accent hover:text-accent-dark">Upload a file</span>
                  <span className="text-sm font-semibold text-slate-500"> or drag and drop</span>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Accepts PDFs or scanned images (PNG, JPG)</p>
                </label>
              )}
            </div>
            <button
              type="submit"
              disabled={isProcessing || !file || !title.trim()}
              className="w-full bg-primary hover:bg-slate-900 disabled:bg-slate-300 text-white py-3 rounded-lg text-sm font-bold tracking-wide transition-colors cursor-pointer"
            >
              {isProcessing ? 'Extracting via OCR...' : 'Run OCR & Parse Transcript'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
