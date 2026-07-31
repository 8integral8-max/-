import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ConfigModal } from './components/ConfigModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { UploadTab } from './components/UploadTab';
import { ResultsTab } from './components/ResultsTab';
import { RulesTab } from './components/RulesTab';
import { StudentRecord, GenerationResult, SystemConfig } from './types';
import { calcNeisBytes } from './utils/byteCalculator';
import { loadLocalApiKey } from './utils/apiKeyManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'rules'>('upload');
  const [configOpen, setConfigOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const [config, setConfig] = useState<SystemConfig>({
    subject: '수학',
    modelName: 'gemini-3.6-flash',
    targetMinBytes: 1400,
    targetMaxBytes: 1500,
    customApiKey: ''
  });

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);

  // Load saved encrypted API Key from local storage on load
  useEffect(() => {
    (async () => {
      const savedKey = await loadLocalApiKey();
      if (savedKey) {
        setConfig(prev => ({ ...prev, customApiKey: savedKey }));
      }
    })();
  }, []);

  // Batch generation controls
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [currentStudentInfo, setCurrentStudentInfo] = useState('');
  const stopRequestedRef = useRef(false);

  // Batch generation runner
  const handleStartGeneration = async () => {
    if (students.length === 0) return;

    setIsGenerating(true);
    stopRequestedRef.current = false;
    setProgressCurrent(0);
    setProgressTotal(students.length);

    const newResults: GenerationResult[] = [];

    for (let i = 0; i < students.length; i++) {
      if (stopRequestedRef.current) {
        break;
      }

      const student = students[i];
      setProgressCurrent(i + 1);
      setCurrentStudentInfo(`과세특 생성 중 (${i + 1}/${students.length}): [${student.studentId}] ${student.name}`);

      try {
        const response = await fetch('/api/generate-neis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: student.studentId,
            studentName: student.name,
            activityData: student.activityData,
            subject: config.subject,
            modelName: config.modelName,
            customPrompt: config.customPrompt,
            customApiKey: config.customApiKey
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || '생성 실패');
        }

        const data = await response.json();
        const content = data.result || '';
        const bytes = calcNeisBytes(content);

        const resultItem: GenerationResult = {
          studentId: student.studentId,
          name: student.name,
          activityData: student.activityData,
          content,
          bytes,
          status: 'completed'
        };

        newResults.push(resultItem);
        setResults([...newResults]);
      } catch (err: any) {
        console.error(`Error generating for ${student.studentId} ${student.name}:`, err);
        const errorItem: GenerationResult = {
          studentId: student.studentId,
          name: student.name,
          activityData: student.activityData,
          content: `생성 중 오류 발생: ${err.message || 'API 호출 실패'}`,
          bytes: 0,
          status: 'error',
          errorMessage: err.message
        };
        newResults.push(errorItem);
        setResults([...newResults]);
      }

      // Small delay between requests
      await new Promise(res => setTimeout(res, 300));
    }

    setIsGenerating(false);
    if (!stopRequestedRef.current && newResults.length > 0) {
      setActiveTab('results');
    }
  };

  const handleStopGeneration = () => {
    stopRequestedRef.current = true;
    setIsGenerating(false);
  };

  // Regenerate a single student
  const handleRegenerateSingle = async (studentId: string, name: string, activityData: string) => {
    try {
      const response = await fetch('/api/generate-neis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          studentName: name,
          activityData,
          subject: config.subject,
          modelName: config.modelName,
          customPrompt: config.customPrompt,
          customApiKey: config.customApiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '생성 실패');
      }

      const data = await response.json();
      const content = data.result || '';
      const bytes = calcNeisBytes(content);

      setResults(prev =>
        prev.map(r =>
          r.studentId === studentId
            ? {
                ...r,
                content,
                bytes,
                status: 'completed'
              }
            : r
        )
      );
    } catch (err: any) {
      alert(`[${studentId} ${name}] 재생성 중 오류: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex flex-col antialiased">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resultCount={results.length}
        configOpen={configOpen}
        setConfigOpen={setConfigOpen}
        setApiKeyModalOpen={setApiKeyModalOpen}
        hasCustomApiKey={Boolean(config.customApiKey?.trim())}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'upload' && (
          <UploadTab
            students={students}
            setStudents={setStudents}
            config={config}
            onStartGeneration={handleStartGeneration}
            isGenerating={isGenerating}
            onStopGeneration={handleStopGeneration}
            progressCurrent={progressCurrent}
            progressTotal={progressTotal}
            currentStudentInfo={currentStudentInfo}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            results={results}
            setResults={setResults}
            config={config}
            onRegenerateSingle={handleRegenerateSingle}
          />
        )}

        {activeTab === 'rules' && <RulesTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          나이스(NEIS) 과목별 세부능력 및 특기사항 생성 시스템 · 교육부 훈령 기재요령 준수 · Google Gemini AI 지원
        </p>
      </footer>

      {/* Settings Modal */}
      <ConfigModal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        config={config}
        setConfig={setConfig}
      />

      {/* External API Key Management Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={config.customApiKey || ''}
        onSaveApiKey={(key) => setConfig(prev => ({ ...prev, customApiKey: key }))}
        modelName={config.modelName}
      />

    </div>
  );
}
