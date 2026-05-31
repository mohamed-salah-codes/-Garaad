/**
 * useAnalytics.ts
 * Core hook that derives all productivity metrics from local task/project data.
 * No external API needed — fully offline-capable.
 */
import { useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter, startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subYears, subQuarters,
  isWithinInterval, differenceInDays, format, parseISO, eachDayOfInterval } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface RawTask {
  id: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  project_id?: string;
  type?: string;
  title: string;
  updated_at?: string;
}

export interface RawProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface MetricSet {
  // Tasks
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  scheduledTasks: number;
  overdueTasks: number;
  newTasks: number;
  completionRate: number;

  // Projects
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  newProjects: number;

  // Time
  estimatedHours: number;
  actualHours: number;
  hoursVariance: number;
  focusHours: number;

  // Scores (0-100)
  productivityScore: number;
  consistencyScore: number;
  goalAchievementRate: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;

  // Breakdowns
  tasksByDay: { date: string; count: number }[];
  tasksByProject: { projectId: string; projectName: string; count: number }[];
  mostProductiveDay: string;
  mostActiveProject: string;

  // Period labels
  periodStart: Date;
  periodEnd: Date;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function isCompleted(task: RawTask): boolean {
  return task.status === 'Completed' || task.status === 'Done' || task.status === 'done' || task.status === 'completed';
}

function isInProgress(task: RawTask): boolean {
  return task.status === 'In Progress' || task.status === 'in-progress';
}

function isScheduled(task: RawTask): boolean {
  return task.status === 'Scheduled' || task.status === 'scheduled' || task.status === 'Backlog';
}

function isOverdue(task: RawTask, now = new Date()): boolean {
  if (!task.due_date) return false;
  if (isCompleted(task)) return false;
  return new Date(task.due_date) < now;
}

function safeDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  try { return parseISO(dateStr); } catch { return null; }
}

function calcProductivityScore(
  completionRate: number,
  onTimeRate: number,
  consistencyScore: number
): number {
  return Math.round(completionRate * 0.5 + onTimeRate * 0.3 + consistencyScore * 0.2);
}

function buildStreak(tasks: RawTask[]): { current: number; longest: number } {
  const completedDates = tasks
    .filter(isCompleted)
    .map(t => t.completed_at || t.updated_at)
    .filter(Boolean)
    .map(d => format(new Date(d!), 'yyyy-MM-dd'));
  const uniqueDates = [...new Set(completedDates)].sort();

  let current = 0, longest = 0, streak = 1;
  const today = format(new Date(), 'yyyy-MM-dd');

  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const d = uniqueDates[i];
    const prev = i > 0 ? uniqueDates[i - 1] : null;
    if (prev) {
      const diff = differenceInDays(new Date(d), new Date(prev));
      if (diff === 1) streak++;
      else { longest = Math.max(longest, streak); streak = 1; }
    }
  }
  longest = Math.max(longest, streak);

  // Current streak: count back from today
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const expected = format(subDays(new Date(), current), 'yyyy-MM-dd');
    if (uniqueDates[i] === expected || (current === 0 && uniqueDates[i] === today)) {
      current++;
    } else break;
  }

  return { current, longest };
}

// ─── Period Bounds ────────────────────────────────────────────────────────────

