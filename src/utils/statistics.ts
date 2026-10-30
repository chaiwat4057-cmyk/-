/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentRecord } from '../data/defaultScores';

export interface ClassStatistics {
  count: number;
  uniqueStudentsCount: number;
  mean: number;
  median: number;
  mode: number[];
  modeCount: number;
  min: number;
  max: number;
  standardDeviation: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
  passRate: number; // percentage >= 50%
  highScoreRate: number; // percentage >= 80%
  meanScaled: number;
  medianScaled: number;
  minScaled: number;
  maxScaled: number;
}

export interface DistributionBin {
  rangeLabel: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  description: string;
}

export interface StudentAnalysis {
  record: StudentRecord;
  rankApprox: number;
  percentile: number;
  diffFromMean: number;
  diffFromMedian: number;
  zScore: number;
  gradeTier: {
    grade: string;
    label: string;
    color: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    icon: string;
  };
  totalAttempts: number;
  attemptIndex: number;
  isBestScore: boolean;
  history: StudentRecord[];
}

export function calculateClassStatistics(records: StudentRecord[]): ClassStatistics {
  if (!records || records.length === 0) {
    return {
      count: 0,
      uniqueStudentsCount: 0,
      mean: 0,
      median: 0,
      mode: [],
      modeCount: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      variance: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      passRate: 0,
      highScoreRate: 0,
      meanScaled: 0,
      medianScaled: 0,
      minScaled: 0,
      maxScaled: 0,
    };
  }

  const scores = records.map((r) => r.score).sort((a, b) => a - b);
  const scaledScores = records.map((r) => r.scaledScore).sort((a, b) => a - b);
  const count = scores.length;

  // Unique students count
  const uniqueIds = new Set(records.map((r) => r.studentId));
  const uniqueStudentsCount = uniqueIds.size;

  // Mean
  const sum = scores.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const sumScaled = scaledScores.reduce((acc, val) => acc + val, 0);
  const meanScaled = sumScaled / count;

  // Median
  let median = 0;
  let medianScaled = 0;
  if (count % 2 === 0) {
    median = (scores[count / 2 - 1] + scores[count / 2]) / 2;
    medianScaled = (scaledScores[count / 2 - 1] + scaledScores[count / 2]) / 2;
  } else {
    median = scores[Math.floor(count / 2)];
    medianScaled = scaledScores[Math.floor(count / 2)];
  }

  // Mode
  const frequencyMap = new Map<number, number>();
  let maxFreq = 0;
  scores.forEach((s) => {
    const f = (frequencyMap.get(s) || 0) + 1;
    frequencyMap.set(s, f);
    if (f > maxFreq) maxFreq = f;
  });

  const mode: number[] = [];
  frequencyMap.forEach((freq, val) => {
    if (freq === maxFreq && maxFreq > 1) {
      mode.push(val);
    }
  });

  // Variance & Standard Deviation
  const variance =
    scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count > 1 ? count - 1 : 1);
  const standardDeviation = Math.sqrt(variance);

  // Quartiles
  const getPercentile = (sortedArr: number[], p: number) => {
    const index = (sortedArr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
  };

  const q1 = getPercentile(scores, 0.25);
  const q3 = getPercentile(scores, 0.75);
  const iqr = q3 - q1;

  const min = scores[0];
  const max = scores[count - 1];

  const minScaled = scaledScores[0];
  const maxScaled = scaledScores[count - 1];

  // Pass rate (>= 15 / 30 or 50%)
  const passedCount = scores.filter((s) => s >= 15).length;
  const passRate = (passedCount / count) * 100;

  // High score rate (>= 24 / 30 or 80%)
  const highScoreCount = scores.filter((s) => s >= 24).length;
  const highScoreRate = (highScoreCount / count) * 100;

  return {
    count,
    uniqueStudentsCount,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    mode: mode.sort((a, b) => a - b),
    modeCount: maxFreq,
    min,
    max,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
    passRate: Math.round(passRate * 10) / 10,
    highScoreRate: Math.round(highScoreRate * 10) / 10,
    meanScaled: Math.round(meanScaled * 100) / 100,
    medianScaled: Math.round(medianScaled * 100) / 100,
    minScaled: Math.round(minScaled * 100) / 100,
    maxScaled: Math.round(maxScaled * 100) / 100,
  };
}

export function calculateDistributionBins(records: StudentRecord[]): DistributionBin[] {
  const binsConfig = [
    { label: '< 15 คะแนน', min: 0, max: 14.99, desc: 'ต้องปรับปรุง (ต่ำกว่า 50%)' },
    { label: '15 - 18 คะแนน', min: 15, max: 18.99, desc: 'พอใช้ (50% - 62%)' },
    { label: '19 - 21 คะแนน', min: 19, max: 21.99, desc: 'ปานกลาง (63% - 72%)' },
    { label: '22 - 24 คะแนน', min: 22, max: 24.99, desc: 'ดี (73% - 82%)' },
    { label: '25 - 27 คะแนน', min: 25, max: 27.99, desc: 'ดีมาก (83% - 92%)' },
    { label: '28 - 30 คะแนน', min: 28, max: 30, desc: 'ดีเยี่ยม (93% - 100%)' },
  ];

  const total = records.length || 1;

  return binsConfig.map((bin) => {
    const matches = records.filter((r) => r.score >= bin.min && r.score <= bin.max);
    const count = matches.length;
    return {
      rangeLabel: bin.label,
      min: bin.min,
      max: bin.max,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      description: bin.desc,
    };
  });
}

