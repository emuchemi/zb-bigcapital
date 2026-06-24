// @ts-nocheck
/**
 * Z&B Compliance Calendar
 * -----------------------
 * Tracks Zanzibar/Tanzania filing deadlines, levy remittances, licence and
 * permit renewals. Backed by /api/zb/compliance (ZBCompliance server module).
 *
 * Uses plain Blueprint controlled inputs (not Formik) to keep the build simple.
 */
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Classes,
  Dialog,
  FormGroup,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Intent,
  NonIdealState,
  Spinner,
  Tag,
  TextArea,
} from '@blueprintjs/core';
import { DashboardInsider } from '@/components/Dashboard';
import {
  useZBComplianceItems,
  useCreateZBComplianceItem,
  useEditZBComplianceItem,
  useCompleteZBComplianceItem,
  useDeleteZBComplianceItem,
} from '@/hooks/query';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';

const ITEM_TYPES = [
  { value: 'tax_return', label: 'Tax return' },
  { value: 'levy_remittance', label: 'Levy remittance' },
  { value: 'payroll_remittance', label: 'Payroll remittance' },
  { value: 'licence_renewal', label: 'Licence renewal' },
  { value: 'permit_renewal', label: 'Permit renewal' },
  { value: 'other', label: 'Other' },
];

const RECURRENCES = [
  { value: 'once', label: 'Once' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const STATUS_INTENT = {
  upcoming: Intent.PRIMARY,
  overdue: Intent.DANGER,
  completed: Intent.SUCCESS,
  waived: Intent.NONE,
};

const labelFor = (list, value) =>
  (list.find((o) => o.value === value) || {}).label || value;

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
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'TZS' ? 0 : 2,
    }).format(Number(amount));
  } catch (e) {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }
};

const emptyForm = {
  name: '',
  itemType: 'tax_return',
  dueDate: '',
  amountDue: '',
  currency: 'TZS',
  responsiblePerson: '',
  recurrence: 'once',
  notes: '',
};

