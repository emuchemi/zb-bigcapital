import { Inject, Injectable } from '@nestjs/common';
import { raw } from 'objection';
import { Account } from '@/modules/Accounts/models/Account.model';
import { AccountTransaction } from '@/modules/Accounts/models/AccountTransaction.model';
import { Expense } from '@/modules/Expenses/models/Expense.model';
import { Bill } from '@/modules/Bills/models/Bill';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ZBComplianceApplication } from '@/modules/ZBCompliance/ZBCompliance.application';

// ── Response shape ──────────────────────────────────────────────────────────

interface CashAccount {
  id: number;
  name: string;
  code: string;
  accountType: string;
  currencyCode: string;
  balance: number;
}

interface CurrencyAmount {
  currencyCode: string;
  amount: number;
}

interface RecentExpense {
  id: number;
  paymentDate: Date;
  description?: string;
  zbNotes?: string;
  totalAmount: number;
  currencyCode: string;
  zbStatus: string;
  projectSite?: string;
  paymentMethod?: string;
  isPettyCash: boolean;
}

interface ComplianceAlert {
  id: number;
  name: string;
  dueDate: Date;
  itemType: string;
  amountDue?: number;
  currency: string;
  status: string;
  daysUntilDue: number;
}

export interface ZBDashboardData {
  generatedAt: string;
  currentMonth: string;

  /** Bank and cash account balances */
  cashPosition: {
    accounts: CashAccount[];
    /** Sum of all balances converted to TZS at stored exchange rates */
    totalTZS: number;
  };

  /** Petty cash float balance */
  pettyCash: {
    balance: number;
    currencyCode: string;
  };

  /** Outstanding vendor bills */
  unpaidBills: {
    count: number;
    totalAmount: number;
    currencyCode: string;
  };

  /** Outstanding guest invoices */
  accountsReceivable: {
    count: number;
    totalAmount: number;
    currencyCode: string;
  };

  /** Draft and pending_review expense counts */
  expenseInbox: {
    draftCount: number;
    pendingReviewCount: number;
    totalCount: number;
  };

  /** 10 most recent expenses */
  recentExpenses: RecentExpense[];

  /** This month's income by currency */
  monthlyRevenue: {
    month: string;
    byCurrency: CurrencyAmount[];
    totalTZS: number;
  };

  /** This month's total expenses in TZS */
  monthlyBurn: {
    month: string;
    totalTZS: number;
  };

  /** Compliance obligations due within 30 days */
  upcomingCompliance: ComplianceAlert[];

  /** Count of overdue compliance items */
  overdueComplianceCount: number;
}

