/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { StudentRecord } from '../data/defaultScores';
import {
  ClassStatistics,
  calculateDistributionBins,
  analyzeStudent,
} from '../utils/statistics';

interface BenchmarkComparisonProps {
  records: StudentRecord[];
  classStats: ClassStatistics;
  selectedRecord: StudentRecord | null;
  onSelectStudentClick: () => void;
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  records,
  classStats,
  selectedRecord,
  onSelectStudentClick,
}) => {
  const [activeScoreScale, setActiveScoreScale] = useState<'raw' | 'scaled'>('raw');
  const distribution = calculateDistributionBins(records);

  const studentAnalysis = selectedRecord ? analyzeStudent(selectedRecord, records) : null;
  const studentScore = selectedRecord
    ? activeScoreScale === 'raw'
      ? selectedRecord.score
      : selectedRecord.scaledScore
    : null;

  const maxPossible = activeScoreScale === 'raw' ? 30 : 20;
  const meanVal = activeScoreScale === 'raw' ? classStats.mean : classStats.meanScaled;
  const medianVal = activeScoreScale === 'raw' ? classStats.median : classStats.medianScaled;
  const maxVal = activeScoreScale === 'raw' ? classStats.max : classStats.maxScaled;
  const minVal = activeScoreScale === 'raw' ? classStats.min : classStats.minScaled;

  return (
    <div className="space-y-6">
      {/* Header with Title & Privacy Note */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              เปรียบเทียบคะแนนกับค่ากลางของห้องเรียน
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> สถิติภาพรวมไม่เปิดเผยชื่อบุคคล
            </span>
            <span>• วิเคราะห์จากผลตรวจ {records.length} ครั้ง (นักศึกษา {classStats.uniqueStudentsCount} คน)</span>
          </p>
        </div>

        {/* Toggle Raw Score vs Scaled Score */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-center border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveScoreScale('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeScoreScale === 'raw'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            คะแนนดิบ (เต็ม 30)
          </button>
          <button
            onClick={() => setActiveScoreScale('scaled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeScoreScale === 'scaled'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            คะแนนเก็บ (เต็ม 20)
          </button>
        </div>
      </div>

      {/* Selected Student Banner Status in Comparison */}
      {selectedRecord && studentAnalysis ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-100 font-medium">กำลังเปรียบเทียบคะแนนของ:</div>
              <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>{selectedRecord.studentName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-mono">
                  รหัส {selectedRecord.studentId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] text-blue-100 uppercase">คะแนนของคุณ</div>
              <div className="text-lg font-black">{studentScore} / {maxPossible}</div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] text-blue-100 uppercase">ส่วนต่างจากค่าเฉลี่ย</div>
              <div className="text-lg font-black flex items-center justify-center gap-1">
                {studentAnalysis.diffFromMean >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-300" />
                )}
                <span>{studentAnalysis.diffFromMean >= 0 ? `+${studentAnalysis.diffFromMean}` : studentAnalysis.diffFromMean}</span>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] text-blue-100 uppercase">เปอร์เซ็นไทล์</div>
              <div className="text-lg font-black">P{studentAnalysis.percentile}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
              ยังไม่ได้ค้นหาคะแนนของตัวเอง คลิกเพื่อค้นหารหัสนักศึกษาและดูตำแหน่งของคุณบนกราฟทันที
            </p>
          </div>
          <button
            onClick={onSelectStudentClick}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition"
          >
            ค้นหาคะแนนของฉัน
          </button>
        </div>
      )}

      {/* Central Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Mean (ค่าเฉลี่ย) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ค่าเฉลี่ยห้อง (Mean)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {meanVal}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {Math.round((meanVal / maxPossible) * 100)}% ของคะแนนเต็ม
          </div>
        </div>

        {/* Median (มัธยฐาน) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            มัธยฐาน (Median)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {medianVal}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            ค่ากึ่งกลางของนักศึกษา
          </div>
        </div>

        {/* Mode (ฐานนิยม) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ฐานนิยม (Mode)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {classStats.mode.join(', ')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            ได้คะแนนนี้ {classStats.modeCount} คน
          </div>
        </div>

        {/* Max Score (สูงสุด) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            สูงสุด (Max Score)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {maxVal}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ท็อปของห้องเรียน
          </div>
        </div>

        {/* Min Score (ต่ำสุด) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ต่ำสุด (Min Score)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-500 dark:text-rose-400">
            {minVal}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            ช่วงล่างของห้อง
          </div>
        </div>

        {/* S.D. (ส่วนเบี่ยงเบน) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            S.D. (ส่วนเบี่ยงเบน)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300">
            {classStats.standardDeviation}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            การกระจายตัวของคะแนน
          </div>
        </div>
      </div>

      {/* GRAPH SECTION 1: Interactive Histogram Distribution */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              การกระจายตัวของคะแนนทั้งห้อง (Class Distribution Histogram)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              จำนวนนักศึกษาในแต่ละช่วงคะแนน พร้อมไฮไลท์ช่วงคะแนนของท่านอย่างเป็นความลับ
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start">
            รวม {records.length} ข้อมูลการสอบ
          </div>
        </div>

        {/* SVG/HTML Histogram Bars */}
        <div className="space-y-4 pt-2">
          {distribution.map((bin, idx) => {
            const isStudentInBin =
              selectedRecord !== null &&
              selectedRecord.score >= bin.min &&
              selectedRecord.score <= bin.max;

            const maxBinCount = Math.max(...distribution.map((b) => b.count));
            const barWidthPercent = maxBinCount > 0 ? (bin.count / maxBinCount) * 100 : 0;

            return (
              <div
                key={bin.rangeLabel}
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isStudentInBin
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {bin.rangeLabel}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({bin.description})
                    </span>
                    {isStudentInBin && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white animate-pulse">
                        📍 คะแนนของคุณ ({selectedRecord.score} คะแนน) อยู่ในกลุ่มนี้!
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {bin.count}
                    </strong>{' '}
                    คน ({bin.percentage}%)
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isStudentInBin
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-500'
                    }`}
                    style={{ width: `${Math.max(5, barWidthPercent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPH SECTION 2: Benchmark Comparison Bars (Student vs Mean vs Median vs Top) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Bars */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              เปรียบเทียบค่าสถิติหลัก (Benchmark Comparison)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              เปรียบเทียบระดับคะแนนของคุณกับตัวชี้วัดสำคัญของห้องเรียน
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Student Bar if available */}
            {selectedRecord && (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800">
                <div className="flex justify-between items-center text-xs font-bold text-blue-800 dark:text-blue-200 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    คะแนนของคุณ ({selectedRecord.studentName})
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {studentScore} / {maxPossible}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${((studentScore || 0) / maxPossible) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Class Mean */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  ค่าเฉลี่ยของห้อง (Mean)
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {meanVal} / {maxPossible}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(meanVal / maxPossible) * 100}%` }}
                />
              </div>
            </div>

            {/* Class Median */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  มัธยฐาน (Median - ค่ากึ่งกลาง)
                </span>
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                  {medianVal} / {maxPossible}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(medianVal / maxPossible) * 100}%` }}
                />
              </div>
            </div>

            {/* Class Max */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  คะแนนสูงสุดของห้อง (Max)
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {maxVal} / {maxPossible}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(maxVal / maxPossible) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quartile Box Plot Diagram */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              แผนภาพควอร์ไทล์ห้องเรียน (Quartile Distribution)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              แสดงการแบ่งกลุ่มคะแนน 4 ส่วน (Min, Q1, Median, Q3, Max)
            </p>
          </div>

          {/* Interactive Quartile Graphic */}
          <div className="py-6 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-6">
            <div className="relative pt-6 pb-4">
              {/* Scale Line */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />

              {/* IQR box (Q1 to Q3) */}
              <div
                className="absolute top-6 h-2 bg-indigo-500/40 dark:bg-indigo-400/30 rounded-xs"
                style={{
                  left: `${(classStats.q1 / 30) * 100}%`,
                  width: `${((classStats.q3 - classStats.q1) / 30) * 100}%`,
                }}
              />

              {/* Markers */}
              {/* Min */}
              <div
                className="absolute top-4 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(classStats.min / 30) * 100}%` }}
              >
                <div className="w-2.5 h-6 bg-rose-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 mt-1">Min: {classStats.min}</span>
              </div>

              {/* Q1 */}
              <div
                className="absolute top-4 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(classStats.q1 / 30) * 100}%` }}
              >
                <div className="w-1.5 h-6 bg-indigo-400 rounded-full" />
                <span className="text-[10px] font-bold text-indigo-500 mt-1">Q1: {classStats.q1}</span>
              </div>

              {/* Median */}
              <div
                className="absolute top-3 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(classStats.median / 30) * 100}%` }}
              >
                <div className="w-3 h-8 bg-purple-600 rounded-full ring-2 ring-purple-200" />
                <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  Med: {classStats.median}
                </span>
              </div>

              {/* Q3 */}
              <div
                className="absolute top-4 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(classStats.q3 / 30) * 100}%` }}
              >
                <div className="w-1.5 h-6 bg-indigo-400 rounded-full" />
                <span className="text-[10px] font-bold text-indigo-500 mt-1">Q3: {classStats.q3}</span>
              </div>

              {/* Max */}
              <div
                className="absolute top-4 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(classStats.max / 30) * 100}%` }}
              >
                <div className="w-2.5 h-6 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-emerald-600 mt-1">Max: {classStats.max}</span>
              </div>

              {/* Student Pointer if selected */}
              {selectedRecord && (
                <div
                  className="absolute -top-3 -translate-x-1/2 flex flex-col items-center z-10 animate-bounce"
                  style={{ left: `${(selectedRecord.score / 30) * 100}%` }}
                >
                  <div className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px] shadow-md whitespace-nowrap">
                    คุณ: {selectedRecord.score}
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-blue-600" />
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
              💡 <strong>ความหมายควอร์ไทล์:</strong> 50% ของนักศึกษาทั้งห้องมีคะแนนอยู่ในช่วงกล่องสีม่วง
              (ระหว่าง {classStats.q1} ถึง {classStats.q3} คะแนน)
              {selectedRecord && (
                <span className="block mt-1 font-medium text-blue-600 dark:text-blue-400">
                  {selectedRecord.score >= classStats.q3
                    ? '🎉 คุณอยู่ในกลุ่มควอร์ไทล์บนสุด (Top 25% ของห้องเรียน) ยอดเยี่ยมมาก!'
                    : selectedRecord.score >= classStats.median
                    ? '👍 คุณอยู่ในกลุ่มคะแนนเกินกึ่งกลางห้อง (สูงกว่ามัธยฐาน)'
                    : '📈 คะแนนของคุณอยู่ในช่วงครึ่งล่าง สามารถพัฒนาเพิ่มเติมได้'}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>อัตรานักศึกษาที่ผ่านเกณฑ์ (&gt;= 50%):</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {classStats.passRate}% ({records.filter((r) => r.score >= 15).length} คน)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
