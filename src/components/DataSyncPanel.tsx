/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  ShieldCheck,
  Database,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout } from '../services/firebaseAuth';
import { fetchGoogleSheetData, parseCSVText, parseSheetRows } from '../services/googleSheets';
import { StudentRecord, QuestionItem, DEFAULT_RECORDS, DEFAULT_QUESTIONS } from '../data/defaultScores';
import { ClassStatistics } from '../utils/statistics';

interface DataSyncPanelProps {
  currentUser: User | null;
  onUserUpdate: (user: User | null) => void;
  onDataLoaded: (records: StudentRecord[], questions: QuestionItem[], sourceTitle: string) => void;
  currentSourceTitle: string;
  totalRecordsCount: number;
  classStats: ClassStatistics;
}

export const DataSyncPanel: React.FC<DataSyncPanelProps> = ({
  currentUser,
  onUserUpdate,
  onDataLoaded,
  currentSourceTitle,
  totalRecordsCount,
  classStats,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [customRange, setCustomRange] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onUserUpdate(res.user);
        setStatusMessage({
          text: `เข้าสู่ระบบสำเร็จในชื่อ ${res.user.displayName || res.user.email}`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      onUserUpdate(null);
      setStatusMessage({ text: 'ออกจากระบบ Google เรียบร้อยแล้ว', type: 'success' });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSyncGoogleSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setStatusMessage({
        text: 'กรุณากรอก Google Sheets URL หรือ Spreadsheet ID',
        type: 'error',
      });
      return;
    }

    if (!currentUser) {
      setStatusMessage({
        text: 'กรุณาคลิก "Sign in with Google" ก่อน เพื่อให้ระบบได้รับอนุญาตอ่านข้อมูลจาก Google Sheets',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await fetchGoogleSheetData(sheetUrl.trim(), customRange.trim() || undefined);
      onDataLoaded(result.records, result.questions, result.sheetTitle || 'Google Sheets');
      setStatusMessage({
        text: `ดึงข้อมูลจาก Google Sheets สำเร็จ! โหลดข้อมูลนักศึกษา ${result.records.length} รายการ`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSVText(text);
        if (rows.length < 2) {
          throw new Error('ไฟล์ CSV ไม่มีแถวข้อมูลที่สมบูรณ์');
        }
        const result = parseSheetRows(rows, file.name, 'csv');
        onDataLoaded(result.records, result.questions, file.name);
        setStatusMessage({
          text: `นำเข้าไฟล์ CSV สำเร็จ! โหลดข้อมูลนักศึกษา ${result.records.length} รายการ`,
          type: 'success',
        });
      } catch (err: any) {
        setStatusMessage({
          text: err.message || 'ไม่สามารถอ่านไฟล์ CSV ได้',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setStatusMessage({ text: 'เกิดข้อผิดพลาดในการอ่านไฟล์', type: 'error' });
      setIsLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleResetToDefault = () => {
    onDataLoaded(
      DEFAULT_RECORDS,
      DEFAULT_QUESTIONS,
      'ข้อมูลชั้นเรียนตัวอย่าง (54 ครั้งที่ส่งตรวจ)'
    );
    setStatusMessage({
      text: 'รีเซ็ตกลับเป็นข้อมูลชั้นเรียนตั้งต้นเรียบร้อยแล้ว',
      type: 'success',
    });
  };

  const handleExportAnonymizedStats = () => {
    const statsData = {
      course: 'การเข้าใจดิจิทัลและการรู้เท่าทันสื่อ',
      timestamp: new Date().toISOString(),
      privacy: 'Anonymized Class Aggregate (No Student Identifiers Included)',
      totalSubmissions: totalRecordsCount,
      uniqueStudentsCount: classStats.uniqueStudentsCount,
      meanScore: classStats.mean,
      medianScore: classStats.median,
      modeScore: classStats.mode,
      maxScore: classStats.max,
      minScore: classStats.min,
      standardDeviation: classStats.standardDeviation,
      passRatePercent: classStats.passRate,
    };

    const blob = new Blob([JSON.stringify(statsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-benchmarks-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              การจัดการแหล่งข้อมูล & Google Sheets
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              เชื่อมต่อ Google Sheets หรือนำเข้าข้อมูลคะแนน
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ปัจจุบันกำลังแสดงผลข้อมูลจาก:{' '}
              <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                {currentSourceTitle}
              </strong>{' '}
              ({totalRecordsCount} รายการ)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>รีเซ็ตเป็นข้อมูลเดิม</span>
            </button>
            <button
              onClick={handleExportAnonymizedStats}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>ส่งออกสถิติภาพรวม</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Google Sheets Integration */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ดึงคะแนนสดจาก Google Sheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เข้าสู่ระบบ Google เพื่ออ่านข้อมูลจากสเปรดชีตของคุณแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Google Sign In status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              สถานะการอนุญาต Google Account:
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName || 'Google User'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1 text-xs rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div>
                {/* Official Material Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-medium text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google เพื่ออนุญาตอ่าน Google Sheets</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Form */}
          <form onSubmit={handleSyncGoogleSheet} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Sheets URL หรือ Spreadsheet ID:
              </label>
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ระบุช่วงเซลล์ (Range) - ไม่บังคับ:
              </label>
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="เช่น Sheet1!A1:AZ200 (หากเว้นว่างจะอ่านแผ่นงานแรกอัตโนมัติ)"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังเชื่อมต่อและโหลดข้อมูล...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ดึงข้อมูลคะแนนจาก Google Sheets</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Card 2: CSV Upload & Privacy Assurance */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  นำเข้าไฟล์ CSV จากเครื่อง
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  อัปโหลดไฟล์ผลการตอบแบบทดสอบ (.csv) จาก Google Forms หรือ Excel
                </p>
              </div>
            </div>

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition mb-2" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวางที่นี่
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์ตารางคะแนนภาษาไทย UTF-8
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Privacy Security Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>การประมวลผลข้อมูลในเครื่อง (Client-Side Privacy)</span>
            </div>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              ข้อมูลคะแนนทั้งหมดถูกประมวลผลในเบราว์เซอร์ของท่านโดยตรง
              ไม่มีการส่งชื่อหรือคะแนนของเพื่อนร่วมชั้นไปยังเซิร์ฟเวอร์ภายนอกใดๆ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
