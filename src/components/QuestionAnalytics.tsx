/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Users,
  Compass,
  Search,
  Tv,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Award,
} from 'lucide-react';
import { QuestionItem, StudentRecord } from '../data/defaultScores';
import { COMPETENCY_DOMAINS, CompetencyDomain } from '../utils/statistics';

interface QuestionAnalyticsProps {
  questions: QuestionItem[];
  records: StudentRecord[];
  selectedRecord: StudentRecord | null;
}

export const QuestionAnalytics: React.FC<QuestionAnalyticsProps> = ({
  questions,
  records,
  selectedRecord,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const getDomainIcon = (id: string) => {
    switch (id) {
      case 'social_networks':
        return <Users className="w-4 h-4" />;
      case 'search_engines':
        return <Search className="w-4 h-4" />;
      case 'media_literacy':
        return <Tv className="w-4 h-4" />;
      case 'cyber_security':
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const filteredQuestions =
    selectedDomainId === 'all'
      ? questions
      : questions.filter((q) => {
          const dom = COMPETENCY_DOMAINS.find((d) => d.id === selectedDomainId);
          return dom?.questionIds.includes(q.id);
        });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            โครงสร้างแบบประเมินและทักษะดิจิทัล
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            วิเคราะห์เนื้อหาการประเมิน 4 ด้านสำคัญ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            แบบทดสอบชุดนี้ประกอบด้วยคำถามจำนวน 30 ข้อ ครอบคลุม 4 สมรรถนะหลักด้านความเข้าใจดิจิทัลและการรู้เท่าทันสื่อ
            ช่วยให้ผู้เรียนทราบว่าตนเองมีความรอบรู้ในด้านใดบ้าง
          </p>
        </div>

        {/* 4 Competency Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {COMPETENCY_DOMAINS.map((domain) => {
            const isSelected = selectedDomainId === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(isSelected ? 'all' : domain.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-3 shadow-xs"
                  style={{ backgroundColor: domain.color }}
                >
                  {getDomainIcon(domain.id)}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {domain.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {domain.description}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>{domain.questionIds.length} ข้อคำถาม</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {isSelected ? 'กำลังกรองอยู่' : 'คลิกเพื่อดู'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedDomainId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedDomainId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          ทั้งหมด (30 ข้อ)
        </button>
        {COMPETENCY_DOMAINS.map((domain) => (
          <button
            key={domain.id}
            onClick={() => setSelectedDomainId(domain.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedDomainId === domain.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {domain.name.split(' ')[0]} ({domain.questionIds.length} ข้อ)
          </button>
        ))}
      </div>

      {/* Question Items Accordion/List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            หัวข้อคำถามและสมรรถนะการเรียนรู้ ({filteredQuestions.length} ข้อ)
          </h3>
          {selectedRecord && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
              แสดงคำตอบของ: {selectedRecord.studentName}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const domain = COMPETENCY_DOMAINS.find((d) => d.questionIds.includes(q.id));
            const studentAns = selectedRecord ? selectedRecord.answers[q.id - 1] : null;

            return (
              <div key={q.id} className="py-3.5 space-y-2">
                <button
                  type="button"
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  className="w-full flex items-start justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                      {q.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
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
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 mt-1 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Answer / Review Box */}
                {isExpanded && (
                  <div className="ml-10 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2.5 animate-in fade-in duration-200">
                    <div className="text-slate-500 dark:text-slate-400">
                      <strong>หมวดการเรียนรู้:</strong> {domain?.name}
                    </div>
                    {studentAns ? (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          คำตอบที่คุณเลือก:
                        </span>
                        <p className="font-mono text-blue-600 dark:text-blue-400 font-medium mt-1">
                          {studentAns}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">
                        (ค้นหาคะแนนของคุณในเมนูแรกเพื่อตรวจสอบคำตอบในข้อนี้)
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