function ComplianceDialog({ isOpen, onClose, editing }) {
  const [form, setForm] = useState(emptyForm);
  const create = useCreateZBComplianceItem();
  const edit = useEditZBComplianceItem();
  const saving = create.isLoading || edit.isLoading;

  useEffect(() => {
    if (isOpen) {
      setForm(
        editing
          ? {
              name: editing.name || '',
              itemType: editing.itemType || 'tax_return',
              dueDate: (editing.dueDate || '').slice(0, 10),
              amountDue: editing.amountDue ?? '',
              currency: editing.currency || 'TZS',
              responsiblePerson: editing.responsiblePerson || '',
              recurrence: editing.recurrence || 'once',
              notes: editing.notes || '',
            }
          : emptyForm,
      );
    }
  }, [isOpen, editing]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const payload = {
      name: form.name,
      itemType: form.itemType,
      dueDate: form.dueDate,
      currency: form.currency || 'TZS',
      recurrence: form.recurrence,
      responsiblePerson: form.responsiblePerson || undefined,
      notes: form.notes || undefined,
      amountDue:
        form.amountDue === '' || form.amountDue == null
          ? undefined
          : Number(form.amountDue),
    };
    const onSuccess = () => onClose();
    if (editing) {
      edit.mutate([editing.id, payload], { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit compliance item' : 'New compliance item'}
      style={{ width: 520 }}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="Name" labelInfo="(required)">
          <InputGroup
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. PAYE Remittance — May 2026"
          />
        </FormGroup>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Type" style={{ flex: 1 }}>
            <HTMLSelect
              fill
              value={form.itemType}
              onChange={set('itemType')}
              options={ITEM_TYPES}
            />
          </FormGroup>
          <FormGroup label="Due date" labelInfo="(required)" style={{ flex: 1 }}>
            <InputGroup type="date" value={form.dueDate} onChange={set('dueDate')} />
          </FormGroup>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Amount due" style={{ flex: 1 }}>
            <InputGroup
              type="number"
              value={form.amountDue}
              onChange={set('amountDue')}
              placeholder="optional"
            />
          </FormGroup>
          <FormGroup label="Currency" style={{ width: 110 }}>
            <InputGroup
              value={form.currency}
              onChange={set('currency')}
              maxLength={3}
            />
          </FormGroup>
          <FormGroup label="Recurrence" style={{ flex: 1 }}>
            <HTMLSelect
              fill
              value={form.recurrence}
              onChange={set('recurrence')}
              options={RECURRENCES}
            />
          </FormGroup>
        </div>
        <FormGroup label="Responsible person">
          <InputGroup
            value={form.responsiblePerson}
            onChange={set('responsiblePerson')}
            placeholder="optional"
          />
        </FormGroup>
        <FormGroup label="Notes">
          <TextArea
            fill
            growVertically
            value={form.notes}
            onChange={set('notes')}
          />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            intent={Intent.PRIMARY}
            onClick={submit}
            loading={saving}
            disabled={!form.name || !form.dueDate}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function ZBComplianceCalendar({ changePageTitle }) {
  const [scope, setScope] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: items, isLoading } = useZBComplianceItems({ scope });
  const complete = useCompleteZBComplianceItem();
  const remove = useDeleteZBComplianceItem();

  useEffect(() => {
    changePageTitle('Compliance Calendar');
  }, [changePageTitle]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  return (
    <DashboardInsider name="zb-compliance-calendar">
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Compliance Calendar</h2>
          <Button icon="plus" intent={Intent.PRIMARY} onClick={openNew}>
            New item
          </Button>
        </div>

        <ButtonGroup style={{ marginBottom: 16 }}>
          <Button active={scope === ''} onClick={() => setScope('')}>
            All
          </Button>
          <Button active={scope === 'upcoming'} onClick={() => setScope('upcoming')}>
            Upcoming
          </Button>
          <Button active={scope === 'overdue'} onClick={() => setScope('overdue')}>
            Overdue
          </Button>
        </ButtonGroup>

        {isLoading ? (
          <Spinner />
        ) : !items || items.length === 0 ? (
          <NonIdealState
            icon="calendar"
            title="No compliance items"
            description="Add your filing deadlines, levy remittances, and licence renewals."
            action={
              <Button intent={Intent.PRIMARY} icon="plus" onClick={openNew}>
                New item
              </Button>
            }
          />
        ) : (
          <HTMLTable striped bordered style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Obligation</th>
                <th>Type</th>
                <th>Due date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.responsiblePerson ? (
                      <div className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                        {item.responsiblePerson}
                      </div>
                    ) : null}
                  </td>
                  <td>{labelFor(ITEM_TYPES, item.itemType)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(item.dueDate)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmtMoney(item.amountDue, item.currency)}
                  </td>
                  <td>
                    <Tag intent={STATUS_INTENT[item.status]} minimal>
                      {item.status}
                    </Tag>
                  </td>
                  <td>
                    <ButtonGroup minimal>
                      {item.status !== 'completed' && (
                        <Button
                          small
                          icon="tick"
                          title="Mark completed"
                          loading={complete.isLoading}
                          onClick={() => complete.mutate([item.id, {}])}
                        />
                      )}
                      <Button
                        small
                        icon="edit"
                        title="Edit"
                        onClick={() => openEdit(item)}
                      />
                      <Button
                        small
                        icon="trash"
                        intent={Intent.DANGER}
                        title="Delete"
                        loading={remove.isLoading}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${item.name}"? This cannot be undone.`,
                            )
                          ) {
                            remove.mutate(item.id);
                          }
                        }}
                      />
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        )}
      </div>

      <ComplianceDialog
        isOpen={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
      />
    </DashboardInsider>
  );
}

export default compose(withDashboardActions)(ZBComplianceCalendar);
