/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, EyeOff, ShieldCheck, Info } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/90 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-indigo-500/30 mb-6">
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white flex items-center gap-1.5">
                มาตรการคุ้มครองความเป็นส่วนตัวด้านคะแนน (Privacy First)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> ปกป้องข้อมูล 100%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              คะแนนสอบถือเป็นข้อมูลส่วนบุคคลที่เป็นความลับ ระบบอนุญาตให้ตรวจสอบได้เฉพาะคะแนนของตนเองเท่านั้น
              โดยในเมนูเปรียบเทียบห้องเรียนจะแสดงเพียง <strong>ค่าสถิติเชิงกลุ่มภาพรวม</strong> (เช่น ค่าเฉลี่ย มัธยฐาน และการกระจายตัว)
              โดยไม่มีการเปิดเผยชื่อ รหัสนักศึกษา หรือคะแนนของเพื่อนร่วมชั้นท่านอื่นอย่างเด็ดขาด
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-xs text-blue-200/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <EyeOff className="w-4 h-4 text-cyan-400" />
          <span>ปกปิดชื่อเพื่อนทุกคน</span>
        </div>
      </div>
    </div>
  );
};
