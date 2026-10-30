/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart2,
  Printer,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Hash,
  ShieldCheck,
  ChevronRight,
  Flame,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentRecord, QuestionItem } from '../data/defaultScores';
import { analyzeStudent, ClassStatistics, COMPETENCY_DOMAINS } from '../utils/statistics';

interface StudentSearchProps {
  records: StudentRecord[];
  questions: QuestionItem[];
  classStats: ClassStatistics;
  selectedRecord: StudentRecord | null;
  onSelectRecord: (record: StudentRecord | null) => void;
  onNavigateToBenchmark: () => void;
  onOpenPrintModal: () => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({
  records,
  questions,
  classStats,
  selectedRecord,
  onSelectRecord,
  onNavigateToBenchmark,
  onOpenPrintModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showQuestionsDetail, setShowQuestionsDetail] = useState(false);

  // When a student record is selected and score is high, launch confetti!
  useEffect(() => {
    if (selectedRecord && selectedRecord.score >= 22) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [selectedRecord?.id]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setErrorMessage('กรุณากรอกรหัสนักศึกษา หรือชื่อ-นามสกุล ของท่าน');
      return;
    }

    // Match by ID or Name
    const matches = records.filter(
      (r) =>
        r.studentId.toLowerCase() === query ||
        r.studentId.toLowerCase().includes(query) ||
        r.studentName.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      setErrorMessage(
        `ไม่พบข้อมูลคะแนนของ "${searchQuery}" กรุณาตรวจสอบรหัสนักศึกษาหรือชื่อที่สะกดให้ถูกต้อง`
      );
      return;
    }

    // If multiple submissions for this student, pick the highest score or latest
    const sorted = [...matches].sort((a, b) => b.score - a.score);
    onSelectRecord(sorted[0]);
  };

  const handleQuickPick = (idOrName: string) => {
    setSearchQuery(idOrName);
    setErrorMessage('');
    const matches = records.filter(
      (r) =>
        r.studentId.toLowerCase() === idOrName.toLowerCase() ||
        r.studentName.toLowerCase().includes(idOrName.toLowerCase())
    );
    if (matches.length > 0) {
      const sorted = [...matches].sort((a, b) => b.score - a.score);
      onSelectRecord(sorted[0]);
    }
  };

  // Quick demo test cases from actual class records
  const samplePicks = [
    { label: 'ภัทรดนัย (6818016801054)', query: '6818016801054', desc: 'คะแนน 24/30' },
    { label: 'วิภาวี (6918016503046)', query: '6918016503046', desc: 'คะแนนท็อป 28/30' },
    { label: 'ชูเกียรติ (6818016801039)', query: '6818016801039', desc: 'คะแนน 26/30' },
    { label: 'บุรินทร์พษ (สอบ 2 ครั้ง)', query: '6818016801047', desc: 'ประวัติสอบ 2 ครั้ง' },
  ];

  const analysis = selectedRecord ? analyzeStudent(selectedRecord, records) : null;

  return (
    <div className="space-y-6">
      {/* Search Header Box */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            ระบบสืบค้นผลคะแนนสอบย่อยออนไลน์
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ค้นหาผลคะแนนสอบของตัวเอง
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            พิมพ์ <strong>รหัสนักศึกษา</strong> (เช่น 6818016801054) หรือ <strong>ชื่อ-นามสกุล</strong>{' '}
            เพื่อดูคะแนนและผลวิเคราะห์ส่วนบุคคล
          </p>

          {/* Form */}
          <form onSubmit={handleSearch} className="pt-2">
            <div className="relative flex items-center max-w-xl mx-auto">
              <div className="absolute left-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="กรอกรหัสนักศึกษา หรือชื่อ-นามสกุล..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-inner transition"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>ค้นหา</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sample test chips */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              ทดสอบเลือกตัวอย่าง:
            </span>
            {samplePicks.map((pick) => (
              <button
                key={pick.query}
                type="button"
                onClick={() => handleQuickPick(pick.query)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition"
              >
                {pick.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Student Score Display */}
      {selectedRecord && analysis ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            {/* Top decorative gradient bar */}
            <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Student Bio & Top status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md font-bold text-xl shrink-0">
                    {selectedRecord.studentName.replace(/^(นาย|นางสาว|น\.ส\.|พ\.จ\.อ\.|ร้อยตำรวจเอก|น)/, '').trim().charAt(0) || 'น'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedRecord.studentName}
                      </h3>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${analysis.gradeTier.bgClass}`}>
                        {analysis.gradeTier.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Hash className="w-3.5 h-3.5 text-blue-500" />
                        รหัส: <strong>{selectedRecord.studentId}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        ส่งตรวจ: {selectedRecord.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attempt selector if multiple */}
                {analysis.totalAttempts > 1 && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 self-start sm:self-center">
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      พบประวัติการทำแบบทดสอบ {analysis.totalAttempts} ครั้ง
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {analysis.history.map((hist, idx) => {
                        const isCurrent = hist.id === selectedRecord.id;
                        return (
                          <button
                            key={hist.id}
                            onClick={() => onSelectRecord(hist)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isCurrent
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-200 dark:border-amber-900'
                            }`}
                          >
                            ครั้งที่ {idx + 1}: {hist.score}/{hist.maxScore}
                            {hist.score === Math.max(...analysis.history.map((h) => h.score)) && ' 🌟'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Score Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Box 1: Raw Score */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700 relative overflow-hidden">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
                    คะแนนสอบดิบ (Raw Score)
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400">
                      {selectedRecord.score}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-500">
                      / {selectedRecord.maxScore}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>คิดเป็นร้อยละ:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {Math.round((selectedRecord.score / selectedRecord.maxScore) * 1000) / 10}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(selectedRecord.score / selectedRecord.maxScore) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Score Box 2: Scaled Score out of 20 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-emerald-100 dark:border-slate-700">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                    คะแนนแปลงลงสมุดเก็บ (Scaled Score)
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedRecord.scaledScore.toFixed(2)}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-500">
                      / 20.00
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>สถานะการผ่านเกณฑ์:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {selectedRecord.score >= 15 ? 'ผ่านการประเมิน' : 'ไม่ผ่านเกณฑ์'}
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(selectedRecord.scaledScore / 20) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Score Box 3: Benchmark Placement */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-purple-100 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1">
                      ตำแหน่งเทียบกับห้องเรียน
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400">
                        P{analysis.percentile}
                      </span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-300">
                        (Percentile)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">เทียบค่าเฉลี่ยห้อง:</span>
                      <span
                        className={`font-bold ${
                          analysis.diffFromMean >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {analysis.diffFromMean >= 0 ? `+${analysis.diffFromMean}` : analysis.diffFromMean} คะแนน
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {analysis.diffFromMean >= 0
                        ? `🎉 คะแนนของคุณสูงกว่าค่าเฉลี่ยห้องเรียน (${classStats.mean} คะแนน)`
                        : `ต่ำกว่าค่าเฉลี่ยห้องเรียนเล็กน้อย (${classStats.mean} คะแนน)`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={onNavigateToBenchmark}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>ดูเปรียบเทียบในกราฟของห้องเรียน</span>
                  </button>

                  <button
                    onClick={onOpenPrintModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>พิมพ์ใบรายงานผลคะแนน</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowQuestionsDetail(!showQuestionsDetail)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>{showQuestionsDetail ? 'ซ่อนการตอบคำถาม 30 ข้อ' : 'ดูคำตอบข้อสอบ 30 ข้อของฉัน'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showQuestionsDetail ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Detailed question by question list */}
              {showQuestionsDetail && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-500" />
                      รายการคำตอบของนักศึกษา (30 ข้อ)
                    </h4>
                    <span className="text-xs text-slate-500">ตอบครบ 30 / 30 ข้อ</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => {
                      const studentAnswer = selectedRecord.answers[idx] || 'ไม่ได้ระบุ';
                      const domain = COMPETENCY_DOMAINS.find((d) => d.questionIds.includes(q.id));

                      return (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              ข้อที่ {q.id}
                            </span>
                            {domain && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${domain.color}15`,
                                  color: domain.color,
                                }}
                              >
                                {domain.name.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                            {q.text}
                          </p>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                            <span className="text-slate-600 dark:text-slate-300 font-medium mr-1.5">คำตอบของคุณ:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{studentAnswer}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              ยังไม่ได้เลือกนักศึกษา
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              พิมพ์รหัสนักศึกษา หรือเลือกจากตัวอย่างด้านบน เพื่อดูสรุปคะแนน ผลการเรียนรู้ และตำแหน่งเปรียบเทียบในห้องเรียน
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onNavigateToBenchmark}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span>ดูสถิติและค่ากลางของห้องเรียนก่อน</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
