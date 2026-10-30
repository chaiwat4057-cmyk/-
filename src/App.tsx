/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { StudentRecord, QuestionItem, DEFAULT_RECORDS, DEFAULT_QUESTIONS } from './data/defaultScores';
import { calculateClassStatistics, analyzeStudent } from './utils/statistics';
import { Navbar } from './components/Navbar';
import { PrivacyBanner } from './components/PrivacyBanner';
import { StudentSearch } from './components/StudentSearch';
import { BenchmarkComparison } from './components/BenchmarkComparison';
import { QuestionAnalytics } from './components/QuestionAnalytics';
import { DataSyncPanel } from './components/DataSyncPanel';
import { PrintCertificateModal } from './components/PrintCertificateModal';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'benchmark' | 'topics' | 'sheets'>('search');
  const [records, setRecords] = useState<StudentRecord[]>(DEFAULT_RECORDS);
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS);
  const [dataSourceTitle, setDataSourceTitle] = useState<string>(
    'ข้อมูลผลการสอบวิชาการเข้าใจดิจิทัล (54 รายการ)'
  );
  const [selectedRecord, setSelectedRecord] = useState<StudentRecord | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Sync dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDataLoaded = (
    newRecords: StudentRecord[],
    newQuestions: QuestionItem[],
    sourceTitle: string
  ) => {
    setRecords(newRecords);
    if (newQuestions && newQuestions.length > 0) {
      setQuestions(newQuestions);
    }
    setDataSourceTitle(sourceTitle);
    // If selected record not in new records, reset selection
    if (selectedRecord && !newRecords.some((r) => r.studentId === selectedRecord.studentId)) {
      setSelectedRecord(null);
    }
  };

  const classStats = calculateClassStatistics(records);
  const studentAnalysis = selectedRecord ? analyzeStudent(selectedRecord, records) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSignInClick={handleSignIn}
        onSignOutClick={handleSignOut}
        selectedStudentName={selectedRecord?.studentName}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        totalSubmissions={records.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* PDPA Privacy Protection Assurance Banner */}
        <PrivacyBanner />

        {/* Tab 1: ค้นหาดูคะแนนของตัวเอง */}
        {activeTab === 'search' && (
          <StudentSearch
            records={records}
            questions={questions}
            classStats={classStats}
            selectedRecord={selectedRecord}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onNavigateToBenchmark={() => setActiveTab('benchmark')}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* Tab 2: เมนูเปรียบเทียบคะแนนกับค่ากลางของห้อง แสดงเป็นกราฟ */}
        {activeTab === 'benchmark' && (
          <BenchmarkComparison
            records={records}
            classStats={classStats}
            selectedRecord={selectedRecord}
            onSelectStudentClick={() => setActiveTab('search')}
          />
        )}

        {/* Tab 3: วิเคราะห์เนื้อหาและข้อสอบรายวิชา */}
        {activeTab === 'topics' && (
          <QuestionAnalytics
            questions={questions}
            records={records}
            selectedRecord={selectedRecord}
          />
        )}

        {/* Tab 4: แหล่งข้อมูล & Google Sheets Sync */}
        {activeTab === 'sheets' && (
          <DataSyncPanel
            currentUser={currentUser}
            onUserUpdate={setCurrentUser}
            onDataLoaded={handleDataLoaded}
            currentSourceTitle={dataSourceTitle}
            totalRecordsCount={records.length}
            classStats={classStats}
          />
        )}
      </main>

      {/* Printable Certificate / Score Slip Modal */}
      {selectedRecord && studentAnalysis && (
        <PrintCertificateModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          record={selectedRecord}
          analysis={studentAnalysis}
          classStats={classStats}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 mt-12 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>
              ระบบรายงานผลคะแนนรายวิชาการเข้าใจดิจิทัลและการรู้เท่าทันสื่อ • พัฒนาเพื่อการเรียนรู้
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              คุ้มครองข้อมูลความลับ 100%
            </span>
            <span>Google Sheets Integration Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
