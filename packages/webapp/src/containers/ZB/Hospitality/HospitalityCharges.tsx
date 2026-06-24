// @ts-nocheck
/**
 * Z&B Hospitality Charges
 * -----------------------
 * Admin-configurable per-guest, per-night, and percentage hospitality levies
 * for Zanzibar/Tanzania compliance. Backed by /api/zb/hospitality-charges
 * (ZBHospitalityCharges server module).
 */
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Checkbox,
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
  useZBHospitalityCharges,
  useCreateZBHospitalityCharge,
  useEditZBHospitalityCharge,
  useDeleteZBHospitalityCharge,
} from '@/hooks/query';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';

const CHARGE_TYPES = [
  { value: 'fixed_per_guest_night', label: 'Fixed per guest/night' },
  { value: 'percentage_of_revenue', label: '% of revenue' },
  { value: 'fixed_per_booking', label: 'Fixed per booking' },
];
const GUEST_CATEGORIES = [
  { value: 'all', label: 'All guests' },
  { value: 'foreign', label: 'Foreign' },
  { value: 'resident', label: 'Resident' },
  { value: 'citizen', label: 'Citizen' },
];
const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'per_booking', label: 'Per booking' },
];
const TREATMENTS = [
  { value: 'pass_through', label: 'Pass-through (collected for authority)' },
  { value: 'expense', label: 'Operating expense' },
  { value: 'revenue', label: 'Our revenue' },
];

const labelFor = (list, value) =>
  (list.find((o) => o.value === value) || {}).label || value;

const fmtRate = (charge) => {
  const rate = Number(charge.rate || 0);
  if (charge.chargeType === 'percentage_of_revenue') return `${rate}%`;
  return `${charge.currency || 'TZS'} ${rate.toLocaleString()}`;
};

const emptyForm = {
  name: '',
  authority: '',
  chargeType: 'fixed_per_guest_night',
  rate: '',
  currency: 'TZS',
  guestCategory: 'all',
  effectiveFrom: '',
  effectiveTo: '',
  remittanceFrequency: 'monthly',
  accountingTreatment: 'pass_through',
  notes: '',
  active: true,
};

