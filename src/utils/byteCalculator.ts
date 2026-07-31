/**
 * NEIS 바이트(Byte) 계산 함수
 * Excel 수식 LENB(C2)*2 - LEN(C2) 및 NEIS 규정 (완성형 한글 3Byte, ASCII 1Byte, 줄바꿈 CRLF 2Byte)
 */
export function calcNeisBytes(text: string): number {
  if (!text) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      count += 2; // 줄바꿈(CRLF)
    } else if (text.charCodeAt(i) > 127) {
      count += 3; // 한글/전각특수문자
    } else {
      count += 1; // 영문, 숫자, 공백, ASCII
    }
  }
  return count;
}

export type ByteStatus = 'optimal' | 'under' | 'over' | 'empty';

export function getByteStatus(bytes: number, min = 1400, max = 1500): ByteStatus {
  if (bytes === 0) return 'empty';
  if (bytes > max) return 'over';
  if (bytes >= min) return 'optimal';
  return 'under';
}

export function getByteBadgeStyle(status: ByteStatus): string {
  switch (status) {
    case 'optimal':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'over':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'under':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-300';
  }
}
