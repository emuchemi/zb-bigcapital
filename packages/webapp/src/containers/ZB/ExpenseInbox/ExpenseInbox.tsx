// @ts-nocheck
/**
 * Z&B Expense Inbox
 * -----------------
 * Lists expenses still in 'draft' or 'pending_review' so they can be submitted
 * to (or returned by) the accountant. Backed by the extended Expenses endpoints:
 *   GET  expenses/zb/inbox
 *   POST expenses/:id/zb/submit
 *   POST expenses/:id/zb/return-to-draft
 */
import React, { useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Classes,
  HTMLTable,
  Intent,
  NonIdealState,
  Spinner,
  Tag,
} from '@blueprintjs/core';
import { DashboardInsider } from '@/components/Dashboard';
import {
  useExpenseInbox,
  useSubmitExpenseForReview,
  useReturnExpenseToDraft,
} from '@/hooks/query';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';

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

const fmtMoney = (amount, currency = 'TZS') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'TZS' ? 0 : 2,
    }).format(Number(amount || 0));
  } catch (e) {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }
};

const STATUS_TAG = {
  draft: { intent: Intent.NONE, label: 'draft' },
  pending_review: { intent: Intent.WARNING, label: 'pending review' },
};

function ZBExpenseInbox({ changePageTitle }) {
  const { data: expenses, isLoading } = useExpenseInbox();
  const submit = useSubmitExpenseForReview();
  const returnToDraft = useReturnExpenseToDraft();

  useEffect(() => {
    changePageTitle('Expense Inbox');
  }, [changePageTitle]);

  const list = expenses || [];
  const draftCount = list.filter((e) => e.zbStatus === 'draft').length;
  const pendingCount = list.filter((e) => e.zbStatus === 'pending_review').length;

  return (
    <DashboardInsider name="zb-expense-inbox">
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Expense Inbox</h2>
          <span className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
            Expenses awaiting review. Submit drafts to the accountant, or return
            submitted ones for correction.
          </span>
        </div>

        {isLoading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <NonIdealState
            icon="inbox"
            title="Inbox is empty"
            description="There are no draft or pending-review expenses right now."
          />
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <Tag minimal large style={{ marginRight: 8 }}>
                {draftCount} draft
              </Tag>
              <Tag minimal large intent={Intent.WARNING}>
                {pendingCount} pending review
              </Tag>
            </div>
            <HTMLTable striped bordered style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Project / site</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => {
                  const tag = STATUS_TAG[e.zbStatus] || STATUS_TAG.draft;
                  return (
                    <tr key={e.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {fmtDate(e.paymentDate)}
                      </td>
                      <td>
                        {e.description || e.zbNotes || '—'}
                        {e.isPettyCash ? (
                          <Tag minimal style={{ marginLeft: 6 }}>
                            petty cash
                          </Tag>
                        ) : null}
                      </td>
                      <td>{e.projectSite || '—'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {fmtMoney(e.totalAmount, e.currencyCode || 'TZS')}
                      </td>
                      <td>
                        <Tag intent={tag.intent} minimal>
                          {tag.label}
                        </Tag>
                      </td>
                      <td>
                        <ButtonGroup minimal>
                          {e.zbStatus === 'draft' ? (
                            <Button
                              small
                              icon="send-to"
                              intent={Intent.PRIMARY}
                              loading={submit.isLoading}
                              onClick={() => submit.mutate(e.id)}
                            >
                              Submit
                            </Button>
                          ) : (
                            <Button
                              small
                              icon="undo"
                              loading={returnToDraft.isLoading}
                              onClick={() => returnToDraft.mutate(e.id)}
                            >
                              Return to draft
                            </Button>
                          )}
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          </>
        )}
      </div>
    </DashboardInsider>
  );
}

export default compose(withDashboardActions)(ZBExpenseInbox);