export function getPeriodBounds(period: Period, referenceDate = new Date(), customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  switch (period) {
    case 'daily': return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
    case 'weekly': return { start: startOfWeek(referenceDate, { weekStartsOn: 6 }), end: endOfWeek(referenceDate, { weekStartsOn: 6 }) };
    case 'monthly': return { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
    case 'quarterly': return { start: startOfQuarter(referenceDate), end: endOfQuarter(referenceDate) };
    case 'yearly': return { start: startOfYear(referenceDate), end: endOfYear(referenceDate) };
    case 'custom': return { start: customStart ? startOfDay(customStart) : startOfDay(referenceDate), end: customEnd ? endOfDay(customEnd) : endOfDay(referenceDate) };
    default: return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
  }
}

export function getPrevPeriodBounds(period: Period, referenceDate = new Date(), customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  switch (period) {
    case 'daily': return getPeriodBounds('daily', subDays(referenceDate, 1));
    case 'weekly': return getPeriodBounds('weekly', subWeeks(referenceDate, 1));
    case 'monthly': return getPeriodBounds('monthly', subMonths(referenceDate, 1));
    case 'quarterly': return getPeriodBounds('quarterly', subQuarters(referenceDate, 1));
    case 'yearly': return getPeriodBounds('yearly', subYears(referenceDate, 1));
    case 'custom': {
      if (!customStart || !customEnd) return getPeriodBounds('custom', referenceDate, customStart, customEnd);
      const diff = differenceInDays(customEnd, customStart) + 1;
      return { start: startOfDay(subDays(customStart, diff)), end: endOfDay(subDays(customEnd, diff)) };
    }
    default: return getPeriodBounds('daily', subDays(referenceDate, 1));
  }
}

// ─── Core Computation ─────────────────────────────────────────────────────────

export function computeMetrics(
  allTasks: RawTask[],
  allProjects: RawProject[],
  start: Date,
  end: Date,
  projectId?: string
): MetricSet {
  const now = new Date();
  const interval = { start, end };

  // Filter by project if specified
  const tasks = projectId
    ? allTasks.filter(t => t.project_id === projectId)
    : allTasks;
  const projects = projectId
    ? allProjects.filter(p => p.id === projectId)
    : allProjects;

  // Tasks created within the period
  const periodTasks = tasks.filter(t => {
    const d = safeDate(t.created_at);
    return d ? isWithinInterval(d, interval) : false;
  });

  // Tasks completed within the period
  const completedInPeriod = tasks.filter(t => {
    const d = safeDate(t.completed_at || (isCompleted(t) ? t.updated_at : undefined));
    return isCompleted(t) && d ? isWithinInterval(d, interval) : false;
  });

  const overdueTasks = tasks.filter(t => isOverdue(t, now));
  const inProgressTasks = tasks.filter(isInProgress);
  const scheduledTasks = tasks.filter(isScheduled);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Projects
  const projectsCreatedInPeriod = projects.filter(p => {
    const d = safeDate(p.created_at);
    return d ? isWithinInterval(d, interval) : false;
  });
  const completedProjects = projects.filter(p => p.status === 'Completed' || p.progress === 100);
  const activeProjects = projects.filter(p => p.status !== 'Completed' && p.progress < 100);

  // Time
  const estimatedHours = tasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
  const actualHours = tasks.reduce((s, t) => s + (t.actual_hours || 0), 0);
  const focusHours = actualHours > 0 ? actualHours : estimatedHours * 0.8;

  // On-time rate
  const completedWithDue = tasks.filter(t => isCompleted(t) && t.due_date);
  const onTime = completedWithDue.filter(t => {
    const completedDate = safeDate(t.completed_at || t.updated_at);
    const due = safeDate(t.due_date);
    return completedDate && due ? completedDate <= due : true;
  });
  const onTimeRate = completedWithDue.length > 0
    ? Math.round((onTime.length / completedWithDue.length) * 100)
    : completionRate;

  // Tasks by day (for charts)
  const days = eachDayOfInterval({ start, end });
  const tasksByDay = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = completedInPeriod.filter(t => {
      const d = safeDate(t.completed_at || t.updated_at);
      return d ? format(d, 'yyyy-MM-dd') === dayStr : false;
    }).length;
    return { date: format(day, 'MMM dd'), count };
  });

  // Most productive day
  const maxDay = tasksByDay.reduce((a, b) => b.count > a.count ? b : a, { date: '-', count: 0 });

  // Tasks by project
  const projectTaskMap: Record<string, number> = {};
  tasks.forEach(t => {
    if (t.project_id) projectTaskMap[t.project_id] = (projectTaskMap[t.project_id] || 0) + 1;
  });
  const tasksByProject = Object.entries(projectTaskMap).map(([pid, count]) => ({
    projectId: pid,
    projectName: allProjects.find(p => p.id === pid)?.name || 'Unknown',
    count,
  })).sort((a, b) => b.count - a.count);

  const mostActiveProject = tasksByProject[0]?.projectName || '-';

  // Streaks
  const { current, longest } = buildStreak(tasks);

  // Consistency score: % of days in period with at least 1 completion
  const daysWithCompletion = new Set(
    completedInPeriod.map(t => format(new Date(t.completed_at || t.updated_at || ''), 'yyyy-MM-dd'))
  ).size;
  const totalDays = Math.max(1, days.length);
  const consistencyScore = Math.round((daysWithCompletion / totalDays) * 100);

  const productivityScore = calcProductivityScore(completionRate, onTimeRate, consistencyScore);
  const goalAchievementRate = completionRate;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks: inProgressTasks.length,
    scheduledTasks: scheduledTasks.length,
    overdueTasks: overdueTasks.length,
    newTasks: periodTasks.length,
    completionRate,

    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    newProjects: projectsCreatedInPeriod.length,

    estimatedHours: parseFloat(estimatedHours.toFixed(1)),
    actualHours: parseFloat(actualHours.toFixed(1)),
    hoursVariance: parseFloat((estimatedHours - actualHours).toFixed(1)),
    focusHours: parseFloat(focusHours.toFixed(1)),

    productivityScore,
    consistencyScore,
    goalAchievementRate,

    currentStreak: current,
    longestStreak: longest,

    tasksByDay,
    tasksByProject,
    mostProductiveDay: maxDay.date,
    mostActiveProject,

    periodStart: start,
    periodEnd: end,
  };
}

