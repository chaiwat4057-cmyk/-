/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentRecord, QuestionItem } from '../data/defaultScores';
import { getAccessToken } from './firebaseAuth';

export interface SheetImportResult {
  records: StudentRecord[];
  questions: QuestionItem[];
  sheetTitle?: string;
  sourceType: 'google_sheets' | 'csv';
}

/**
 * Extracts spreadsheetId from Google Sheets URL or raw ID
 * Examples:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
 * 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 */
export function extractSpreadsheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
}

/**
 * Fetches Google Sheet metadata and rows using the OAuth access token
 */
export async function fetchGoogleSheetData(
  spreadsheetInput: string,
  customRange?: string
): Promise<SheetImportResult> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetInput);
  if (!spreadsheetId) {
    throw new Error('กรุณาระบุ URL หรือ Spreadsheet ID ที่ถูกต้อง');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาเข้าสู่ระบบด้วย Google ก่อนเพื่อเข้าถึง Google Sheets');
  }

  // 1. Fetch metadata to get title and first sheet name if range not specified
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!metaRes.ok) {
    const errorData = await metaRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `ไม่สามารถเข้าถึง Google Sheets ได้ (รหัสข้อผิดพลาด: ${metaRes.status})`
    );
  }

  const metaData = await metaRes.json();
  const sheetTitle = metaData?.properties?.title || 'Google Sheet';
  const firstSheetName = metaData?.sheets?.[0]?.properties?.title || 'Sheet1';
  const targetRange = customRange || `${firstSheetName}!A1:AZ200`;

  // 2. Fetch sheet values
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      targetRange
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!valuesRes.ok) {
    const errorData = await valuesRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `ไม่สามารถอ่านข้อมูลเซลล์จาก Google Sheets ได้ (${valuesRes.status})`
    );
  }

  const valuesData = await valuesRes.json();
  const rows: string[][] = valuesData.values || [];

  if (rows.length < 2) {
    throw new Error('ไม่พบแถวข้อมูลในตารางสเปรดชีต (ต้องมีหัวตารางและแถวข้อมูลนักศึกษา)');
  }

  return parseSheetRows(rows, sheetTitle, 'google_sheets');
}

/**
 * Parses 2D array of rows into StudentRecord and QuestionItem
 */
export function parseSheetRows(
  rows: string[][],
  sheetTitle: string = 'Imported Sheet',
  sourceType: 'google_sheets' | 'csv' = 'google_sheets'
): SheetImportResult {
  const header = rows[0];
  let timeCol = -1;
  let scoreCol = -1;
  let scaledCol = -1;
  let nameCol = -1;
  let idCol = -1;
  const questionStartIndex = 5;

  header.forEach((h, idx) => {
    const lower = (h || '').toLowerCase().trim();
    if (lower.includes('ประทับเวลา') || lower.includes('timestamp') || lower.includes('time')) {
      if (timeCol === -1) timeCol = idx;
    } else if (lower.includes('คะแนน') || lower.includes('score')) {
      if (scoreCol === -1) scoreCol = idx;
    } else if (lower.includes('column 35') || lower.includes('เก็บ') || lower.includes('scaled')) {
      if (scaledCol === -1) scaledCol = idx;
    } else if (lower.includes('ชื่อ') || lower.includes('name')) {
      if (nameCol === -1) nameCol = idx;
    } else if (lower.includes('รหัส') || lower.includes('id') || lower.includes('student')) {
      if (idCol === -1) idCol = idx;
    }
  });

  // Defaults if standard form layout
  if (timeCol === -1) timeCol = 0;
  if (scoreCol === -1) scoreCol = 1;
  if (scaledCol === -1) scaledCol = 2;
  if (nameCol === -1) nameCol = 3;
  if (idCol === -1) idCol = 4;

  const startQ = Math.max(timeCol, scoreCol, scaledCol, nameCol, idCol) + 1;
  const questions: QuestionItem[] = [];

  for (let c = startQ; c < header.length; c++) {
    const title = header[c] || `คำถามข้อที่ ${c - startQ + 1}`;
    questions.push({
      id: c - startQ + 1,
      fullTitle: title,
      text: title.replace(/^\d+\.\s*/, '').replace(/^"+|"+$/g, '').trim(),
    });
  }

  const records: StudentRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || !row[nameCol] && !row[idCol]) continue;

    const rawScore = (row[scoreCol] || '').toString();
    let scoreNum = 0;
    let maxScore = 30;

    if (rawScore.includes('/')) {
      const parts = rawScore.split('/');
      scoreNum = parseFloat(parts[0].trim()) || 0;
      maxScore = parseFloat(parts[1].trim()) || 30;
    } else {
      scoreNum = parseFloat(rawScore) || 0;
    }

    const rawScaled = (row[scaledCol] || '').toString();
    const scaledScore =
      parseFloat(rawScaled) || Math.round((scoreNum / (maxScore || 30)) * 20 * 100) / 100;

    const studentName = (row[nameCol] || '').toString().trim();
    const studentId = (row[idCol] || '').toString().trim();
    const answers = row.slice(startQ);

    records.push({
      id: `imported_${r}`,
      timestamp: (row[timeCol] || new Date().toLocaleString('th-TH')).toString(),
      score: scoreNum,
      maxScore: maxScore,
      scaledScore: scaledScore,
      studentName: studentName || 'ไม่ระบุชื่อ',
      studentId: studentId || `ID_${r}`,
      answers: answers.map((a) => (a || '').toString()),
    });
  }

  return {
    records,
    questions,
    sheetTitle,
    sourceType,
  };
}

/**
 * Parses raw CSV string to rows
 */
export function parseCSVText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}
