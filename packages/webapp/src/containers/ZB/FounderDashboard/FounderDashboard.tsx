// @ts-nocheck
/**
 * Z&B Founder Dashboard
 * ---------------------
 * A single-glance financial overview for the founder, backed by the
 * GET /api/zb/dashboard endpoint (ZBDashboard server module).
 *
 * Read-only. All figures come straight from the ledger.
 */
import React, { useEffect } from 'react';
import {
  Spinner,
  NonIdealState,
  HTMLTable,
  Tag,
  Intent,
  Callout,
  Classes,
} from '@blueprintjs/core';
import { DashboardInsider } from '@/components/Dashboard';
import { Card } from '@/components';
import { useZBDashboard } from '@/hooks/query';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';

// ── Formatting helpers ────────────────────────────────────────────────────────

const fmtMoney = (amount, currency = 'TZS') => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'TZS' ? 0 : 2,
      maximumFractionDigits: currency === 'TZS' ? 0 : 2,
    }).format(value);
  } catch (e) {
    // Fallback if the currency code is not recognised by Intl.
    return `${currency} ${value.toLocaleString()}`;
  }
};

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// ── Small presentational pieces ───────────────────────────────────────────────

function StatCard({ label, value, sub, intent }) {
  return (
    <Card style={{ flex: '1 1 220px', minWidth: 200, padding: 16 }}>
      <div
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: '#5c7080',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginTop: 6,
          color:
            intent === 'danger'
              ? '#c23030'
              : intent === 'success'
                ? '#0d8050'
                : '#182026',
        }}
      >
        {value}
      </div>
      {sub != null && (
        <div style={{ fontSize: 12, color: '#5c7080', marginTop: 4 }}>{sub}</div>
      )}
    </Card>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <Card style={{ flex: '1 1 420px', minWidth: 320, padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h4>
        {right}
      </div>
      {children}
    </Card>
  );
}

const statusIntent = (status) => {
  switch (status) {
    case 'overdue':
      return Intent.DANGER;
    case 'completed':
      return Intent.SUCCESS;
    case 'waived':
      return Intent.NONE;
    default:
      return Intent.PRIMARY;
  }
};

// ── Page ──────────────────────────────────────────────────────────────────────

function ZBFounderDashboard({ changePageTitle }) {
  const { data, isLoading, isError } = useZBDashboard();

  useEffect(() => {
    changePageTitle('Founder Dashboard');
  }, [changePageTitle]);

  const row = { display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 };

  return (
    <DashboardInsider name="zb-founder-dashboard">
      <div style={{ padding: 20 }}>
        {isLoading ? (
          <div style={{ paddingTop: 80 }}>
            <Spinner />
          </div>
        ) : isError ? (
          <NonIdealState
            icon="error"
            title="Could not load the dashboard"
            description="The server did not return dashboard data. Try refreshing the page."
          />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Founder Dashboard</h2>
              <span className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                {data.currentMonth
                  ? `Month ${data.currentMonth}`
                  : ''}
                {data.generatedAt
                  ? ` · updated ${fmtDate(data.generatedAt)}`
                  : ''}
              </span>
            </div>

            {/* KPI row */}
            <div style={row}>
              <StatCard
                label="Cash Position (TZS)"
                value={fmtMoney(data?.cashPosition?.totalTZS, 'TZS')}
                sub={`${data?.cashPosition?.accounts?.length || 0} bank/cash accounts`}
                intent="success"
              />
              <StatCard
                label="Petty Cash"
                value={fmtMoney(
                  data?.pettyCash?.balance,
                  data?.pettyCash?.currencyCode || 'TZS',
                )}
              />
              <StatCard
                label="Unpaid Bills"
                value={fmtMoney(
                  data?.unpaidBills?.totalAmount,
                  data?.unpaidBills?.currencyCode || 'TZS',
                )}
                sub={`${data?.unpaidBills?.count || 0} bills outstanding`}
                intent="danger"
              />
              <StatCard
                label="Accounts Receivable"
                value={fmtMoney(
                  data?.accountsReceivable?.totalAmount,
                  data?.accountsReceivable?.currencyCode || 'TZS',
                )}
                sub={`${data?.accountsReceivable?.count || 0} open invoices`}
              />
            </div>

            {/* Revenue / burn / inbox row */}
            <div style={row}>
              <StatCard
                label="Revenue this month (TZS)"
                value={fmtMoney(data?.monthlyRevenue?.totalTZS, 'TZS')}
                sub={(data?.monthlyRevenue?.byCurrency || [])
                  .filter((c) => c.currencyCode !== 'TZS')
                  .map((c) => fmtMoney(c.amount, c.currencyCode))
                  .join('  ·  ')}
                intent="success"
              />
              <StatCard
                label="Spend this month (TZS)"
                value={fmtMoney(data?.monthlyBurn?.totalTZS, 'TZS')}
                intent="danger"
              />
              <StatCard
                label="Expense Inbox"
                value={data?.expenseInbox?.totalCount ?? 0}
                sub={`${data?.expenseInbox?.draftCount ?? 0} draft · ${
                  data?.expenseInbox?.pendingReviewCount ?? 0
                } pending review`}
              />
              <StatCard
                label="Overdue Compliance"
                value={data?.overdueComplianceCount ?? 0}
                sub="items past their due date"
                intent={
                  (data?.overdueComplianceCount ?? 0) > 0 ? 'danger' : 'success'
                }
              />
            </div>

            {/* Detail row: recent expenses + upcoming compliance */}
            <div style={row}>
              <SectionCard title="Recent Expenses">
                {(data?.recentExpenses || []).length === 0 ? (
                  <div className={Classes.TEXT_MUTED}>No expenses yet.</div>
                ) : (
                  <HTMLTable
                    striped
                    style={{ width: '100%', fontSize: 13 }}
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentExpenses.map((e) => (
                        <tr key={e.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {fmtDate(e.paymentDate)}
                          </td>
                          <td>{e.description || e.zbNotes || '—'}</td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {fmtMoney(e.totalAmount, e.currencyCode || 'TZS')}
                          </td>
                          <td>
                            <Tag minimal>{e.zbStatus || 'draft'}</Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                )}
              </SectionCard>

              <SectionCard
                title="Upcoming Compliance (next 30 days)"
                right={
                  (data?.overdueComplianceCount ?? 0) > 0 ? (
                    <Tag intent={Intent.DANGER}>
                      {data.overdueComplianceCount} overdue
                    </Tag>
                  ) : null
                }
              >
                {(data?.upcomingCompliance || []).length === 0 ? (
                  <Callout intent={Intent.SUCCESS} icon="tick">
                    Nothing due in the next 30 days.
                  </Callout>
                ) : (
                  <HTMLTable striped style={{ width: '100%', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Obligation</th>
                        <th>Due</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.upcomingCompliance.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {fmtDate(c.dueDate)}
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {c.amountDue != null
                              ? fmtMoney(c.amountDue, c.currency || 'TZS')
                              : '—'}
                          </td>
                          <td>
                            <Tag intent={statusIntent(c.status)} minimal>
                              {c.daysUntilDue <= 0
                                ? 'due'
                                : `${c.daysUntilDue}d`}
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                )}
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </DashboardInsider>
  );
}

export default compose(withDashboardActions)(ZBFounderDashboard);
