/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  Moon,
  Sun,
  UserCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'search' | 'benchmark' | 'topics' | 'sheets';
  setActiveTab: (tab: 'search' | 'benchmark' | 'topics' | 'sheets') => void;
  currentUser: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  selectedStudentName?: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  totalSubmissions: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSignInClick,
  onSignOutClick,
  selectedStudentName,
  isDarkMode,
  toggleDarkMode,
  totalSubmissions,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Course Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ภาคเรียนที่ 1
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  PDPA รับรองความเป็นส่วนตัว
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                วิชาการเข้าใจดิจิทัลและการรู้เท่าทันสื่อ
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                ระบบสืบค้นผลคะแนนรายบุคคล & เปรียบเทียบสถิติห้องเรียน ({totalSubmissions} ครั้งที่ส่งตรวจ)
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Student Chip if selected */}
            {selectedStudentName && (
              <button
                onClick={() => setActiveTab('search')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition"
                title="คลิกเพื่อดูคะแนนของคุณ"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{selectedStudentName}</span>
              </button>
            )}

            {/* Google Sheets Auth State Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[100px] truncate">{currentUser.displayName || currentUser.email}</span>
                </div>
                <button
                  onClick={onSignOutClick}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="ออกจากระบบ Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition"
                title="เข้าสู่ระบบ Google เพื่อเชื่อมต่อ Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Google Sheets</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="เปลี่ยนธีม"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 dark:border-slate-800/80 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            ค้นหาคะแนนของฉัน
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'benchmark'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            เปรียบเทียบกับค่ากลางห้อง
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300">
              กราฟสถิติ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'topics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            วิเคราะห์เนื้อหารายวิชา
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'sheets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            จัดการข้อมูล & Google Sheets
          </button>
        </nav>
      </div>
    </header>
  );
};
