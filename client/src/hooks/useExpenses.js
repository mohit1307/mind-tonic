import { useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';

export function useExpenses(initialCategory = 'all') {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [category, setCategory] = useState(initialCategory);
  const [isCollegeFee, setIsCollegeFee] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, statsData] = await Promise.all([
        expenseService.getExpenses({
          category: category !== 'all' ? category : undefined,
          isCollegeFee: isCollegeFee !== '' ? isCollegeFee : undefined,
          status: status !== 'all' ? status : undefined,
          search: search.trim() || undefined,
        }),
        expenseService.getStats(),
      ]);
      setExpenses(expensesData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [category, isCollegeFee, status, search]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createExpense = async (data) => {
    const newExp = await expenseService.createExpense(data);
    await fetchAll();
    return newExp;
  };

  const createFromOCR = async (data) => {
    const newExp = await expenseService.createFromOCR(data);
    await fetchAll();
    return newExp;
  };

  const updateExpense = async (id, data) => {
    const updated = await expenseService.updateExpense(id, data);
    await fetchAll();
    return updated;
  };

  const deleteExpense = async (id) => {
    await expenseService.deleteExpense(id);
    await fetchAll();
  };

  return {
    expenses,
    stats,
    category,
    setCategory,
    isCollegeFee,
    setIsCollegeFee,
    status,
    setStatus,
    search,
    setSearch,
    loading,
    error,
    refresh: fetchAll,
    createExpense,
    createFromOCR,
    updateExpense,
    deleteExpense,
  };
}

export default useExpenses;
