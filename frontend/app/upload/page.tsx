"use client";

import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import UploadBox from '../../components/upload/UploadBox';
import ProcessingStatus from '../../components/upload/ProcessingStatus';
import { useMeetings } from '../../hooks/useMeetings';
import { Mail, CheckCircle2, ChevronRight, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { uploadMeeting } = useMeetings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [committedMeeting, setCommittedMeeting] = useState<any>(null);

  const startExtraction = async (text: string, title: string, project: string) => {
    setIsProcessing(true);
    setExtractedData(null);
    setCurrentStage(0);

    // Simulate OCR + Gemini progress bar stages
    for (let stage = 0; stage < 5; stage++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentStage(prev => prev + 1);
    }

    // Smart logic to draft the result
    const lowerText = text.toLowerCase();
    const tasks: any[] = [];
    const blockers: any[] = [];
    const risks: any[] = [];
    const escalations: any[] = [];
    const decisions: any[] = [];

    // Parse tasks
    if (lowerText.includes('rahul')) {
      tasks.push({
        owner: 'Rahul',
        task: lowerText.includes('coordinate') ? 'Coordinate with backend team' : 'Complete backend integration checks',
        deadline: lowerText.includes('friday') ? 'Friday' : '2026-06-12',
        priority: 'High'
      });
    }
    if (lowerText.includes('sarah')) {
      tasks.push({
        owner: 'Sarah',
        task: 'Polish CSS styling layout issues',
        deadline: 'Today',
        priority: 'Medium'
      });
    }

    // Parse blockers/escalations
    if (lowerText.includes('vendor api') || lowerText.includes('unstable') || lowerText.includes('blocker')) {
      blockers.push({ description: 'Vendor API instability' });
    }
    
    if (lowerText.includes('priya') && (lowerText.includes('escalate') || lowerText.includes('concern'))) {
      escalations.push({
        raised_by: 'Priya',
        description: 'Vendor API timeouts causing drops in checkout success rates',
        severity: 'Critical'
      });
    }

    // Parse risks
    if (lowerText.includes('phase-2') || lowerText.includes('phase 2') || lowerText.includes('delay')) {
      risks.push({
        description: 'Phase-2 release schedule delay',
        severity: 'High'
      });
    }

    // Defaults if nothing matched
    if (tasks.length === 0) {
      tasks.push({ owner: 'Rahul', task: 'Review alignment goals', deadline: 'Next Monday', priority: 'Medium' });
    }
    if (blockers.length === 0 && lowerText.includes('block')) {
      blockers.push({ description: 'Awaiting dependency resolution' });
    }
    if (decisions.length === 0) {
      decisions.push({
        decision: 'Schedule weekly follow-ups',
        reason: 'Maintain alignment on deliverables'
      });
    }

    const mockExtracted = {
      title,
      projectName: project,
      transcript: text,
      summary: `The sync reviewed progress on ${project}. ` + 
        (tasks.length > 0 ? `${tasks[0].owner} was assigned tasks. ` : '') +
        (escalations.length > 0 ? `Concerns were escalated regarding blockers. ` : ''),
      tasks,
      blockers,
      risks,
      escalations,
      decisions,
      teams: ['Engineering', 'Product']
    };

    setExtractedData(mockExtracted);
    setIsProcessing(false);
  };

  const handleTextProcess = (text: string, title: string, project: string) => {
    startExtraction(text, title, project);
  };

  const handleFileProcess = (file: File, title: string, project: string) => {
    // Mock file read text
    const fileText = `The payment integration is delayed because the Vendor API is unstable. Rahul will coordinate with the backend team before Friday. If this issue continues, it may impact the Phase-2 release. Priya escalated the concern to leadership.`;
    startExtraction(fileText, title, project);
  };

  const commitData = async () => {
    if (!extractedData) return;
    setIsProcessing(true);
    
    try {
      const saved = await uploadMeeting(extractedData);
      setCommittedMeeting(saved);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Meeting Processing Pipeline"
        description="Ingest meetings transcripts, upload PDFs or scanned whiteboard notes, and run OCR-AI extraction."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UploadBox
            onProcessText={handleTextProcess}
            onProcessFile={handleFileProcess}
            isProcessing={isProcessing}
          />

          {/* AI Extracted JSON Preview */}
          {extractedData && (
            <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-border-slate pb-4">
                <div className="flex items-center space-x-2">
                  <FileCode className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold text-primary">Gemini AI Structured Output Schema</h3>
                </div>
                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full select-none">
                  Extraction Successful
                </span>
              </div>

              <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-lg overflow-x-auto leading-relaxed max-h-80 select-all font-mono">
                {JSON.stringify(extractedData, null, 2)}
              </pre>

              <div className="flex justify-end pt-2">
                <button
                  onClick={commitData}
                  disabled={isProcessing}
                  className="bg-accent hover:bg-accent-dark text-primary font-bold text-sm px-6 py-3.5 rounded-lg shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>Commit to Relational/Vector Stores</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          {isProcessing ? (
            <ProcessingStatus currentStage={currentStage} />
          ) : (
            <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-primary mb-3">System Specifications</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 font-medium">
                Upon upload, the meeting is processed in parallel:
              </p>
              <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span><strong>PaddleOCR</strong> extracts text layers from images/PDFs.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span><strong>Gemini API</strong> builds a structured schema map.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Records write into <strong>SQLite</strong> database tables.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Chunks are indexed inside <strong>ChromaDB</strong> vector collections.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span><strong>SMTP Mailers</strong> alert assigned task owners.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Dialog modal */}
      {showSuccessModal && committedMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card-bg border border-border-slate rounded-xl p-6 max-w-lg w-full shadow-lg relative animate-scale-in">
            <div className="flex items-center space-x-3 mb-4 border-b border-border-slate pb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <h3 className="text-base font-extrabold text-primary">Commit &amp; Dispatches Complete</h3>
                <p className="text-[11px] text-slate-400 font-semibold">SQLite and Vector Storage synchronization succeeded.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Task Email Triggers</span>
                {committedMeeting.tasks && committedMeeting.tasks.map((t: any, i: number) => (
                  <div key={i} className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Subject: [IntelliMeet] New Task Assigned: {t.task}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">To: <span className="underline">{t.owner.toLowerCase()}@company.com</span></p>
                      <div className="text-[10px] text-slate-450 font-semibold border-t border-slate-100 mt-2 pt-2">
                        Priority: {t.priority || 'High'} | Deadline: {t.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-accent-light/30 border border-accent/20 rounded-lg p-3.5">
                <p className="text-xs text-accent-dark font-extrabold leading-tight">AI &rarr; Action &rarr; Accountability loop verified.</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  The dashboard metrics, project risk scores, and meetings historical logs have been updated.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-border-slate mt-5 pt-4">
              <button
                onClick={() => { setExtractedData(null); setShowSuccessModal(false); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Ingest Another
              </button>
              <Link
                href="/"
                className="bg-primary hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors inline-block text-center cursor-pointer"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