// ─── AI Insights Generator ────────────────────────────────────────────────────

export function generateInsights(current: MetricSet, prev?: MetricSet): string[] {
  const insights: string[] = [];

  // ── 1. Task Completion Analysis ───────────────────────────────────────────
  if (current.totalTasks > 0) {
    const pct = current.completionRate;
    if (pct >= 90) {
      insights.push(`Outstanding! You completed ${pct}% of all assigned tasks — well above the 80% excellence threshold.`);
    } else if (pct >= 70) {
      insights.push(`You completed ${pct}% of assigned tasks (${current.completedTasks} of ${current.totalTasks}). A solid result with room to reach the 80% target.`);
    } else if (pct >= 40) {
      insights.push(`You completed ${pct}% of tasks (${current.completedTasks} of ${current.totalTasks}). Focusing on your top priorities can significantly raise this rate.`);
    } else if (pct > 0) {
      insights.push(`Task completion stands at ${pct}% (${current.completedTasks} of ${current.totalTasks}). Consider breaking large tasks into smaller, daily milestones.`);
    }
  }

  // ── 2. Overdue Analysis ───────────────────────────────────────────────────
  if (current.overdueTasks > 0 && current.totalTasks > 0) {
    const overduePct = Math.round((current.overdueTasks / current.totalTasks) * 100);
    if (overduePct >= 30) {
      insights.push(`⚠ Overdue tasks account for ${overduePct}% of your total workload (${current.overdueTasks} tasks). This is a critical bottleneck requiring immediate attention.`);
    } else {
      insights.push(`${current.overdueTasks} overdue task${current.overdueTasks > 1 ? 's' : ''} represent${current.overdueTasks === 1 ? 's' : ''} ${overduePct}% of your workload. Clearing these first will improve your completion rate significantly.`);
    }
  } else if (current.totalTasks > 0) {
    insights.push('Zero overdue tasks detected — excellent deadline management across all active projects.');
  }

  // ── 3. Productivity Trend (vs prev period) ────────────────────────────────
  if (prev && prev.completedTasks > 0 && current.totalTasks > 0) {
    const delta = current.completedTasks - prev.completedTasks;
    const pct = Math.round(Math.abs((delta / prev.completedTasks) * 100));
    if (delta > 0) {
      insights.push(`Productivity improved ${pct}% compared to the previous period (${prev.completedTasks} → ${current.completedTasks} completed tasks). You are trending upward.`);
    } else if (delta < 0) {
      insights.push(`Productivity declined ${pct}% from the previous period (${prev.completedTasks} → ${current.completedTasks} completed tasks). A structured daily plan can reverse this trend.`);
    } else {
      insights.push('Completion volume remained consistent with the previous period — stable but with potential to accelerate.');
    }
  }

  // ── 4. Productivity Score ─────────────────────────────────────────────────
  if (current.totalTasks > 0) {
    const score = current.productivityScore;
    if (score >= 85) {
      insights.push(`Productivity score: ${score}/100 — Peak performance zone. You are executing at an elite level.`);
    } else if (score >= 70) {
      insights.push(`Productivity score: ${score}/100 — Strong performance. Improving on-time delivery will push you into the top tier.`);
    } else if (score >= 50) {
      insights.push(`Productivity score: ${score}/100 — Moderate output. Increasing daily consistency is the fastest lever for improvement.`);
    } else if (score > 0) {
      insights.push(`Productivity score: ${score}/100 — Below target. Prioritize completing smaller tasks first to build momentum.`);
    }
  }

  // ── 5. Project Engagement ─────────────────────────────────────────────────
  if (current.mostActiveProject && current.mostActiveProject !== '-') {
    insights.push(`Most activity was concentrated in the "${current.mostActiveProject}" project. Diversifying effort across projects can reduce delivery risk.`);
  }
  if (current.activeProjects > 3) {
    insights.push(`You are managing ${current.activeProjects} active projects simultaneously. Consider focusing on 2–3 projects at a time to maintain depth over breadth.`);
  }

  // ── 6. Time Tracking Efficiency ───────────────────────────────────────────
  if (current.estimatedHours > 0) {
    if (current.hoursVariance > 0) {
      insights.push(`Time efficiency was high — you delivered ${current.hoursVariance}h ahead of schedule (${current.actualHours}h actual vs ${current.estimatedHours}h estimated).`);
    } else if (current.hoursVariance < 0) {
      insights.push(`Work took ${Math.abs(current.hoursVariance)}h longer than planned (${current.actualHours}h actual vs ${current.estimatedHours}h estimated). Review task scoping for future accuracy.`);
    }
  }
  if (current.focusHours > 0) {
    insights.push(`Logged ${current.focusHours}h of focus time. Extending deep work sessions by 30 min/day can compound productivity gains significantly.`);
  }

  // ── 7. Streak Performance ─────────────────────────────────────────────────
  if (current.currentStreak >= 14) {
    insights.push(`Exceptional streak! ${current.currentStreak} consecutive days of task completions — you are building elite-level consistency.`);
  } else if (current.currentStreak >= 7) {
    insights.push(`Active ${current.currentStreak}-day productivity streak. Sustaining this through the weekend is key to long-term habit formation.`);
  } else if (current.currentStreak >= 3) {
    insights.push(`You are on a ${current.currentStreak}-day streak. Reach 7 days to lock in a weekly consistency habit.`);
  } else if (current.longestStreak > 0) {
    insights.push(`Your longest streak was ${current.longestStreak} days. Rebuilding a daily completion habit is the most reliable path to a higher productivity score.`);
  }

  // ── 8. Consistency Score ──────────────────────────────────────────────────
  if (current.totalTasks > 0) {
    if (current.consistencyScore >= 80) {
      insights.push(`Consistency score: ${current.consistencyScore}% — You completed tasks on ${current.consistencyScore}% of working days. Excellent daily discipline.`);
    } else if (current.consistencyScore < 40 && current.totalTasks > 0) {
      insights.push(`Consistency score: ${current.consistencyScore}% — Task completions are clustered on specific days. Spreading effort daily reduces last-minute pressure.`);
    }
  }

  return insights.slice(0, 8); // cap at 8 insights
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useAnalytics(
  tasks: RawTask[],
  projects: RawProject[],
  period: Period = 'weekly',
  referenceDate = new Date(),
  projectId?: string,
  customStart?: Date,
  customEnd?: Date
) {
  return useMemo(() => {
    const { start, end } = getPeriodBounds(period, referenceDate, customStart, customEnd);
    const { start: prevStart, end: prevEnd } = getPrevPeriodBounds(period, referenceDate, customStart, customEnd);

    const current = computeMetrics(tasks, projects, start, end, projectId);
    const previous = computeMetrics(tasks, projects, prevStart, prevEnd, projectId);
    const insights = generateInsights(current, previous);

    return { current, previous, insights };
  }, [tasks, projects, period, referenceDate, projectId, customStart, customEnd]);
}

export default useAnalytics;
