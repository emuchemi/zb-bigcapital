// @ts-nocheck
/**
 * Z&B custom feature hooks: founder dashboard, compliance calendar,
 * and hospitality charges. Wires to the /api/zb/* endpoints added in
 * the server's ZBDashboard, ZBCompliance, and ZBHospitalityCharges modules.
 */
import { useMutation, useQueryClient } from 'react-query';
import useApiRequest from '../useRequest';
import { useRequestQuery } from '../useQueryRequest';
import t from './types';

// ── Founder Dashboard ────────────────────────────────────────────────────────

/**
 * Retrieve the full founder dashboard payload in one request.
 */
export function useZBDashboard(props) {
  return useRequestQuery(
    [t.ZB_DASHBOARD],
    { method: 'get', url: `zb/dashboard` },
    {
      select: (res) => res.data,
      defaultData: {},
      ...props,
    },
  );
}

// ── Compliance Calendar ──────────────────────────────────────────────────────

const invalidateCompliance = (queryClient) => {
  queryClient.invalidateQueries(t.ZB_COMPLIANCE);
  queryClient.invalidateQueries(t.ZB_COMPLIANCE_ITEM);
  // The dashboard surfaces compliance, so refresh it too.
  queryClient.invalidateQueries(t.ZB_DASHBOARD);
};

/**
 * Retrieve compliance items. Pass { scope: 'upcoming' | 'overdue' } to use the
 * dedicated endpoints, otherwise returns all items ordered by due date.
 */
export function useZBComplianceItems(query = {}, props) {
  const { scope } = query;
  const url =
    scope === 'upcoming'
      ? 'zb/compliance/upcoming'
      : scope === 'overdue'
        ? 'zb/compliance/overdue'
        : 'zb/compliance';

  return useRequestQuery(
    [t.ZB_COMPLIANCE, query],
    { method: 'get', url },
    {
      select: (res) => res.data,
      defaultData: [],
      ...props,
    },
  );
}

/**
 * Retrieve a single compliance item.
 */
export function useZBComplianceItem(id, props) {
  return useRequestQuery(
    [t.ZB_COMPLIANCE_ITEM, id],
    { method: 'get', url: `zb/compliance/${id}` },
    {
      select: (res) => res.data,
      defaultData: {},
      enabled: !!id,
      ...props,
    },
  );
}

export function useCreateZBComplianceItem(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation((values) => apiRequest.post('zb/compliance', values), {
    onSuccess: () => invalidateCompliance(queryClient),
    ...props,
  });
}

export function useEditZBComplianceItem(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    ([id, values]) => apiRequest.put(`zb/compliance/${id}`, values),
    {
      onSuccess: () => invalidateCompliance(queryClient),
      ...props,
    },
  );
}

export function useCompleteZBComplianceItem(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    ([id, values]) => apiRequest.post(`zb/compliance/${id}/complete`, values),
    {
      onSuccess: () => invalidateCompliance(queryClient),
      ...props,
    },
  );
}

export function useDeleteZBComplianceItem(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation((id) => apiRequest.delete(`zb/compliance/${id}`), {
    onSuccess: () => invalidateCompliance(queryClient),
    ...props,
  });
}

// ── Hospitality Charges ──────────────────────────────────────────────────────

const invalidateHospitality = (queryClient) => {
  queryClient.invalidateQueries(t.ZB_HOSPITALITY_CHARGES);
  queryClient.invalidateQueries(t.ZB_HOSPITALITY_CHARGE);
};

/**
 * Retrieve hospitality charge rules.
 */
export function useZBHospitalityCharges(props) {
  return useRequestQuery(
    [t.ZB_HOSPITALITY_CHARGES],
    { method: 'get', url: `zb/hospitality-charges` },
    {
      select: (res) => res.data,
      defaultData: [],
      ...props,
    },
  );
}

/**
 * Retrieve a single hospitality charge rule.
 */
export function useZBHospitalityCharge(id, props) {
  return useRequestQuery(
    [t.ZB_HOSPITALITY_CHARGE, id],
    { method: 'get', url: `zb/hospitality-charges/${id}` },
    {
      select: (res) => res.data,
      defaultData: {},
      enabled: !!id,
      ...props,
    },
  );
}

export function useCreateZBHospitalityCharge(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    (values) => apiRequest.post('zb/hospitality-charges', values),
    {
      onSuccess: () => invalidateHospitality(queryClient),
      ...props,
    },
  );
}

export function useEditZBHospitalityCharge(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    ([id, values]) => apiRequest.put(`zb/hospitality-charges/${id}`, values),
    {
      onSuccess: () => invalidateHospitality(queryClient),
      ...props,
    },
  );
}

export function useDeleteZBHospitalityCharge(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    (id) => apiRequest.delete(`zb/hospitality-charges/${id}`),
    {
      onSuccess: () => invalidateHospitality(queryClient),
      ...props,
    },
  );
}

// ── Expense Inbox ─────────────────────────────────────────────────────────────

const invalidateInbox = (queryClient) => {
  queryClient.invalidateQueries(t.ZB_EXPENSE_INBOX);
  queryClient.invalidateQueries(t.EXPENSES);
  queryClient.invalidateQueries(t.ZB_DASHBOARD);
};

/**
 * Retrieve the expense inbox (draft + pending_review expenses).
 */
export function useExpenseInbox(props) {
  return useRequestQuery(
    [t.ZB_EXPENSE_INBOX],
    { method: 'get', url: `expenses/zb/inbox` },
    {
      select: (res) => res.data,
      defaultData: [],
      ...props,
    },
  );
}

/**
 * Submit an expense to the accountant for review.
 */
export function useSubmitExpenseForReview(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation((id) => apiRequest.post(`expenses/${id}/zb/submit`), {
    onSuccess: () => invalidateInbox(queryClient),
    ...props,
  });
}

/**
 * Return a submitted expense back to draft for correction.
 */
export function useReturnExpenseToDraft(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();

  return useMutation(
    (id) => apiRequest.post(`expenses/${id}/zb/return-to-draft`),
    {
      onSuccess: () => invalidateInbox(queryClient),
      ...props,
    },
  );
}