function ChargeDialog({ isOpen, onClose, editing }) {
  const [form, setForm] = useState(emptyForm);
  const create = useCreateZBHospitalityCharge();
  const edit = useEditZBHospitalityCharge();
  const saving = create.isLoading || edit.isLoading;

  useEffect(() => {
    if (isOpen) {
      setForm(
        editing
          ? {
              name: editing.name || '',
              authority: editing.authority || '',
              chargeType: editing.chargeType || 'fixed_per_guest_night',
              rate: editing.rate ?? '',
              currency: editing.currency || 'TZS',
              guestCategory: editing.guestCategory || 'all',
              effectiveFrom: (editing.effectiveFrom || '').slice(0, 10),
              effectiveTo: (editing.effectiveTo || '').slice(0, 10),
              remittanceFrequency: editing.remittanceFrequency || 'monthly',
              accountingTreatment: editing.accountingTreatment || 'pass_through',
              notes: editing.notes || '',
              active: editing.active != null ? !!editing.active : true,
            }
          : emptyForm,
      );
    }
  }, [isOpen, editing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const payload = {
      name: form.name,
      authority: form.authority || undefined,
      chargeType: form.chargeType,
      rate: Number(form.rate),
      currency: form.currency || 'TZS',
      guestCategory: form.guestCategory,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || undefined,
      remittanceFrequency: form.remittanceFrequency,
      accountingTreatment: form.accountingTreatment,
      notes: form.notes || undefined,
      active: form.active,
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
      title={editing ? 'Edit hospitality charge' : 'New hospitality charge'}
      style={{ width: 560 }}
    >
      <div className={Classes.DIALOG_BODY}>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Name" labelInfo="(required)" style={{ flex: 2 }}>
            <InputGroup
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Infrastructure Tax"
            />
          </FormGroup>
          <FormGroup label="Authority" style={{ flex: 2 }}>
            <InputGroup
              value={form.authority}
              onChange={set('authority')}
              placeholder="e.g. Zanzibar Revenue Board"
            />
          </FormGroup>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Charge type" style={{ flex: 2 }}>
            <HTMLSelect
              fill
              value={form.chargeType}
              onChange={set('chargeType')}
              options={CHARGE_TYPES}
            />
          </FormGroup>
          <FormGroup label="Rate / amount" labelInfo="(required)" style={{ flex: 1 }}>
            <InputGroup type="number" value={form.rate} onChange={set('rate')} />
          </FormGroup>
          <FormGroup label="Currency" style={{ width: 100 }}>
            <InputGroup value={form.currency} onChange={set('currency')} maxLength={3} />
          </FormGroup>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Guest category" style={{ flex: 1 }}>
            <HTMLSelect
              fill
              value={form.guestCategory}
              onChange={set('guestCategory')}
              options={GUEST_CATEGORIES}
            />
          </FormGroup>
          <FormGroup label="Remittance" style={{ flex: 1 }}>
            <HTMLSelect
              fill
              value={form.remittanceFrequency}
              onChange={set('remittanceFrequency')}
              options={FREQUENCIES}
            />
          </FormGroup>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormGroup label="Effective from" labelInfo="(required)" style={{ flex: 1 }}>
            <InputGroup
              type="date"
              value={form.effectiveFrom}
              onChange={set('effectiveFrom')}
            />
          </FormGroup>
          <FormGroup label="Effective to" style={{ flex: 1 }}>
            <InputGroup
              type="date"
              value={form.effectiveTo}
              onChange={set('effectiveTo')}
            />
          </FormGroup>
        </div>
        <FormGroup label="Accounting treatment">
          <HTMLSelect
            fill
            value={form.accountingTreatment}
            onChange={set('accountingTreatment')}
            options={TREATMENTS}
          />
        </FormGroup>
        <FormGroup label="Notes">
          <TextArea fill growVertically value={form.notes} onChange={set('notes')} />
        </FormGroup>
        <Checkbox
          checked={form.active}
          label="Active (apply this charge)"
          onChange={(e) =>
            setForm((f) => ({ ...f, active: e.target.checked }))
          }
        />
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
            disabled={!form.name || form.rate === '' || !form.effectiveFrom}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function ZBHospitalityCharges({ changePageTitle }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: charges, isLoading } = useZBHospitalityCharges();
  const remove = useDeleteZBHospitalityCharge();

  useEffect(() => {
    changePageTitle('Hospitality Charges');
  }, [changePageTitle]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setDialogOpen(true);
  };

  return (
    <DashboardInsider name="zb-hospitality-charges">
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Hospitality Charges</h2>
            <span className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
              Levies and taxes applied to guest stays. Inactive rules are not applied.
            </span>
          </div>
          <Button icon="plus" intent={Intent.PRIMARY} onClick={openNew}>
            New charge
          </Button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : !charges || charges.length === 0 ? (
          <NonIdealState
            icon="bank-account"
            title="No hospitality charges"
            description="Add levy rules such as the Hotel Levy or Infrastructure Tax."
            action={
              <Button intent={Intent.PRIMARY} icon="plus" onClick={openNew}>
                New charge
              </Button>
            }
          />
        ) : (
          <HTMLTable striped bordered style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th>Guests</th>
                <th>Treatment</th>
                <th>Status</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.authority ? (
                      <div className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                        {c.authority}
                      </div>
                    ) : null}
                  </td>
                  <td>{labelFor(CHARGE_TYPES, c.chargeType)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmtRate(c)}
                  </td>
                  <td>{labelFor(GUEST_CATEGORIES, c.guestCategory)}</td>
                  <td>{labelFor(TREATMENTS, c.accountingTreatment)}</td>
                  <td>
                    {c.active ? (
                      <Tag intent={Intent.SUCCESS} minimal>
                        active
                      </Tag>
                    ) : (
                      <Tag minimal>inactive</Tag>
                    )}
                    {c.confidenceStatus === 'pending_review' ? (
                      <Tag
                        intent={Intent.WARNING}
                        minimal
                        style={{ marginLeft: 4 }}
                      >
                        unverified
                      </Tag>
                    ) : null}
                  </td>
                  <td>
                    <ButtonGroup minimal>
                      <Button
                        small
                        icon="edit"
                        title="Edit"
                        onClick={() => openEdit(c)}
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
                              `Delete "${c.name}"? This cannot be undone.`,
                            )
                          ) {
                            remove.mutate(c.id);
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

      <ChargeDialog
        isOpen={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
      />
    </DashboardInsider>
  );
}

export default compose(withDashboardActions)(ZBHospitalityCharges);
