"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import PageHeader from '../../components/layout/PageHeader';
import { 
  Send, 
  Trash2, 
  Database, 
  Search, 
  FileText,
  Plus,
  Mic,
  Volume2,
  Code,
  PenTool,
  Sparkles,
  BookOpen,
  Compass
} from 'lucide-react';

export default function ChatPage() {
  const { messages, loading, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [model, setModel] = useState('Gemini 2.5 Flash');
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (loading) return;
    sendMessage(text);
  };

  // Check if we are in the landing state (only system welcome message in history)
  const isLandingState = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] bg-bg-slate text-foreground overflow-hidden relative border border-border-slate rounded-xl shadow-xs">
      
      {/* Voice Recording Overlay / Mock Audio Command Ingestion */}
      {isRecording && (
        <div className="absolute inset-0 bg-bg-slate/95 z-30 flex flex-col items-center justify-center space-y-6 animate-fade-in backdrop-blur-xs select-none">
          <div className="relative flex items-center justify-center">
            {/* Animated Pulsating Rings */}
            <div className="absolute h-24 w-24 rounded-full bg-accent/20 animate-ping" />
            <div className="absolute h-16 w-16 rounded-full bg-accent/35 animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white shadow-md">
              <Mic className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          
          <div className="text-center max-w-sm px-4">
            <h3 className="text-lg font-serif font-normal text-primary tracking-wide">Ingesting Audio Stream...</h3>
            <p className="text-xs text-secondary/90 mt-1.5 leading-relaxed font-semibold">
              Speak clearly. Gemini is ready to parse your meeting query and check matching context.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setInput("Which meetings discussed the Vendor API timeouts and Phase-2 risks?");
                setIsRecording(false);
              }}
              className="px-4.5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Simulate Voice Command
            </button>
            <button
              type="button"
              onClick={() => setIsRecording(false)}
              className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Internal Navigation Bar */}
      <div className="px-6 py-4 bg-card-bg border-b border-border-slate flex justify-between items-center z-10 select-none">
        <div className="flex items-center space-x-2.5">
          <img src="/logo_intllimeet.png" alt="IntelliMeet Logo" className="h-6 w-6 object-contain" />
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">INTELLIMEET RAG ENGINE</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-extrabold text-accent bg-accent-light border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Active: {model}
          </span>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 transition-colors cursor-pointer bg-transparent border-none"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {isLandingState ? (
        /* Landing Page (Claude interface theme-based styling) */
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full space-y-6 animate-fade-in bg-bg-slate">
          {/* Greeting Block */}
          <div className="flex items-center space-x-3.5 select-none">
            <img 
              src="/logo_intllimeet.png" 
              alt="IntelliMeet Logo" 
              className="w-10 h-10 object-contain" 
            />
            <h1 className="text-3xl font-serif font-normal text-slate-800 tracking-wide">
              Good morning, Yashank Gupta
            </h1>
          </div>

          {/* Theme-based Light Input Container */}
          <div className="w-full bg-card-bg border border-border-slate hover:border-slate-300 rounded-2xl p-4 shadow-sm focus-within:border-primary/50 transition-all duration-350">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="w-full bg-transparent text-slate-800 border-none outline-none resize-none text-sm placeholder-slate-400 focus:ring-0 focus:outline-none min-h-[90px] leading-relaxed font-medium"
            />
            
            <div className="flex justify-between items-center pt-3 border-t border-border-slate mt-2 select-none">
              {/* Left Action Attachments */}
              <button 
                type="button"
                onClick={() => alert("Upload PDF or image notes to context (In Development)")}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-650 cursor-pointer border border-transparent"
              >
                <Plus className="h-5 w-5 text-slate-400 hover:text-primary" />
              </button>

              {/* Right Model Selection & Controls */}
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-transparent text-xs text-slate-450 hover:text-primary font-bold outline-none border-none focus:ring-0 cursor-pointer pr-4 appearance-none"
                  >
                    <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  </select>
                  <span className="absolute right-0 top-1 text-[10px] text-slate-400 pointer-events-none">&darr;</span>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => setIsRecording(true)}
                  className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => alert("Audio output waveform analyzer. Voice activation features are in development.")}
                  className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  <Volume2 className="h-4.5 w-4.5" />
                </button>
                
                {input.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="p-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Suggestion buttons underneath the input box */}
          <div className="flex flex-wrap gap-2.5 justify-center select-none pt-2">
            <button
              onClick={() => handleSuggestionClick("Show pending tasks for Rahul")}
              className="flex items-center space-x-2 text-xs bg-card-bg hover:bg-slate-55 text-slate-600 hover:text-primary border border-border-slate px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-2xs hover:shadow-xs"
            >
              <Code className="h-3.5 w-3.5 text-primary" />
              <span>Code</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("Which meetings discussed Vendor API issues?")}
              className="flex items-center space-x-2 text-xs bg-card-bg hover:bg-slate-55 text-slate-600 hover:text-primary border border-border-slate px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-2xs hover:shadow-xs"
            >
              <PenTool className="h-3.5 w-3.5 text-accent" />
              <span>Write</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("Show unresolved escalations")}
              className="flex items-center space-x-2 text-xs bg-card-bg hover:bg-slate-55 text-slate-600 hover:text-primary border border-border-slate px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-2xs hover:shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00C9FF]" />
              <span>Create</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("Which projects are at risk?")}
              className="flex items-center space-x-2 text-xs bg-card-bg hover:bg-slate-55 text-slate-600 hover:text-primary border border-border-slate px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-2xs hover:shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              <span>Learn</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("List overdue tasks across projects")}
              className="flex items-center space-x-2 text-xs bg-card-bg hover:bg-slate-55 text-slate-600 hover:text-primary border border-border-slate px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-2xs hover:shadow-xs"
            >
              <Compass className="h-3.5 w-3.5 text-red-500" />
              <span>Life stuff</span>
            </button>
          </div>
        </div>
      ) : (
        /* Conversation view */
        <div className="flex-1 flex flex-col min-h-0 bg-bg-slate/30">
          {/* Chat message list area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const isSystem = m.sender === 'system';

              if (isSystem) return null; // Welcome banner hidden in logs

              return (
                <div 
                  key={m.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3.5 animate-fade-in`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 text-xs select-none">
                      AI
                    </div>
                  )}
                  <div className={`max-w-xl rounded-2xl p-4 shadow-2xs border leading-relaxed ${
                    isUser 
                      ? 'bg-accent-light border-accent/20 text-slate-800 rounded-tr-none font-semibold' 
                      : 'bg-card-bg text-slate-755 border-border-slate rounded-tl-none font-medium'
                  }`}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>

                    {/* Intent / Confidence / Sources metadata row */}
                    {!isUser && (m.intent || m.confidence !== undefined || (m.sources && m.sources.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-border-slate/40">
                        {m.intent && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Database className="h-2.5 w-2.5" />
                            {m.intent.replace('_', ' ')}
                          </span>
                        )}
                        {m.confidence !== undefined && (
                          <span className="text-[9px] font-bold text-slate-400">
                            {(m.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                        {m.sources && m.sources.map((src, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            <FileText className="h-2.5 w-2.5" />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Collapsible SQLite Database trace & Vector citations accordion (Better UX) */}
                    {(m.sqlQuery || (m.citations && m.citations.length > 0)) ? (
                      <details className="mt-3.5 pt-3.5 border-t border-border-slate/60 group">
                        <summary className="flex items-center justify-between text-[9px] font-black text-slate-400 hover:text-primary uppercase tracking-wider cursor-pointer list-none select-none transition-colors">
                          <div className="flex items-center space-x-1.5">
                            <Database className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                            <span>View Engine Trace & citations</span>
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-primary transition-transform duration-200 group-open:rotate-180">▼</span>
                        </summary>
                        
                        <div className="mt-3.5 space-y-4 animate-fade-in">
                          {/* SQL logic display logs */}
                          {m.sqlQuery && (
                            <div className="space-y-1.5 select-all">
                              <div className="flex items-center space-x-1.5 text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <span>Generated SQLite Dispatcher Query</span>
                              </div>
                              <code className="block text-[9.5px] bg-slate-50 border border-border-slate text-green-700 px-2.5 py-2 rounded-md font-mono leading-normal select-all overflow-x-auto">
                                {m.sqlQuery}
                              </code>
                            </div>
                          )}

                          {/* Retrieval references */}
                          {m.citations && m.citations.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-1.5 text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <Search className="h-3.5 w-3.5 text-slate-400" />
                                <span>ChromaDB Vector Retrieval Citations</span>
                              </div>
                              {m.citations.map((c, i) => (
                                <div key={i} className="bg-slate-50 border border-border-slate p-2.5 rounded-lg">
                                  <p className="text-[9.5px] font-bold text-slate-500 flex items-center gap-1.5 leading-none">
                                    <FileText className="h-3 w-3 text-slate-400" />
                                    Source Meeting: <strong className="text-slate-700 font-extrabold">{c.meetingTitle}</strong>
                                  </p>
                                  <p className="text-[10px] text-slate-550 italic mt-1.5 leading-relaxed font-semibold">
                                    &quot;{c.textExcerpt}&quot;
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    ) : null}

                  </div>
                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-primary text-white border border-primary/20 flex items-center justify-center font-bold shrink-0 text-xs uppercase select-none">
                      PM
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Animated Bouncing Dots Typing Indicator */}
            {loading && (
              <div className="flex justify-start items-center space-x-3.5 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 text-xs select-none">
                  AI
                </div>
                <div className="bg-card-bg text-slate-700 border border-border-slate rounded-2xl rounded-tl-none px-4.5 py-3.5 shadow-2xs flex items-center space-x-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/45 dot-bounce-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/65 dot-bounce-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/85 dot-bounce-3" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Pill-shaped Capsule Input Container (docked at bottom matching the theme) */}
          <div className="p-4 border-t border-border-slate bg-card-bg flex justify-center items-center">
            <div className="w-full max-w-2xl flex items-center bg-bg-slate/40 border border-border-slate hover:border-slate-300 focus-within:border-primary/50 focus-within:bg-card-bg focus-within:ring-2 focus-within:ring-primary/10 rounded-full px-4 py-1.5 shadow-xs transition-all duration-300">
              
              {/* Attachment Button on left */}
              <button 
                type="button"
                onClick={() => alert("Upload PDF or image notes to context (In Development)")}
                className="p-2 hover:bg-slate-100/80 rounded-full transition-colors text-slate-400 hover:text-primary cursor-pointer shrink-0"
                title="Add Attachment"
              >
                <Plus className="h-4.5 w-4.5" />
              </button>

              {/* Text Area Input (single line with auto expansion) */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-slate-800 border-none outline-none resize-none text-xs px-3 py-2.5 placeholder-slate-400 focus:ring-0 focus:outline-none leading-relaxed font-semibold align-middle"
                style={{ maxHeight: '90px' }}
              />

              {/* Right tools and buttons */}
              <div className="flex items-center space-x-2 shrink-0 select-none">
                
                {/* Tiny model selector */}
                <div className="relative border-r border-slate-200/80 pr-2 hidden sm:block">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-transparent text-[10px] text-slate-450 hover:text-primary font-extrabold outline-none border-none focus:ring-0 cursor-pointer pr-3.5 appearance-none"
                  >
                    <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>

                {/* Mic Button */}
                <button 
                  type="button" 
                  onClick={() => setIsRecording(true)}
                  className="p-2 hover:bg-slate-100/80 rounded-full text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  title="Voice Input"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                {/* Signature Audio Waveform / Send Action Circle Button */}
                <button
                  type="button"
                  onClick={input.trim() ? () => handleSubmit() : () => alert("Audio output waveform analyzer. Voice activation features are in development.")}
                  disabled={input.trim() ? loading : false}
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-white shrink-0 transition-all duration-300 shadow-xs cursor-pointer ${
                    input.trim()
                      ? 'bg-accent hover:bg-accent-dark hover:scale-105 active:scale-95'
                      : 'bg-primary hover:bg-primary/95 hover:scale-105 active:scale-95'
                  }`}
                  title={input.trim() ? "Send Message" : "Voice Waveform"}
                >
                  {input.trim() ? (
                    <Send className="h-3.5 w-3.5" />
                  ) : (
                    <svg className="h-4 w-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M17 7v10M7 7v10M22 10v4M2 10v4" />
                    </svg>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
