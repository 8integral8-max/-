export interface StudentRecord {
  id: string; // Unique row ID
  studentId: string; // 학번 (e.g. "10101")
  name: string; // 이름 (e.g. "홍길동")
  activityData: string; // 학생 활동 자료
}

export interface GenerationResult {
  studentId: string; // 학번
  name: string; // 이름
  activityData: string; // 원본 활동 자료
  content: string; // 생성된 과세특 문구
  bytes: number; // NEIS 바이트 수
  status: 'pending' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface SystemConfig {
  subject: string;
  modelName: 'gemini-3.6-flash' | 'gemini-3.1-pro';
  targetMinBytes: number; // 1400
  targetMaxBytes: number; // 1500
  customPrompt?: string;
  customApiKey?: string;
  apiKeySource?: 'user_local' | 'server_env' | 'none';
}
