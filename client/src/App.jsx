import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LoaderCircle,
  Plus,
  ReceiptText,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptySummary = { totalIncome: 0, totalExpense: 0, balance: 0 };
const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Salary",
  "Freelance",
  "Other",
];
const categoryColors = {
  "Food & Dining": "peach",
  Transportation: "blue",
  Shopping: "purple",
  "Bills & Utilities": "orange",
  Entertainment: "pink",
  Health: "green",
  Salary: "green",
  Freelance: "teal",
  Other: "gray",
};

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error) {
  return error.response?.data?.message || "Something went wrong. Please try again.";
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: today(),
  });

  const loadDashboard = useCallback(async () => {
    setPageError("");
    try {
      const [transactionResponse, summaryResponse] = await Promise.all([
        axios.get("/api/transactions"),
        axios.get("/api/transactions/summary"),
      ]);
      setTransactions(transactionResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recentTransactions = useMemo(() => transactions, [transactions]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  function validateForm() {
    const errors = {};
    if (!form.title.trim()) errors.title = "Please enter a transaction name.";
    if (form.amount === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      errors.amount = "Amount must be greater than zero.";
    }
    if (!form.category) errors.category = "Please choose a category.";
    if (!["income", "expense"].includes(form.type)) errors.type = "Choose income or expense.";
    if (!form.date || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) {
      errors.date = "Please enter a valid date.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function addTransaction(event) {
    event.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      await axios.post("/api/transactions", {
        ...form,
        title: form.title.trim(),
        amount: Number(form.amount),
        date: new Date(`${form.date}T12:00:00`).toISOString(),
      });
      setForm({ title: "", amount: "", type: "expense", category: "", date: today() });
      setFieldErrors({});
      await loadDashboard();
    } catch (error) {
      const responseErrors = error.response?.data?.errors;
      if (responseErrors) {
        setFieldErrors(responseErrors);
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id) {
    setPageError("");
    try {
      await axios.delete(`/api/transactions/${id}`);
      await loadDashboard();
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  }

  const summaryCards = [
    {
      label: "Total income",
      value: summary.totalIncome,
      icon: ArrowDownLeft,
      tone: "income",
      detail: "Money in",
    },
    {
      label: "Total expenses",
      value: summary.totalExpense,
      icon: ArrowUpRight,
      tone: "expense",
      detail: "Money out",
    },
    {
      label: "Current balance",
      value: summary.balance,
      icon: Wallet,
      tone: "balance",
      detail: "Income minus expenses",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Ledgerly home">
          <span className="brand-mark"><CircleDollarSign size={23} strokeWidth={2.2} /></span>
          <span>ledgerly<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={18} /> Overview</a>
          <a className="nav-item" href="#transactions"><ReceiptText size={18} /> Transactions</a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <div className="tip-icon"><TrendingUp size={19} /></div>
          <strong>Small steps add up.</strong>
          <p>Keep an eye on your spending and make your money work for you.</p>
        </div>
        <div className="sidebar-footer">
          <span className="avatar">L</span>
          <span><strong>Your finances</strong><small>Personal account</small></span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-right">
            <span className="today-label"><CalendarDays size={15} /> {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date())}</span>
            <span className="topbar-avatar">L</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row" id="overview">
            <div>
              <p className="eyebrow">YOUR MONEY, AT A GLANCE</p>
              <h1>Good things happen when you track.</h1>
              <p className="welcome-subtitle">A clear view of your finances starts right here.</p>
            </div>
            <a className="quick-add" href="#add-transaction"><Plus size={17} /> Add transaction</a>
          </section>

          {pageError && (
            <div className="alert alert-error" role="alert">
              <span>{pageError}</span>
              <button type="button" onClick={loadDashboard}>Retry</button>
            </div>
          )}

          <section className="summary-grid" aria-label="Financial summary">
            {summaryCards.map(({ label, value, icon: Icon, tone, detail }) => (
              <article className={`summary-card ${tone}`} key={label}>
                <div className="summary-card-top">
                  <span>{label}</span>
                  <span className="summary-icon"><Icon size={19} /></span>
                </div>
                <div className="summary-value">{loading ? <span className="skeleton-value" /> : currency(value)}</div>
                <div className="summary-detail"><span className={`detail-dot ${tone}`} />{detail}</div>
              </article>
            ))}
          </section>

          <div className="dashboard-grid">
            <section className="panel transaction-panel" id="transactions">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR ACTIVITY</p>
                  <h2>Recent transactions</h2>
                </div>
                <span className="transaction-count">{transactions.length} {transactions.length === 1 ? "entry" : "entries"}</span>
              </div>
              <div className="transaction-table-wrap">
                <table className="transaction-table">
                  <thead>
                    <tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th className="amount-heading">AMOUNT</th><th><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="table-state" colSpan="5"><LoaderCircle className="spinner" size={20} /> Loading transactions…</td></tr>
                    ) : recentTransactions.length === 0 ? (
                      <tr><td className="table-state empty-state" colSpan="5">
                        <span className="empty-icon"><CreditCard size={22} /></span>
                        <strong>No transactions yet</strong>
                        <span>Add your first income or expense to get started.</span>
                      </td></tr>
                    ) : recentTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>
                          <div className="transaction-title">
                            <span className={`transaction-type-icon ${transaction.type}`}>
                              {transaction.type === "income" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </span>
                            <span><strong>{transaction.title}</strong><small>{transaction.type === "income" ? "Income" : "Expense"}</small></span>
                          </div>
                        </td>
                        <td><span className={`category-badge ${categoryColors[transaction.category] || "gray"}`}>{transaction.category}</span></td>
                        <td className="date-cell">{dateLabel(transaction.date)}</td>
                        <td className={`amount-cell ${transaction.type}`}>
                          {transaction.type === "income" ? "+" : "−"}{currency(transaction.amount)}
                        </td>
                        <td className="action-cell">
                          <button className="icon-button delete-button" type="button" onClick={() => deleteTransaction(transaction._id)} aria-label={`Delete ${transaction.title}`} title="Delete transaction">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel" id="add-transaction">
              <div className="panel-heading form-heading">
                <div>
                  <p className="eyebrow">KEEP IT UP TO DATE</p>
                  <h2>New transaction</h2>
                </div>
                <span className="form-heading-icon"><Plus size={18} /></span>
              </div>
              <form onSubmit={addTransaction} noValidate>
                <div className="type-toggle" role="group" aria-label="Transaction type">
                  <button type="button" className={form.type === "expense" ? "selected expense" : ""} onClick={() => setForm((current) => ({ ...current, type: "expense" }))}>
                    <ArrowUpRight size={16} /> Expense
                  </button>
                  <button type="button" className={form.type === "income" ? "selected income" : ""} onClick={() => setForm((current) => ({ ...current, type: "income" }))}>
                    <ArrowDownLeft size={16} /> Income
                  </button>
                </div>
                {fieldErrors.type && <span className="field-error">{fieldErrors.type}</span>}

                <label className="form-label" htmlFor="title">Transaction name</label>
                <input id="title" name="title" type="text" placeholder="e.g. Weekly groceries" value={form.title} onChange={updateField} maxLength="120" aria-invalid={Boolean(fieldErrors.title)} />
                {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}

                <label className="form-label" htmlFor="amount">Amount</label>
                <div className={`amount-input ${fieldErrors.amount ? "invalid" : ""}`}>
                  <span>$</span>
                  <input id="amount" name="amount" type="number" placeholder="0.00" value={form.amount} onChange={updateField} min="0.01" step="0.01" inputMode="decimal" aria-invalid={Boolean(fieldErrors.amount)} />
                  <span className="currency-code">USD</span>
                </div>
                {fieldErrors.amount && <span className="field-error">{fieldErrors.amount}</span>}

                <label className="form-label" htmlFor="category">Category</label>
                <div className="select-wrap">
                  <select id="category" name="category" value={form.category} onChange={updateField} aria-invalid={Boolean(fieldErrors.category)}>
                    <option value="" disabled>Select a category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <ChevronDown size={16} />
                </div>
                {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}

                <label className="form-label" htmlFor="date">Date</label>
                <div className="date-input-wrap">
                  <input id="date" name="date" type="date" value={form.date} onChange={updateField} aria-invalid={Boolean(fieldErrors.date)} />
                  <CalendarDays size={16} />
                </div>
                {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}

                {formError && <div className="alert alert-error form-alert" role="alert">{formError}</div>}
                <button className="submit-button" type="submit" disabled={saving}>
                  {saving ? <LoaderCircle size={17} className="spinner" /> : <Check size={17} />}
                  {saving ? "Saving transaction…" : "Save transaction"}
                </button>
              </form>
            </section>
          </div>
          <footer className="page-footer"><span>Ledgerly</span> · Your finances, thoughtfully organized.</footer>
        </div>
      </main>
    </div>
  );
}

export default App;