// Multiply an amount column by its transaction exchange rate to get the
// base-currency (TZS) equivalent. NULL or 0 rates are treated as 1 so
// base-currency (TZS) rows — where the rate is implicitly 1 — are not zeroed.
const RATE = 'COALESCE(NULLIF(exchange_rate, 0), 1)';
const SUM_DEBIT_TZS = `COALESCE(SUM(debit * ${RATE}), 0) as totalDebitBase`;
const SUM_CREDIT_TZS = `COALESCE(SUM(credit * ${RATE}), 0) as totalCreditBase`;

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ZBDashboardService {
  constructor(
    @Inject(Account.name)
    private readonly accountModel: TenantModelProxy<typeof Account>,

    @Inject(AccountTransaction.name)
    private readonly transactionModel: TenantModelProxy<typeof AccountTransaction>,

    @Inject(Expense.name)
    private readonly expenseModel: TenantModelProxy<typeof Expense>,

    @Inject(Bill.name)
    private readonly billModel: TenantModelProxy<typeof Bill>,

    private readonly complianceApplication: ZBComplianceApplication,
  ) {}

  /** Returns the complete Z&B founder dashboard in a single API call. */
  public async getDashboard(): Promise<ZBDashboardData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Run all queries concurrently for performance
    const [
      cashPosition,
      pettyCash,
      unpaidBills,
      accountsReceivable,
      expenseInbox,
      recentExpenses,
      monthlyRevenue,
      monthlyBurn,
      upcomingCompliance,
      overdueItems,
    ] = await Promise.all([
      this.getCashPosition(),
      this.getPettyCashBalance(),
      this.getUnpaidBills(),
      this.getAccountsReceivable(),
      this.getExpenseInboxCounts(),
      this.getRecentExpenses(),
      this.getMonthlyRevenue(monthStart, monthEnd),
      this.getMonthlyBurn(monthStart, monthEnd),
      this.getUpcomingCompliance(now),
      this.complianceApplication.getOverdue(),
    ]);

    return {
      generatedAt: now.toISOString(),
      currentMonth,
      cashPosition,
      pettyCash,
      unpaidBills,
      accountsReceivable,
      expenseInbox,
      recentExpenses,
      monthlyRevenue: { month: currentMonth, ...monthlyRevenue },
      monthlyBurn: { month: currentMonth, ...monthlyBurn },
      upcomingCompliance,
      overdueComplianceCount: overdueItems.length,
    };
  }

  // ── Cash position ───────────────────────────────────────────────────────

  private async getCashPosition() {
    // Bank and cash accounts only (excludes other current assets, which are
    // not cash and would overstate the position).
    const cashAccounts = await this.accountModel()
      .query()
      .whereIn('account_type', ['bank', 'cash'])
      .where('active', true)
      .select('id', 'name', 'code', 'account_type', 'currency_code');

    const accountIds = cashAccounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return { accounts: [], totalTZS: 0 };
    }

    // Per-account balance in the account's own currency (native), for display.
    const balances: Array<{ accountId: number; totalDebit: string; totalCredit: string }> =
      (await this.transactionModel()
        .query()
        .select('account_id as accountId')
        .sum('debit as totalDebit')
        .sum('credit as totalCredit')
        .whereIn('account_id', accountIds)
        .groupBy('account_id')) as any;

    const balanceMap = new Map(
      balances.map((b) => [
        b.accountId,
        Number(b.totalDebit) - Number(b.totalCredit),
      ]),
    );

    const accounts: CashAccount[] = cashAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      code: account.code,
      accountType: account.accountType,
      currencyCode: account.currencyCode || 'TZS',
      balance: balanceMap.get(account.id) ?? 0,
    }));

    // Consolidated TZS total across ALL currencies, using each transaction's
    // stored exchange rate (debit/credit are in the account currency).
    const baseRow: any = await this.transactionModel()
      .query()
      .select(raw(SUM_DEBIT_TZS))
      .select(raw(SUM_CREDIT_TZS))
      .whereIn('account_id', accountIds)
      .first();

    const totalTZS =
      Number(baseRow?.totalDebitBase ?? 0) - Number(baseRow?.totalCreditBase ?? 0);

    return { accounts, totalTZS };
  }

  // ── Petty cash ──────────────────────────────────────────────────────────

  private async getPettyCashBalance() {
    const pettyCashAccount = await this.accountModel()
      .query()
      .findOne('slug', 'petty-cash');

    if (!pettyCashAccount) {
      return { balance: 0, currencyCode: 'TZS' };
    }

    const result: any = await this.transactionModel()
      .query()
      .select()
      .sum('debit as totalDebit')
      .sum('credit as totalCredit')
      .where('account_id', pettyCashAccount.id)
      .first();

    const balance = Number(result?.totalDebit ?? 0) - Number(result?.totalCredit ?? 0);

    return {
      balance,
      currencyCode: pettyCashAccount.currencyCode || 'TZS',
    };
  }

  // ── Unpaid bills ────────────────────────────────────────────────────────

  private async getUnpaidBills() {
    // openedAt NOT NULL = published/open bill (null = still a draft)
    // Remaining balance = amount - paymentAmount - creditedAmount (bill currency),
    // converted to TZS via the bill's stored exchange rate.
    const unpaidBills = await this.billModel()
      .query()
      .whereNotNull('opened_at')
      .whereRaw('amount > (COALESCE(payment_amount, 0) + COALESCE(credited_amount, 0))')
      .select(
        'id',
        'amount',
        'payment_amount as paymentAmount',
        'credited_amount as creditedAmount',
        'currency_code as currencyCode',
        'exchange_rate as exchangeRate',
      );

    const count = unpaidBills.length;
    const totalAmount = unpaidBills.reduce((sum, bill: any) => {
      const unpaid =
        Number(bill.amount) -
        Number(bill.paymentAmount ?? 0) -
        Number(bill.creditedAmount ?? 0);
      const rate = Number(bill.exchangeRate) || 1;
      return sum + Math.max(unpaid, 0) * rate;
    }, 0);

    return { count, totalAmount, currencyCode: 'TZS' };
  }

  // ── Accounts receivable ─────────────────────────────────────────────────

  private async getAccountsReceivable() {
    // Find the accounts receivable account
    const arAccount = await this.accountModel()
      .query()
      .findOne('slug', 'accounts-receivable');

    if (!arAccount) {
      return { count: 0, totalAmount: 0, currencyCode: 'TZS' };
    }

    // Balance in TZS via per-transaction exchange rate.
    const result: any = await this.transactionModel()
      .query()
      .select(raw(SUM_DEBIT_TZS))
      .select(raw(SUM_CREDIT_TZS))
      .countDistinct('reference_id as count')
      .where('account_id', arAccount.id)
      .first();

    const balance =
      Number(result?.totalDebitBase ?? 0) - Number(result?.totalCreditBase ?? 0);

    return {
      count: Number(result?.count ?? 0),
      totalAmount: Math.max(balance, 0),
      currencyCode: 'TZS',
    };
  }

  // ── Expense inbox counts ────────────────────────────────────────────────

  private async getExpenseInboxCounts() {
    const counts: Array<{ zbStatus: string; count: string }> =
      (await this.expenseModel()
        .query()
        .select('zb_status as zbStatus')
        .count('id as count')
        .whereIn('zb_status', ['draft', 'pending_review'])
        .groupBy('zb_status')) as any;

    const draftCount = Number(
      counts.find((c) => c.zbStatus === 'draft')?.count ?? 0,
    );
    const pendingReviewCount = Number(
      counts.find((c) => c.zbStatus === 'pending_review')?.count ?? 0,
    );

    return {
      draftCount,
      pendingReviewCount,
      totalCount: draftCount + pendingReviewCount,
    };
  }

  // ── Recent expenses ─────────────────────────────────────────────────────

  private async getRecentExpenses(): Promise<RecentExpense[]> {
    const expenses = await this.expenseModel()
      .query()
      .orderBy('payment_date', 'desc')
      .limit(10)
      .select(
        'id',
        'payment_date as paymentDate',
        'description',
        'zb_notes as zbNotes',
        'total_amount as totalAmount',
        'currency_code as currencyCode',
        'zb_status as zbStatus',
        'project_site as projectSite',
        'payment_method as paymentMethod',
        'is_petty_cash as isPettyCash',
      );

    return expenses as any[];
  }

  // ── Monthly revenue ─────────────────────────────────────────────────────

  private async getMonthlyRevenue(monthStart: string, monthEnd: string) {
    // Find income account IDs
    const incomeAccounts = await this.accountModel()
      .query()
      .whereIn('account_type', ['income', 'other-income'])
      .select('id');

    if (incomeAccounts.length === 0) {
      return { byCurrency: [], totalTZS: 0 };
    }

    const incomeAccountIds = incomeAccounts.map((a) => a.id);

    // Per-currency revenue (native amounts), for the breakdown.
    const rows: Array<{ currencyCode: string; totalCredit: string; totalDebit: string }> =
      (await this.transactionModel()
        .query()
        .select('currency_code as currencyCode')
        .sum('credit as totalCredit')
        .sum('debit as totalDebit')
        .whereIn('account_id', incomeAccountIds)
        .whereBetween('date', [monthStart, monthEnd])
        .groupBy('currency_code')) as any;

    const byCurrency: CurrencyAmount[] = rows.map((row) => ({
      currencyCode: row.currencyCode,
      // Net revenue = credits - debits (returns/refunds reduce revenue)
      amount: Number(row.totalCredit) - Number(row.totalDebit),
    }));

    // Consolidated TZS total across all currencies via stored exchange rates.
    const baseRow: any = await this.transactionModel()
      .query()
      .select(raw(SUM_CREDIT_TZS))
      .select(raw(SUM_DEBIT_TZS))
      .whereIn('account_id', incomeAccountIds)
      .whereBetween('date', [monthStart, monthEnd])
      .first();

    const totalTZS =
      Number(baseRow?.totalCreditBase ?? 0) - Number(baseRow?.totalDebitBase ?? 0);

    return { byCurrency, totalTZS };
  }

  // ── Monthly burn ────────────────────────────────────────────────────────

  private async getMonthlyBurn(monthStart: string, monthEnd: string) {
    // Find expense account IDs
    const expenseAccounts = await this.accountModel()
      .query()
      .whereIn('account_type', ['expense', 'other-expense', 'cost-of-goods-sold'])
      .select('id');

    if (expenseAccounts.length === 0) {
      return { totalTZS: 0 };
    }

    const expenseAccountIds = expenseAccounts.map((a) => a.id);

    // Spending in TZS via per-transaction exchange rate (debits = spending).
    const result: any = await this.transactionModel()
      .query()
      .select(raw(SUM_DEBIT_TZS))
      .select(raw(SUM_CREDIT_TZS))
      .whereIn('account_id', expenseAccountIds)
      .whereBetween('date', [monthStart, monthEnd])
      .first();

    const totalTZS = Math.max(
      Number(result?.totalDebitBase ?? 0) - Number(result?.totalCreditBase ?? 0),
      0,
    );

    return { totalTZS };
  }

  // ── Upcoming compliance ─────────────────────────────────────────────────

  private async getUpcomingCompliance(now: Date): Promise<ComplianceAlert[]> {
    const items = await this.complianceApplication.getDueWithinDays(30);
    const today = now.getTime();

    return items.map((item) => {
      const dueDate = new Date(item.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today) / (1000 * 60 * 60 * 24),
      );

      return {
        id: item.id,
        name: item.name,
        dueDate: item.dueDate as any,
        itemType: item.itemType,
        amountDue: item.amountDue,
        currency: item.currency,
        status: item.status,
        daysUntilDue,
      };
    });
  }
}
