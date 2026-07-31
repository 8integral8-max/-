import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';

export async function parseUploadedFiles(files: File[]): Promise<StudentRecord[]> {
  const allRows: Array<{ studentId: string; name: string; activityData: string }> = [];

  for (const file of files) {
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

          for (const row of rawJson) {
            let studentId = '';
            let name = '';
            let activityData = '';

            for (const [key, val] of Object.entries(row)) {
              const k = key.trim();
              const v = String(val).trim();

              if (!studentId && (k.includes('학번') || k.includes('ID') || k.includes('번호'))) {
                studentId = v.replace(/\.0$/, '');
              } else if (!name && (k.includes('이름') || k.includes('성명') || k.includes('학생'))) {
                name = v;
              } else if (k.includes('활동') || k.includes('자료') || k.includes('내용') || k.includes('특기') || k.includes('세부')) {
                if (v && v !== 'nan') {
                  activityData += (activityData ? '\n' : '') + v;
                }
              }
            }

            // Fallback column positions if header didn't match keywords
            if (!studentId && !name && !activityData) {
              const values = Object.values(row).map(v => String(v).trim());
              if (values.length >= 3) {
                studentId = values[0].replace(/\.0$/, '');
                name = values[1];
                activityData = values.slice(2).join(' ');
              }
            }

            if (studentId || name || activityData) {
              allRows.push({ studentId, name, activityData });
            }
          }
        }
      } else if (fileName.endsWith('.txt')) {
        const text = await file.text();
        const lines = text.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Split by tab or comma or multiple spaces
          const parts = trimmed.includes('\t')
            ? trimmed.split('\t')
            : trimmed.includes(',')
            ? trimmed.split(',')
            : trimmed.split(/\s{2,}/);

          if (parts.length >= 3) {
            allRows.push({
              studentId: parts[0].trim().replace(/\.0$/, ''),
              name: parts[1].trim(),
              activityData: parts.slice(2).join(' ').trim()
            });
          } else if (parts.length === 2) {
            allRows.push({
              studentId: parts[0].trim().replace(/\.0$/, ''),
              name: '',
              activityData: parts[1].trim()
            });
          } else {
            allRows.push({
              studentId: '',
              name: '',
              activityData: trimmed
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error reading file ${file.name}:`, err);
    }
  }

  // Group by studentId + name
  const groupedMap = new Map<string, { studentId: string; name: string; activities: string[] }>();

  allRows.forEach(row => {
    const key = `${row.studentId}_${row.name}`.trim();
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        studentId: row.studentId || '미지정',
        name: row.name || '미지정',
        activities: []
      });
    }
    if (row.activityData && row.activityData !== 'nan') {
      groupedMap.get(key)!.activities.push(row.activityData);
    }
  });

  const result: StudentRecord[] = [];
  let index = 1;
  groupedMap.forEach(group => {
    result.push({
      id: `student-${index++}`,
      studentId: group.studentId,
      name: group.name,
      activityData: group.activities.join('\n')
    });
  });

  return result;
}

export function exportToExcel(data: Array<{ studentId: string; content: string }>, fileName = 'NEIS_과세특_최종결과.xlsx') {
  const exportRows = data.map(item => ({
    '학번': item.studentId,
    '과목별 세부능력 및 특기사항': item.content
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // 학번
    { wch: 100 } // 과세특
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '과세특_제출용');

  XLSX.writeFile(workbook, fileName);
}
