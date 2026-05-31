import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, parseISO } from 'date-fns';
import useAnalytics, { computeMetrics } from '../hooks/useAnalytics';
import type { Period, RawTask, RawProject } from '../hooks/useAnalytics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './GlobalReports.css';

// ─── Color palette ────────────────────────────────────────────────────────────
const CHART_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ─── Tooltip styles ───────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '12px',
};

// ─── UI Components ────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color = '#7C3AED', size = 120 }: { score: number; label: string; color?: string; size?: number }) {
  const r = size * 0.34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  const center = size / 2;
  return (
    <div className="gr-score-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="#1e293b" strokeWidth={size * 0.07} />
        <circle
          cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={size * 0.07}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x={center} y={center - 4} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.18} fontWeight="700" fill="#f1f5f9">
          {score}
        </text>
        <text x={center} y={center + size * 0.16} textAnchor="middle" fontSize={size * 0.09} fill="#94a3b8">
          /100
        </text>
      </svg>
      <div className="gr-score-label">{label}</div>
    </div>
  );
}

interface KpiProps { label: string; value: string | number; icon: React.ReactNode; color?: string; delta?: number; invertDelta?: boolean; compareMode?: boolean; }
function KpiCard({ label, value, icon, color = '#7C3AED', delta, invertDelta = false, compareMode = false }: KpiProps) {
  let deltaNode = null;
  if (compareMode && delta !== undefined) {
    const isGood = invertDelta ? delta < 0 : delta > 0;
    const isNeutral = delta === 0;
    deltaNode = (
      <div className={`gr-kpi-delta ${isNeutral ? 'neutral' : isGood ? 'good' : 'bad'}`}>
        {isNeutral ? '− 0%' : isGood ? `↑ ${Math.abs(delta)}%` : `↓ ${Math.abs(delta)}%`}
      </div>
    );
  }

  return (
    <div className="gr-kpi-card">
      <div className="gr-kpi-icon" style={{ background: `${color}1a`, color }}>{icon}</div>
      <div className="gr-kpi-body">
        <div className="gr-kpi-value-row">
          <div className="gr-kpi-value">{value}</div>
          {deltaNode}
        </div>
        <div className="gr-kpi-label">{label}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="gr-section-title">{children}</h2>;
}

function PieLabel({ cx, cy, midAngle, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null;
  const rad = Math.PI / 180;
  const x = cx + (outerRadius + 22) * Math.cos(-midAngle * rad);
  const y = cy + (outerRadius + 22) * Math.sin(-midAngle * rad);
  return (
    <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} fill="#94a3b8" fontSize={11}>
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface GlobalReportsProps {
  tasks: RawTask[];
  projects: RawProject[];
  userName?: string;
  userEmail?: string;
}

export default function GlobalReports({ tasks, projects, userName = 'User', userEmail = '' }: GlobalReportsProps) {
  const [reportType, setReportType] = useState<Period>('monthly');
  const [preset, setPreset] = useState<string>('last1');
  const [compareMode, setCompareMode] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generatedAt, setGeneratedAt] = useState('');

  // ── Preset Logic ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (preset === 'custom') return;
    const now = new Date();
    let start = now, end = now;
    
    if (reportType === 'daily') {
      if (preset === 'today') { start = now; end = now; }
      if (preset === 'yesterday') { start = subDays(now, 1); end = subDays(now, 1); }
    } else if (reportType === 'weekly') {
      end = endOfWeek(now, { weekStartsOn: 6 });
      if (preset === 'last1') start = startOfWeek(now, { weekStartsOn: 6 });
      if (preset === 'last2') start = subWeeks(startOfWeek(now, { weekStartsOn: 6 }), 1);
      if (preset === 'last4') start = subWeeks(startOfWeek(now, { weekStartsOn: 6 }), 3);
    } else if (reportType === 'monthly') {
      end = endOfMonth(now);
      if (preset === 'last1') start = startOfMonth(now);
      if (preset === 'last3') start = subMonths(startOfMonth(now), 2);
      if (preset === 'last4') start = subMonths(startOfMonth(now), 3);
      if (preset === 'last6') start = subMonths(startOfMonth(now), 5);
      if (preset === 'last12') start = subMonths(startOfMonth(now), 11);
    } else if (reportType === 'yearly') {
      end = endOfYear(now);
      if (preset === 'last12') start = startOfYear(now);
      if (preset === 'last24') start = subYears(startOfYear(now), 1);
      if (preset === 'last36') start = subYears(startOfYear(now), 2);
    }
    
    setFromDate(format(start, 'yyyy-MM-dd'));
    setToDate(format(end, 'yyyy-MM-dd'));
    setReportGenerated(false);
  }, [reportType, preset]);

  const customStart = useMemo(() => fromDate ? parseISO(fromDate) : undefined, [fromDate]);
  const customEnd = useMemo(() => toDate ? parseISO(toDate) : undefined, [toDate]);

  const { current, previous, insights } = useAnalytics(
    reportGenerated ? tasks : [],
    projects,
    'custom',
    new Date(),
    undefined,
    customStart,
    customEnd
  );

  const handleGenerate = () => {
    if (!fromDate || !toDate) return;
    setReportGenerated(true);
    setGeneratedAt(format(new Date(), 'MMM d, yyyy - HH:mm'));
  };

  // ── Delta Helpers ───────────────────────────────────────────────────────────
  const getDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'Needs Improvement';
  };

  // ── Chart Data ──────────────────────────────────────────────────────────────
  const activityData = useMemo(() => {
    if (!reportGenerated || !fromDate || !toDate) return [];
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days: { date: string; completed: number; created: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const label = format(cursor, 'MMM d');
      const dayStr = format(cursor, 'yyyy-MM-dd');
      days.push({
        date: label,
        completed: tasks.filter(t => t.completed_at?.startsWith(dayStr)).length,
        created: tasks.filter(t => t.created_at?.startsWith(dayStr)).length,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (days.length > 40) {
      const step = Math.ceil(days.length / 30);
      return days.filter((_, i) => i % step === 0);
    }
    return days;
  }, [tasks, fromDate, toDate, reportGenerated]);

  const statusPieData = [
    { name: 'Completed', value: current.completedTasks, color: '#10B981' },
    { name: 'In Progress', value: current.inProgressTasks, color: '#7C3AED' },
    { name: 'Scheduled', value: current.scheduledTasks, color: '#06B6D4' },
    { name: 'Overdue', value: current.overdueTasks, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const projectBarData = current.tasksByProject.slice(0, 8).map((p, i) => ({
    ...p,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // ── Project Reports ─────────────────────────────────────────────────────────
  const projectReports = useMemo(() => {
    if (!reportGenerated || !customStart || !customEnd) return [];
    return projects.map(p => {
      const m = computeMetrics(tasks, projects, customStart, customEnd, p.id);
      return { project: p, metrics: m };
    }).filter(pr => pr.metrics.totalTasks > 0 || pr.project.status === 'In Progress');
  }, [reportGenerated, projects, tasks, customStart, customEnd]);

  // ── Export Logic ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    document.body.classList.add('pdf-export-mode');
    await new Promise(r => setTimeout(r, 400));
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin;

      const addNewPage = () => { doc.addPage(); cursorY = margin; };

      // Cover Header
      doc.setFillColor(11, 18, 32); 
      doc.rect(0, 0, pageWidth, 120, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(255, 255, 255);
      doc.text('GARAAD', margin, 60);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(14); doc.setTextColor(148, 163, 184);
      doc.text('Productivity Analytics Report', margin, 85);
      doc.setFontSize(10); doc.setTextColor(255, 255, 255);
      doc.text(`User: ${userName}`, pageWidth - margin - 150, 50);
      doc.setTextColor(148, 163, 184);
      doc.text(`${userEmail}`, pageWidth - margin - 150, 65);
      doc.text(`Period: ${fromDate} to ${toDate}`, pageWidth - margin - 150, 80);
      doc.text(`Generated: ${generatedAt}`, pageWidth - margin - 150, 95);
      cursorY = 150;

      const captureAndAdd = async (elementId: string) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        const imgH = (canvas.height * contentWidth) / canvas.width;
        if (cursorY + imgH > pageHeight - margin - 20) addNewPage();
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, cursorY, contentWidth, imgH);
        cursorY += imgH + 24; 
      };

      await captureAndAdd('pdf-exec-summary');
      await captureAndAdd('pdf-scores');
      await captureAndAdd('pdf-charts');
      await captureAndAdd('pdf-focus-streak');
      await captureAndAdd('pdf-projects');
      await captureAndAdd('pdf-ai');

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(148, 163, 184);
        doc.text(`Generated by Garaad Productivity System`, margin, pageHeight - 20);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 60, pageHeight - 20);
      }

      doc.save(`Garaad_Report_${fromDate}_${toDate}.pdf`);
    } catch (err) { console.error('PDF Export Error:', err); } 
    finally { document.body.classList.remove('pdf-export-mode'); }
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="gr-root">
      {/* ── Filter Builder ─────────────────────────────────────────────── */}
      <div className="gr-builder-container">
        <div className="gr-builder-header">
          <h1 className="gr-builder-title">Analytics &amp; Reports</h1>
        </div>

        <div className="gr-builder-panel">
          <div className="gr-builder-row">
            {/* Type */}
            <div className="gr-builder-group">
              <label>Report Type</label>
              <div className="gr-type-tabs">
                {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map(t => (
                  <button key={t} className={`gr-type-tab ${reportType === t ? 'active' : ''}`}
                    onClick={() => { setReportType(t as Period); setPreset(t === 'custom' ? 'custom' : t === 'yearly' ? 'last12' : t === 'daily' ? 'today' : 'last1'); }}>
                    {t === 'custom' ? 'Custom Range' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Period preset */}
            {reportType !== 'custom' && (
              <div className="gr-builder-group">
                <label>Period Selector</label>
                <select className="gr-select" value={preset} onChange={e => setPreset(e.target.value)}>
                  {reportType === 'daily' && (
                    <><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="custom">Custom Date</option></>
                  )}
                  {reportType === 'weekly' && (
                    <><option value="last1">Last Week</option><option value="last2">Last 2 Weeks</option><option value="last4">Last 4 Weeks</option><option value="custom">Custom Range</option></>
                  )}
                  {reportType === 'monthly' && (
                    <><option value="last1">Last Month</option><option value="last3">Last 3 Months</option><option value="last4">Last 4 Months</option><option value="last6">Last 6 Months</option><option value="last12">Last 12 Months</option><option value="custom">Custom Range</option></>
                  )}
                  {reportType === 'yearly' && (
                    <><option value="last12">Last 12 Months</option><option value="last24">Last 24 Months</option><option value="last36">Last 36 Months</option><option value="custom">Custom Range</option></>
                  )}
                </select>
              </div>
            )}

            {/* Custom Dates */}
            {preset === 'custom' && reportType === 'daily' && (
              <div className="gr-builder-group">
                <label>Date</label>
                <input type="date" className="gr-date-input" value={fromDate} onChange={e => { setFromDate(e.target.value); setToDate(e.target.value); setReportGenerated(false); }} />
              </div>
            )}
            
            {preset === 'custom' && reportType !== 'daily' && (
              <>
                <div className="gr-builder-group">
                  <label>From Date</label>
                  <input type="date" className="gr-date-input" value={fromDate} onChange={e => { setFromDate(e.target.value); setReportGenerated(false); }} />
                </div>
                <div className="gr-builder-group">
                  <label>To Date</label>
                  <input type="date" className="gr-date-input" value={toDate} onChange={e => { setToDate(e.target.value); setReportGenerated(false); }} />
                </div>
              </>
            )}

            {/* Compare Checkbox */}
            <div className="gr-builder-group gr-compare-group">
              <label className="gr-checkbox-label">
                <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} />
                <span>Compare with previous period</span>
              </label>
            </div>
            
            {/* Generate Action */}
            <div className="gr-builder-actions">
              <button className="gr-btn-primary" disabled={!fromDate || !toDate} onClick={handleGenerate}>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!reportGenerated && (
        <div className="gr-empty-state-modern">
          <div className="gr-empty-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#emptyGrad)" strokeWidth="1.2">
              <defs><linearGradient id="emptyGrad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/></linearGradient></defs>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <h2>No Report Generated Yet</h2>
          <p>Select a period and click Generate Report to view productivity analytics and insights.</p>
        </div>
      )}

      {/* ── REPORT CONTENT ──────────────────────────────────────────────── */}
      {reportGenerated && (
        <div className="gr-report-canvas">
          
          <div className="gr-report-header">
            <div className="gr-report-title">Garaad Productivity Report</div>
            <div className="gr-report-meta-grid">
              <div className="gr-meta-item"><span>Name:</span> {userName}</div>
              <div className="gr-meta-item"><span>Report ID:</span> GPD-{format(new Date(), 'yyyy-MMdd-HHmm')}</div>
              <div className="gr-meta-item"><span>Email:</span> {userEmail}</div>
              <div className="gr-meta-item"><span>Generated:</span> {generatedAt}</div>
              <div className="gr-meta-item"><span>Period:</span> {fromDate} to {toDate}</div>
              <div className="gr-meta-item"><span>Export:</span> <button className="gr-export-link" onClick={handleExportPDF}>Download PDF</button></div>
            </div>
          </div>

          <div id="pdf-exec-summary" className="gr-section">
            <SectionTitle>Executive Summary</SectionTitle>
            <div className="gr-kpi-grid">
              <KpiCard label="Total Projects" value={current.totalProjects} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>} color="#3B82F6" delta={getDelta(current.totalProjects, previous?.totalProjects || 0)} compareMode={compareMode} />
              <KpiCard label="Active Projects" value={current.activeProjects} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} color="#F59E0B" delta={getDelta(current.activeProjects, previous?.activeProjects || 0)} compareMode={compareMode} />
              <KpiCard label="Completed Projects" value={current.completedProjects} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} color="#10B981" delta={getDelta(current.completedProjects, previous?.completedProjects || 0)} compareMode={compareMode} />
              <KpiCard label="Total Tasks" value={current.totalTasks} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>} color="#8B5CF6" delta={getDelta(current.totalTasks, previous?.totalTasks || 0)} compareMode={compareMode} />
              <KpiCard label="Completed Tasks" value={current.completedTasks} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} color="#10B981" delta={getDelta(current.completedTasks, previous?.completedTasks || 0)} compareMode={compareMode} />
              <KpiCard label="In Progress Tasks" value={current.inProgressTasks} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>} color="#06B6D4" delta={getDelta(current.inProgressTasks, previous?.inProgressTasks || 0)} compareMode={compareMode} />
              <KpiCard label="Overdue Tasks" value={current.overdueTasks} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} color="#EF4444" delta={getDelta(current.overdueTasks, previous?.overdueTasks || 0)} invertDelta={true} compareMode={compareMode} />
              <KpiCard label="Completion Rate" value={`${current.completionRate}%`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} color="#EC4899" delta={current.completionRate - (previous?.completionRate || 0)} compareMode={compareMode} />
              <KpiCard label="Productivity Score" value={current.productivityScore} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} color="#7C3AED" delta={current.productivityScore - (previous?.productivityScore || 0)} compareMode={compareMode} />
              <KpiCard label="Focus Hours" value={current.focusHours} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} color="#F97316" delta={getDelta(current.focusHours, previous?.focusHours || 0)} compareMode={compareMode} />
              <KpiCard label="Time Saved" value={current.hoursVariance >= 0 ? current.hoursVariance : 0} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} color="#10B981" delta={getDelta(current.hoursVariance, previous?.hoursVariance || 0)} compareMode={compareMode} />
            </div>
          </div>

          <div id="pdf-scores" className="gr-section gr-scores-container">
            <div className="gr-score-primary">
              <SectionTitle>Overall Productivity</SectionTitle>
              <div className="gr-grade-box">
                <ScoreRing score={current.productivityScore} label="Productivity Score" color="#7C3AED" size={160} />
                <div className="gr-grade-letter">
                  <div className="gr-grade-value">{getGrade(current.productivityScore)}</div>
                  <div className="gr-grade-label">Performance Grade</div>
                </div>
              </div>
            </div>
            <div className="gr-score-secondary">
               <SectionTitle>Breakdown</SectionTitle>
               <div className="gr-scores-row">
                 <ScoreRing score={current.completionRate} label="Completion Rate" color="#10B981" size={110} />
                 <ScoreRing score={current.consistencyScore} label="Consistency" color="#06B6D4" size={110} />
                 <ScoreRing score={current.goalAchievementRate} label="Goal Achievement" color="#F59E0B" size={110} />
               </div>
            </div>
          </div>

          <div id="pdf-charts" className="gr-section">
            <div className="gr-two-col">
              <div className="gr-card">
                <SectionTitle>{reportType === 'yearly' ? 'Monthly Productivity Trend' : reportType === 'monthly' ? 'Weekly Productivity' : 'Activity Trend'}</SectionTitle>
                <div className="gr-chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grGradC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="completed" name="Completed" stroke="#7C3AED" strokeWidth={2} fill="url(#grGradC)" dot={false} />
                      <Area type="monotone" dataKey="created" name="Created" stroke="#06B6D4" strokeWidth={2} fill="transparent" strokeDasharray="4 3" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="gr-card">
                <SectionTitle>Task Status</SectionTitle>
                <div className="gr-chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} dataKey="value" labelLine={false} label={PieLabel} paddingAngle={2}>
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, bottom: 0 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div id="pdf-focus-streak" className="gr-section gr-two-col">
            <div className="gr-card">
              <SectionTitle>Streak Analytics</SectionTitle>
              <div className="gr-analytics-list">
                <div className="gr-analytics-item"><span>Current Streak</span><strong>{current.currentStreak} Days</strong></div>
                <div className="gr-analytics-item"><span>Longest Streak</span><strong>{current.longestStreak} Days</strong></div>
                <div className="gr-analytics-item"><span>Most Productive Day</span><strong>{current.mostProductiveDay}</strong></div>
                <div className="gr-analytics-item"><span>Best Performing Project</span><strong>{current.mostActiveProject}</strong></div>
              </div>
            </div>
            <div className="gr-card">
              <SectionTitle>Focus Analytics</SectionTitle>
              <div className="gr-analytics-list">
                <div className="gr-analytics-item"><span>Total Focus Hours</span><strong>{current.focusHours}h</strong></div>
                <div className="gr-analytics-item"><span>Estimated Hours</span><strong>{current.estimatedHours}h</strong></div>
                <div className="gr-analytics-item"><span>Actual Hours</span><strong>{current.actualHours}h</strong></div>
                <div className="gr-analytics-item"><span>Time Saved</span><strong style={{color: current.hoursVariance >= 0 ? '#10B981' : '#EF4444'}}>{current.hoursVariance >= 0 ? `+${current.hoursVariance}h` : `${current.hoursVariance}h`}</strong></div>
              </div>
            </div>
          </div>

          <div id="pdf-projects" className="gr-section">
            <SectionTitle>Project Reports</SectionTitle>
            <div className="gr-project-reports">
              {projectReports.map(({ project, metrics }, i) => (
                <div key={project.id} className="gr-project-report-card">
                  <div className="gr-pr-header">
                    <h4>{project.name}</h4>
                    <span className={`gr-pr-status ${project.status === 'Completed' ? 'done' : 'active'}`}>{project.status}</span>
                  </div>
                  <div className="gr-pr-metrics">
                    <div className="gr-pr-metric"><span>Tasks</span><strong>{metrics.totalTasks}</strong></div>
                    <div className="gr-pr-metric"><span>Completed</span><strong style={{color: '#10B981'}}>{metrics.completedTasks}</strong></div>
                    <div className="gr-pr-metric"><span>Overdue</span><strong style={{color: '#EF4444'}}>{metrics.overdueTasks}</strong></div>
                    <div className="gr-pr-metric"><span>Progress</span><strong>{project.progress || metrics.completionRate}%</strong></div>
                    <div className="gr-pr-metric"><span>Score</span><strong style={{color: '#7C3AED'}}>{metrics.productivityScore}</strong></div>
                  </div>
                </div>
              ))}
              {projectReports.length === 0 && <p className="gr-text-muted">No projects active during this period.</p>}
            </div>
          </div>

          <div id="pdf-ai" className="gr-section">
            <SectionTitle>Personal Insights &amp; Recommendations</SectionTitle>
            <div className="gr-two-col">
              <div className="gr-insights-card">
                <h3><span className="gr-emoji">✨</span> AI Insights</h3>
                <div className="gr-insights-list">
                  {insights.map((txt, i) => (
                    <div key={i} className="gr-insight-row" style={{ borderLeftColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                      <p className="gr-insight-text">{txt}</p>
                    </div>
                  ))}
                  {insights.length === 0 && <p className="gr-text-muted">Not enough data to generate insights for this period.</p>}
                </div>
              </div>
              <div className="gr-insights-card">
                <h3><span className="gr-emoji">💡</span> Actionable Recommendations</h3>
                <div className="gr-rec-grid">
                  {current.overdueTasks > 0 && (
                    <div className="gr-rec-card" style={{ borderTopColor: '#EF4444' }}>
                      <div className="gr-rec-top"><span className="gr-rec-icon">🚨</span><span className="gr-rec-badge gr-rec-badge--high">🔴 High</span></div>
                      <div className="gr-rec-title">Prioritize overdue tasks</div>
                      <div className="gr-rec-detail">Resolve {current.overdueTasks} overdue task(s) to improve completion rate.</div>
                    </div>
                  )}
                  {current.completionRate < 80 && (
                    <div className="gr-rec-card" style={{ borderTopColor: '#F59E0B' }}>
                      <div className="gr-rec-top"><span className="gr-rec-icon">🎯</span><span className="gr-rec-badge gr-rec-badge--medium">🟡 Medium</span></div>
                      <div className="gr-rec-title">Break large tasks into smaller milestones</div>
                      <div className="gr-rec-detail">Your completion rate is {current.completionRate}%. Smaller tasks will boost momentum.</div>
                    </div>
                  )}
                  {current.consistencyScore < 70 && (
                    <div className="gr-rec-card" style={{ borderTopColor: '#06B6D4' }}>
                      <div className="gr-rec-top"><span className="gr-rec-icon">📅</span><span className="gr-rec-badge gr-rec-badge--medium">🟡 Medium</span></div>
                      <div className="gr-rec-title">Schedule dedicated focus blocks</div>
                      <div className="gr-rec-detail">Consistency is at {current.consistencyScore}%. Working earlier in the week improves stability.</div>
                    </div>
                  )}
                  {current.currentStreak > 0 && (
                    <div className="gr-rec-card" style={{ borderTopColor: '#10B981' }}>
                      <div className="gr-rec-top"><span className="gr-rec-icon">🔥</span><span className="gr-rec-badge gr-rec-badge--low">🟢 Low</span></div>
                      <div className="gr-rec-title">Maintain your streak</div>
                      <div className="gr-rec-detail">You have a {current.currentStreak}-day streak. Keep it up to hit your goals!</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
