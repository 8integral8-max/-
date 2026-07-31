/**
 * External API Key Encryption & Local Storage Manager
 * Uses Web Crypto API (AES-GCM) for local drive saving/loading & localStorage persistence
 */

const STORAGE_KEY = 'neis_encrypted_gemini_key_v1';
const DEFAULT_SALT = 'NEIS-GEMINI-SALT-2026';

// Helper to derive AES-GCM CryptoKey from a string password/passphrase
async function getCryptoKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(DEFAULT_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt string payload using Web Crypto API
 */
export async function encryptText(text: string, passphrase = 'NEIS_DEFAULT_KEY'): Promise<string> {
  if (!text) return '';
  try {
    const key = await getCryptoKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to Base64
    let binary = '';
    const bytes = new Uint8Array(combined);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.warn('Fallback obfuscation used:', err);
    return btoa(encodeURIComponent(text));
  }
}

/**
 * Decrypt string payload using Web Crypto API
 */
export async function decryptText(encryptedBase64: string, passphrase = 'NEIS_DEFAULT_KEY'): Promise<string> {
  if (!encryptedBase64) return '';
  try {
    const binary = atob(encryptedBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length <= 12) {
      return decodeURIComponent(atob(encryptedBase64));
    }

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const key = await getCryptoKey(passphrase);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    try {
      return decodeURIComponent(atob(encryptedBase64));
    } catch {
      return '';
    }
  }
}

/**
 * Save Encrypted API Key to Local Storage
 */
export async function saveLocalApiKey(apiKey: string, passphrase = 'NEIS_DEFAULT_KEY'): Promise<void> {
  if (!apiKey.trim()) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const encrypted = await encryptText(apiKey.trim(), passphrase);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    payload: encrypted,
    updatedAt: new Date().toISOString(),
    isEncrypted: true
  }));
}

/**
 * Load Encrypted API Key from Local Storage
 */
export async function loadLocalApiKey(passphrase = 'NEIS_DEFAULT_KEY'): Promise<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return '';
  try {
    const data = JSON.parse(raw);
    if (data && data.payload) {
      return await decryptText(data.payload, passphrase);
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Export Encrypted Key File to User Local Drive (.json or .enc)
 */
export async function exportEncryptedKeyFile(apiKey: string, passphrase = 'NEIS_DEFAULT_KEY', fileName = 'neis_gemini_key.enc'): Promise<void> {
  if (!apiKey.trim()) return;

  const encrypted = await encryptText(apiKey.trim(), passphrase);
  const fileData = {
    system: 'NEIS 과세특 AI 생성 시스템',
    version: '1.0',
    createdAt: new Date().toISOString(),
    encryptedPayload: encrypted,
    keyLength: apiKey.length,
    keyPrefix: apiKey.slice(0, 4) + '...' + apiKey.slice(-4)
  };

  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import Encrypted Key File from User Local Drive
 */
export async function importEncryptedKeyFile(file: File, passphrase = 'NEIS_DEFAULT_KEY'): Promise<string> {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (data.encryptedPayload) {
      const decrypted = await decryptText(data.encryptedPayload, passphrase);
      return decrypted;
    }
    // If raw text key file
    if (text.trim().startsWith('AIzaSy')) {
      return text.trim();
    }
    throw new Error('올바른 암호화 키 파일 형식이 아닙니다.');
  } catch (err: any) {
    if (text.trim().startsWith('AIzaSy')) {
      return text.trim();
    }
    throw new Error('파일 해석 중 오류가 발생했습니다: ' + err.message);
  }
}

/**
 * Test Connection with Gemini API via backend /api/test-key
 */
export async function testApiKeyConnection(customApiKey: string, modelName = 'gemini-3.6-flash'): Promise<{
  status: 'success' | 'error';
  latencyMs: number;
  message: string;
  modelUsed: string;
}> {
  const startTime = Date.now();
  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customApiKey, modelName })
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    if (!res.ok) {
      return {
        status: 'error',
        latencyMs,
        message: data.error || '연결 테스트 실패',
        modelUsed: modelName
      };
    }

    return {
      status: 'success',
      latencyMs,
      message: data.message || 'API 연결 성공! 정상 응답을 확인했습니다.',
      modelUsed: data.modelUsed || modelName
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      status: 'error',
      latencyMs,
      message: err.message || '서버 통신 실패',
      modelUsed: modelName
    };
  }
}