export function analyzeStudent(
  record: StudentRecord,
  allRecords: StudentRecord[]
): StudentAnalysis {
  const stats = calculateClassStatistics(allRecords);
  const allScores = allRecords.map((r) => r.score).sort((a, b) => a - b);
  const total = allScores.length || 1;

  // Approximate rank (1 = highest score)
  const strictlyHigher = allScores.filter((s) => s > record.score).length;
  const rankApprox = strictlyHigher + 1;

  // Percentile: % of records <= this score
  const lessOrEqual = allScores.filter((s) => s <= record.score).length;
  const percentile = Math.min(99, Math.max(1, Math.round((lessOrEqual / total) * 100)));

  const diffFromMean = Math.round((record.score - stats.mean) * 100) / 100;
  const diffFromMedian = Math.round((record.score - stats.median) * 100) / 100;
  const zScore =
    stats.standardDeviation > 0
      ? Math.round(((record.score - stats.mean) / stats.standardDeviation) * 100) / 100
      : 0;

  // Performance Tier
  const pct = (record.score / record.maxScore) * 100;
  let gradeTier = {
    grade: 'A',
    label: 'ดีเยี่ยม (Excellent)',
    color: 'emerald',
    bgClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    icon: 'Trophy',
  };

  if (pct >= 90) {
    gradeTier = {
      grade: 'A',
      label: 'ดีเยี่ยม (Excellent)',
      color: 'emerald',
      bgClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      icon: 'Award',
    };
  } else if (pct >= 80) {
    gradeTier = {
      grade: 'B+',
      label: 'ดีมาก (Very Good)',
      color: 'teal',
      bgClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
      borderClass: 'border-teal-500',
      textClass: 'text-teal-600 dark:text-teal-400',
      icon: 'Sparkles',
    };
  } else if (pct >= 70) {
    gradeTier = {
      grade: 'B',
      label: 'ดี (Good)',
      color: 'blue',
      bgClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      borderClass: 'border-blue-500',
      textClass: 'text-blue-600 dark:text-blue-400',
      icon: 'ThumbsUp',
    };
  } else if (pct >= 60) {
    gradeTier = {
      grade: 'C+',
      label: 'ปานกลางค่อนข้างดี (Fair)',
      color: 'amber',
      bgClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
      icon: 'BookOpen',
    };
  } else if (pct >= 50) {
    gradeTier = {
      grade: 'C',
      label: 'ผ่านเกณฑ์ (Pass)',
      color: 'yellow',
      bgClass: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
      borderClass: 'border-yellow-500',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      icon: 'CheckCircle2',
    };
  } else {
    gradeTier = {
      grade: 'F',
      label: 'ต้องพัฒนาเพิ่มเติม (Needs Improvement)',
      color: 'rose',
      bgClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      borderClass: 'border-rose-500',
      textClass: 'text-rose-600 dark:text-rose-400',
      icon: 'AlertTriangle',
    };
  }

  // Find all attempts for this student ID
  const history = allRecords
    .filter((r) => r.studentId.trim() === record.studentId.trim())
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const maxHistoricalScore = Math.max(...history.map((h) => h.score));
  const isBestScore = record.score === maxHistoricalScore;
  const attemptIndex = history.findIndex((h) => h.id === record.id) + 1;

  return {
    record,
    rankApprox,
    percentile,
    diffFromMean,
    diffFromMedian,
    zScore,
    gradeTier,
    totalAttempts: history.length,
    attemptIndex: attemptIndex > 0 ? attemptIndex : 1,
    isBestScore,
    history,
  };
}

/**
 * Categorize the 30 questions into 4 primary learning competency domains
 */
export interface CompetencyDomain {
  id: string;
  name: string;
  description: string;
  questionIds: number[];
  color: string;
}

export const COMPETENCY_DOMAINS: CompetencyDomain[] = [
  {
    id: 'social_networks',
    name: 'เครือข่ายสังคมออนไลน์ (Social Networks)',
    description: 'ประเภทของเครือข่ายสังคมออนไลน์ นิยาม และการประยุกต์ใช้งานในยุคปกติใหม่',
    questionIds: [1, 2, 3, 4, 5],
    color: '#3B82F6', // Blue
  },
  {
    id: 'search_engines',
    name: 'การสืบค้นข้อมูลดิจิทัล (Search Engines & Operators)',
    description: 'หลักการทำงานของ Google คำค้นหาเฉพาะ เทคนิคการใช้เครื่องหมายและ Filetype',
    questionIds: [6, 7, 8, 9, 10, 11, 13, 14],
    color: '#10B981', // Emerald
  },
  {
    id: 'media_literacy',
    name: 'การรู้เท่าทันสื่อและการวิเคราะห์โฆษณา (Media Literacy)',
    description: 'องค์ประกอบการรู้เท่าทันสื่อ การวิเคราะห์ข่าวสาร สื่อแฝง และการรู้เท่าทันการโฆษณา',
    questionIds: [15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 30],
    color: '#8B5CF6', // Purple
  },
  {
    id: 'cyber_security',
    name: 'ความปลอดภัย ลิขสิทธิ์ และจริยธรรม (Cybersecurity & Ethics)',
    description: 'การป้องกันมัลแวร์ สปายแวร์ ความตระหนักเรื่องของฟรี และกฎหมายลิขสิทธิ์ผลงาน',
    questionIds: [12, 22, 23],
    color: '#F59E0B', // Amber
  },
];
