/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Printer,
  Award,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Hash,
  User,
  QrCode,
} from 'lucide-react';
import { StudentRecord } from '../data/defaultScores';
import { StudentAnalysis, ClassStatistics } from '../utils/statistics';

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentRecord;
  analysis: StudentAnalysis;
  classStats: ClassStatistics;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  isOpen,
  onClose,
  record,
  analysis,
  classStats,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-transparent">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              พรีวิวใบรายงานผลคะแนนสอบรายบุคคล
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Slip Body */}
        <div id="printable-certificate" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900">
          {/* Certificate Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900/10 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              วิทยาลัยชุมชนพังงา • สำนักวิชาการและการจัดการเรียนรู้
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ใบรายงานผลการประเมินการเรียนรู้รายบุคคล
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              รายวิชา: การเข้าใจดิจิทัลและการรู้เท่าทันสื่อ (Digital Literacy & Media Evaluation)
            </p>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="text-slate-500">ชื่อ - นามสกุล นักศึกษา:</div>
              <div className="text-sm font-black text-slate-900">{record.studentName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">รหัสนักศึกษา:</div>
              <div className="text-sm font-black text-slate-900 font-mono">{record.studentId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">วัน-เวลาที่ส่งตรวจ:</div>
              <div className="font-semibold text-slate-800">{record.timestamp}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">ประวัติการทำแบบทดสอบ:</div>
              <div className="font-semibold text-slate-800">
                ครั้งที่ {analysis.attemptIndex} จากทั้งหมด {analysis.totalAttempts} ครั้ง
              </div>
            </div>
          </div>

          {/* Big Score Summary */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-bold text-blue-700 uppercase">
                คะแนนดิบที่ได้ (เต็ม {record.maxScore})
              </div>
              <div className="text-4xl font-black text-blue-600 mt-1">
                {record.score}
              </div>
              <div className="text-xs text-blue-800 font-semibold mt-1">
                คิดเป็นร้อยละ {Math.round((record.score / record.maxScore) * 1000) / 10}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-700 uppercase">
                คะแนนแปลงลงสมุดเก็บ (เต็ม 20)
              </div>
              <div className="text-4xl font-black text-emerald-600 mt-1">
                {record.scaledScore.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-800 font-semibold mt-1">
                ผลการประเมิน: <strong>{analysis.gradeTier.label}</strong>
              </div>
            </div>
          </div>

          {/* Benchmark Context (Confidential) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>ข้อมูลเปรียบเทียบกับสถิติภาพรวมห้องเรียน:</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                🔒 สถิติไม่ระบุชื่อบุคคล
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px]">ค่าเฉลี่ยห้องเรียน</div>
                <div className="font-bold text-slate-800">{classStats.mean} / 30</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px]">มัธยฐานของห้อง</div>
                <div className="font-bold text-slate-800">{classStats.median} / 30</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px]">เปอร์เซ็นไทล์ของคุณ</div>
                <div className="font-bold text-purple-600">P{analysis.percentile}</div>
              </div>
            </div>
          </div>

          {/* Footer & Verification Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-300">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="text-[10px] leading-tight space-y-0.5">
                <div className="font-bold text-slate-700">Digital Certified Report</div>
                <div>Doc ID: CERT-{record.studentId}-{Date.now().toString().slice(-6)}</div>
                <div>ตรวจสอบความถูกต้องตามระเบียบ PDPA</div>
              </div>
            </div>

            <div className="text-right text-[10px] space-y-1">
              <div className="text-slate-400">ผู้รับรองรายงานผล</div>
              <div className="font-bold text-slate-700">ฝ่ายประเมินผลการเรียนรู้ดิจิทัล</div>
              <div>ออกเอกสารเมื่อ {new Date().toLocaleDateString('th-TH')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
