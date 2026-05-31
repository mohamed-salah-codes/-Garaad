import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';
import useAnalytics, { type RawTask, type RawProject } from '../hooks/useAnalytics';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ProjectReports.css';

// ─── Health Score Badge ──────────────────────────────────────────────────────

function healthColor(score: number) {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function healthLabel(score: number) {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'At Risk';
  return 'Critical';
}

// ─── Stat Row ────────────────────────────────────────────────────────────────

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: string }) {
  return (
    <div className="pr-stat-row">
      <span className="pr-stat-label">{label}</span>
      <span className="pr-stat-value" style={highlight ? { color: highlight } : undefined}>{value}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ProjectReportsProps {
  projectId: string;
  projectName: string;
  projectStatus: string;
  allTasks: RawTask[];
  allProjects: RawProject[];
}

export default function ProjectReports({
  projectId,
  projectName,
  projectStatus,
  allTasks,
  allProjects,
}: ProjectReportsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'time'>('overview');
  const { current, insights } = useAnalytics(allTasks, allProjects, 'monthly', new Date(), projectId);

  // Project-level task list
  const projectTasks = allTasks.filter(t => t.project_id === projectId);
  const completedTasks = projectTasks.filter(t =>
    t.status === 'Completed' || t.status === 'Done' || t.status === 'completed' || t.status === 'done'
  );
  const inProgressTasks = projectTasks.filter(t =>
    t.status === 'In Progress' || t.status === 'in-progress'
  );
  const overdueTasks = projectTasks.filter(t => {
    if (!t.due_date) return false;
    if (completedTasks.includes(t)) return false;
    return new Date(t.due_date) < new Date();
  });

  const totalTasks = projectTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const estimatedHours = projectTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
  const actualHours = projectTasks.reduce((s, t) => s + (t.actual_hours || 0), 0);
  const hoursVariance = parseFloat((estimatedHours - actualHours).toFixed(1));

  // Project Health Score
  const overdueWeight = Math.max(0, 100 - overdueTasks.length * 15);
  const completionWeight = completionRate;
  const healthScore = Math.round(overdueWeight * 0.5 + completionWeight * 0.5);

  // Chart data by status
  const statusChartData = [
    { name: 'Completed', count: completedTasks.length, fill: '#10B981' },
    { name: 'In Progress', count: inProgressTasks.length, fill: '#7C3AED' },
    { name: 'Overdue', count: overdueTasks.length, fill: '#EF4444' },
    { name: 'Other', count: totalTasks - completedTasks.length - inProgressTasks.length - overdueTasks.length, fill: '#94a3b8' },
  ].filter(d => d.count > 0);

  // Activity trend over last 30 days
  const activityData = current.tasksByDay.slice(-14);

  const exportCSV = () => {
    const rows = [
      ['Project Report', projectName],
      ['Status', projectStatus],
      ['Total Tasks', totalTasks],
      ['Completed Tasks', completedTasks.length],
      ['In Progress', inProgressTasks.length],
      ['Overdue Tasks', overdueTasks.length],
      ['Completion Rate (%)', completionRate],
      ['Estimated Hours', estimatedHours],
      ['Actual Hours', actualHours],
      ['Hours Variance', hoursVariance],
      ['Health Score', healthScore],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Project Report');
    XLSX.writeFile(wb, `${projectName}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Project Report: ${projectName}`, 14, 18);
    doc.setTextColor(0, 0, 0);

    let y = 38;
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Status', projectStatus],
        ['Total Tasks', totalTasks],
        ['Completed Tasks', completedTasks.length],
        ['Completion Rate', `${completionRate}%`],
        ['Overdue Tasks', overdueTasks.length],
        ['Estimated Hours', `${estimatedHours}h`],
        ['Actual Hours', `${actualHours}h`],
        ['Hours Variance', `${hoursVariance >= 0 ? '+' : ''}${hoursVariance}h`],
        ['Project Health Score', `${healthScore}/100`],
      ],
      headStyles: { fillColor: [124, 58, 237] },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Insights', 14, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    insights.forEach(insight => {
      const lines = doc.splitTextToSize('• ' + insight, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save(`${projectName}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="project-reports">
      {/* Header */}
      <div className="pr-header">
        <div>
          <h2 className="pr-title">{projectName} — Reports</h2>
          <div className="pr-status-badge" style={{ background: `${healthColor(healthScore)}22`, color: healthColor(healthScore) }}>
            {healthLabel(healthScore)} · Health {healthScore}/100
          </div>
        </div>
        <div className="pr-actions">
          <button className="pr-export-btn" onClick={exportCSV}>Export Excel</button>
          <button className="pr-export-btn primary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pr-tabs">
        {(['overview', 'progress', 'time'] as const).map(tab => (
          <button
            key={tab}
            className={`pr-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Row */}
          <div className="pr-kpi-grid">
            <div className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: '#7C3AED' }}>{totalTasks}</div>
              <div className="pr-kpi-label">Total Tasks</div>
            </div>
            <div className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: '#10B981' }}>{completedTasks.length}</div>
              <div className="pr-kpi-label">Completed</div>
            </div>
            <div className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: '#06B6D4' }}>{inProgressTasks.length}</div>
              <div className="pr-kpi-label">In Progress</div>
            </div>
            <div className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: '#EF4444' }}>{overdueTasks.length}</div>
              <div className="pr-kpi-label">Overdue</div>
            </div>
            <div className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: '#8B5CF6' }}>{completionRate}%</div>
              <div className="pr-kpi-label">Completion Rate</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pr-section">
            <h3 className="pr-section-title">Project Progress</h3>
            <div className="pr-progress-bar-container">
              <div className="pr-progress-bar-fill" style={{ width: `${completionRate}%`, background: healthColor(healthScore) }} />
            </div>
            <div className="pr-progress-labels">
              <span>0%</span>
              <span style={{ color: healthColor(healthScore), fontWeight: 600 }}>{completionRate}% complete</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="pr-section">
            <h3 className="pr-section-title">Task Distribution</h3>
            <div className="pr-chart-card">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights */}
          <div className="pr-section">
            <div className="pr-insight-card">
              <div className="pr-insight-header">
                <span>✨</span>
                <h3>AI Insights</h3>
              </div>
              <ul className="pr-insight-list">
                {insights.map((txt, i) => <li key={i}>{txt}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div>
          <div className="pr-section">
            <h3 className="pr-section-title">Task Completion Trend</h3>
            <div className="pr-chart-card">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="count" name="Completed" stroke="#7C3AED" strokeWidth={2} fill="url(#prGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="pr-chart-empty">No activity data yet. Complete some tasks to see your trend.</div>
              )}
            </div>
          </div>

          <div className="pr-section">
            <h3 className="pr-section-title">Detailed Stats</h3>
            <div className="pr-stats-card">
              <StatRow label="Total Tasks" value={totalTasks} />
              <StatRow label="Completed" value={completedTasks.length} highlight="#10B981" />
              <StatRow label="In Progress" value={inProgressTasks.length} highlight="#7C3AED" />
              <StatRow label="Overdue" value={overdueTasks.length} highlight={overdueTasks.length > 0 ? '#EF4444' : undefined} />
              <StatRow label="Completion Rate" value={`${completionRate}%`} highlight={healthColor(healthScore)} />
              <StatRow label="Project Health" value={`${healthScore}/100 – ${healthLabel(healthScore)}`} highlight={healthColor(healthScore)} />
            </div>
          </div>
        </div>
      )}

      {/* Time Tab */}
      {activeTab === 'time' && (
        <div>
          <div className="pr-section">
            <h3 className="pr-section-title">Estimated vs Actual Time</h3>
            <div className="pr-time-grid">
              <div className="pr-time-card" style={{ borderColor: '#7C3AED33' }}>
                <div className="pr-time-icon" style={{ background: '#7C3AED22', color: '#7C3AED' }}>⏱</div>
                <div className="pr-time-value" style={{ color: '#7C3AED' }}>{estimatedHours}h</div>
                <div className="pr-time-label">Estimated</div>
              </div>
              <div className="pr-time-card" style={{ borderColor: '#10B98133' }}>
                <div className="pr-time-icon" style={{ background: '#10B98122', color: '#10B981' }}>⏰</div>
                <div className="pr-time-value" style={{ color: '#10B981' }}>{actualHours}h</div>
                <div className="pr-time-label">Actual</div>
              </div>
              <div className="pr-time-card" style={{ borderColor: hoursVariance >= 0 ? '#10B98133' : '#EF444433' }}>
                <div className="pr-time-icon" style={{ background: hoursVariance >= 0 ? '#10B98122' : '#EF444422', color: hoursVariance >= 0 ? '#10B981' : '#EF4444' }}>
                  {hoursVariance >= 0 ? '✅' : '⚠️'}
                </div>
                <div className="pr-time-value" style={{ color: hoursVariance >= 0 ? '#10B981' : '#EF4444' }}>
                  {hoursVariance >= 0 ? '+' : ''}{hoursVariance}h
                </div>
                <div className="pr-time-label">{hoursVariance >= 0 ? 'Time Saved' : 'Time Overrun'}</div>
              </div>
            </div>

            {estimatedHours > 0 && (
              <div className="pr-section" style={{ marginTop: '20px' }}>
                <div className="pr-efficiency-box">
                  {hoursVariance >= 0 ? (
                    <p>🎉 <strong>Completed {hoursVariance}h faster</strong> than estimated. Excellent time efficiency!</p>
                  ) : (
                    <p>⏰ Took <strong>{Math.abs(hoursVariance)}h longer</strong> than estimated. Consider revising future estimates.</p>
                  )}
                </div>
              </div>
            )}

            <div className="pr-section" style={{ marginTop: '20px' }}>
              <h3 className="pr-section-title">Time by Task</h3>
              {projectTasks.filter(t => (t.estimated_hours || 0) > 0 || (t.actual_hours || 0) > 0).length > 0 ? (
                <div className="pr-chart-card">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={projectTasks.filter(t => (t.estimated_hours || 0) > 0 || (t.actual_hours || 0) > 0).slice(0, 8).map(t => ({
                        name: t.title.length > 20 ? t.title.substring(0, 20) + '…' : t.title,
                        estimated: t.estimated_hours || 0,
                        actual: t.actual_hours || 0,
                      }))}
                      layout="vertical"
                      margin={{ left: 10, right: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      <Bar dataKey="estimated" name="Estimated (h)" fill="#7C3AED" radius={[0, 4, 4, 0]} opacity={0.6} />
                      <Bar dataKey="actual" name="Actual (h)" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="pr-chart-card">
                  <div className="pr-chart-empty">Set estimated and actual hours on tasks to see time analytics.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
