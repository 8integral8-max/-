import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  ShieldCheck,
  Lock,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Check,
  Zap,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  FileKey,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import {
  saveLocalApiKey,
  loadLocalApiKey,
  exportEncryptedKeyFile,
  importEncryptedKeyFile,
  testApiKeyConnection
} from '../utils/apiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  modelName: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  modelName
}) => {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    latencyMs?: number;
    message?: string;
    modelUsed?: string;
  }>({ status: 'idle' });

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Load from local storage on modal open
  useEffect(() => {
    setInputKey(apiKey || '');
    setTestResult({ status: 'idle' });
  }, [apiKey, isOpen]);

  const AI_STUDIO_URL = 'https://aistudio.google.com/app/apikey';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(AI_STUDIO_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!inputKey.trim()) {
      setTestResult({
        status: 'error',
        message: 'API 키를 먼저 입력해주세요.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle' });

    const res = await testApiKeyConnection(inputKey.trim(), modelName);
    setTestResult({
      status: res.status,
      latencyMs: res.latencyMs,
      message: res.message,
      modelUsed: res.modelUsed
    });
    setIsTesting(false);
  };

  const handleSaveAndClose = async () => {
    const trimmed = inputKey.trim();
    await saveLocalApiKey(trimmed, passphrase || undefined);
    onSaveApiKey(trimmed);
    setSaveMessage('로컬 브라우저에 암호화 저장되었습니다.');
    setTimeout(() => {
      setSaveMessage('');
      onClose();
    }, 600);
  };

  const handleExportFile = async () => {
    if (!inputKey.trim()) {
      alert('저장할 API 키를 입력해주세요.');
      return;
    }
    await exportEncryptedKeyFile(inputKey.trim(), passphrase || undefined, 'neis_gemini_key.enc');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedKey = await importEncryptedKeyFile(file, passphrase || undefined);
      if (importedKey) {
        setInputKey(importedKey);
        setTestResult({ status: 'idle' });
        alert('암호화 키 파일이 성공적으로 로드되었습니다!');
      }
    } catch (err: any) {
      alert('키 파일 복호화 실패: ' + err.message);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleClearKey = async () => {
    if (window.confirm('저장된 외장 API 키를 삭제하시겠습니까? (서버 환경변수 키로 전환됩니다)')) {
      setInputKey('');
      await saveLocalApiKey('');
      onSaveApiKey('');
      setTestResult({ status: 'idle' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-[#1F497D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">외장 Gemini API 키 설정 및 로컬 암호화 저장</h3>
              <p className="text-xs text-sky-100/80">
                사용자 개인 로컬 드라이브 암호화 보관 · 연결 테스트 · AI Studio 키 발급 안내
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-slate-800">

          {/* Section 1: Copy-Paste Link & AI Studio Creation Guide */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1F497D]">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                Google AI Studio에서 무료 API 키 발급받기
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-sky-100 text-[#1F497D] border border-sky-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? '링크 복사됨!' : '주소 복사'}
                </button>
                <a
                  href={AI_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#1F497D] hover:bg-[#17375E] text-white rounded text-xs font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  AI Studio 바로가기
                </a>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="bg-white p-2.5 rounded border border-sky-200/60">
                <span className="font-bold text-[#1F497D] block mb-0.5">Step 1. 사이트 이동</span>
                상단 버튼을 눌러 Google AI Studio에 구글 계정으로 로그인합니다.
              </div>
              <div className="bg-white p-2.5 rounded border border-sky-200/60">
                <span className="font-bold text-[#1F497D] block mb-0.5">Step 2. API 키 생성</span>
                'Create API key' 버튼을 클릭하여 새 키(<code className="bg-slate-100 px-1 rounded">AIzaSy...</code>)를 발급받습니다.
              </div>
              <div className="bg-white p-2.5 rounded border border-sky-200/60">
                <span className="font-bold text-[#1F497D] block mb-0.5">Step 3. 본 시스템 입력</span>
                발급받은 키를 아래 입력란에 복사·붙여넣기 후 연결 테스트를 수행합니다.
              </div>
            </div>
          </div>

          {/* Section 2: API Key Input Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono pl-3 pr-20 py-2.5 border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>※ 입력된 키는 사용자 웹브라우저 로컬 암호화 영역에만 보관됩니다.</span>
              {inputKey && (
                <button
                  onClick={handleClearKey}
                  className="text-red-600 hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> 키 초기화
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Connection Test Popup / Result Drawer */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">API 키 실시간 연결 테스트</span>
              </div>
              <button
                disabled={isTesting || !inputKey.trim()}
                onClick={handleTestConnection}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                  !inputKey.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1F497D] hover:bg-[#17375E] text-white shadow-sm'
                }`}
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                )}
                {isTesting ? '테스트 중...' : '연결 테스트 실행'}
              </button>
            </div>

            {/* Test Result Display */}
            {testResult.status !== 'idle' && (
              <div
                className={`p-3 rounded-md text-xs border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {testResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    {testResult.status === 'success' ? '연결 성공' : '연결 실패'}
                  </span>
                  {testResult.latencyMs !== undefined && (
                    <span className="font-mono bg-white/80 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      응답 속도: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {testResult.message}
                </p>
                {testResult.modelUsed && (
                  <span className="text-[10px] text-slate-500 block mt-1">
                    검증 모델: {testResult.modelUsed}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Local Drive Encrypted Export / Import */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lock className="w-4 h-4 text-[#1F497D]" />
              로컬 드라이브 암호화 파일 보관 (AES-256 Web Crypto)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  암호화 암호 (선택사항)
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="미입력 시 표준 키 암호화"
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleExportFile}
                  disabled={!inputKey.trim()}
                  className={`flex-1 px-3 py-2 border rounded text-xs font-bold flex items-center justify-center gap-1 transition ${
                    !inputKey.trim()
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white hover:bg-slate-100 text-[#1F497D] border-slate-300 shadow-sm'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  파일로 내보내기 (.enc)
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".enc,.json,.txt"
                  onChange={handleImportFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  파일 불러오기
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              ※ 내보낸 <code className="bg-slate-200 px-1 rounded">.enc</code> 암호화 키 파일은 PC 로컬 디렉토리에 보관 후 언제든지 불러올 수 있습니다.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-emerald-700 font-bold">
            {saveMessage}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              닫기
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-[#1F497D] hover:bg-[#17375E] text-white rounded-md text-xs font-bold transition shadow-sm"
            >
              설정 저장 및 적용
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
