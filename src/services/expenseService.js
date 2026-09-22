import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

// Fetch all expenses (ordered newest first)
export async function getExpenses() {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (!error && data) {
        // Also cache locally
        localStore.saveExpenses(data);
        return data;
      }
      if (error) {
        console.warn('Supabase fetch expenses notice (falling back to local):', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch expenses error:', err);
    }
  }
  return localStore.getExpenses();
}

// Add a new expense (Milk, Chicken, Current bill, Worker Salary, etc.)
export async function addExpense({
  title,
  category = 'Raw Materials',
  amount,
  payment_method = 'CASH',
  expense_date = new Date().toISOString().split('T')[0],
  notes = ''
}) {
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) {
    throw new Error('Please provide an expense title/description (e.g. Milk, Chicken, Salary)');
  }
  const cleanAmount = Number(amount);
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new Error('Please provide a valid expense amount greater than 0');
  }

  const payload = {
    title: cleanTitle,
    category,
    amount: cleanAmount,
    payment_method: payment_method.toUpperCase(),
    expense_date,
    notes: notes ? notes.trim() : ''
  };

  let createdExpense = null;

  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select()
        .limit(1);

      if (!error && data && data.length > 0) {
        createdExpense = data[0];
      } else if (error) {
        console.warn('Supabase insert expense notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert expense catch error:', err);
    }
  }

  // Fallback / local sync
  const currentExpenses = localStore.getExpenses();
  if (!createdExpense) {
    createdExpense = {
      id: 'exp-' + Date.now(),
      ...payload,
      created_at: new Date().toISOString()
    };
  }

  // Prepend to local list
  const updated = [createdExpense, ...currentExpenses.filter(e => e.id !== createdExpense.id)];
  localStore.saveExpenses(updated);

  return createdExpense;
}

// Delete an expense by ID
export async function deleteExpense(expenseId) {
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.warn('Supabase delete expense notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete expense catch error:', err);
    }
  }

  const currentExpenses = localStore.getExpenses();
  const updated = currentExpenses.filter(e => e.id !== expenseId);
  localStore.saveExpenses(updated);
  return true;
}
