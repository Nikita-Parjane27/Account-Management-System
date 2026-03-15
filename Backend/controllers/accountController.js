import supabase from '../config/supabaseClient.js';

// GET /api/account/balance
export const getBalance = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ balance: user.balance });
  } catch (err) {
    console.error('Get balance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/account/statement
export const getStatement = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        transaction_type,
        created_at,
        balance_after,
        sender:sender_id (id, name, email),
        receiver:receiver_id (id, name, email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch statement' });
    }

    // Only show debit row for sender, credit row for receiver
    const userTransactions = transactions.filter((txn) => {
      if (txn.transaction_type === 'debit') return txn.sender?.id === userId;
      if (txn.transaction_type === 'credit') return txn.receiver?.id === userId;
      return false;
    });

    res.json({ transactions: userTransactions });
  } catch (err) {
    console.error('Statement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/account/transfer
export const transfer = async (req, res) => {
  const { receiverEmail, amount } = req.body;
  const senderId = req.user.id;

  if (!receiverEmail || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid transfer details' });
  }

  try {
    // 1. Get sender balance
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, name, balance')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // 2. Check sufficient balance
    if (parseFloat(sender.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 3. Get receiver
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name, balance')
      .eq('email', receiverEmail)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // 4. Cannot send to yourself
    if (receiver.id === senderId) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    const newSenderBalance = parseFloat(sender.balance) - parseFloat(amount);
    const newReceiverBalance = parseFloat(receiver.balance) + parseFloat(amount);

    // 5. Deduct from sender
    const { error: deductError } = await supabase
      .from('users')
      .update({ balance: newSenderBalance })
      .eq('id', senderId);

    if (deductError) {
      return res.status(500).json({ message: 'Transfer failed' });
    }

    // 6. Add to receiver
    const { error: addError } = await supabase
      .from('users')
      .update({ balance: newReceiverBalance })
      .eq('id', receiver.id);

    if (addError) {
      // Rollback sender balance
      await supabase
        .from('users')
        .update({ balance: sender.balance })
        .eq('id', senderId);
      return res.status(500).json({ message: 'Transfer failed, rolled back' });
    }

    // 7. Insert debit record for sender
    // 8. Insert credit record for receiver
    await supabase.from('transactions').insert([
      {
        sender_id: senderId,
        receiver_id: receiver.id,
        amount: parseFloat(amount),
        transaction_type: 'debit',
        balance_after: newSenderBalance,
      },
      {
        sender_id: senderId,
        receiver_id: receiver.id,
        amount: parseFloat(amount),
        transaction_type: 'credit',
        balance_after: newReceiverBalance,
      },
    ]);

    res.json({
      message: `₹${amount} sent to ${receiver.name} successfully`,
      newBalance: newSenderBalance,
    });

  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/account/users
export const getUsers = async (req, res) => {
  const { search } = req.query;

  try {
    let query = supabase
      .from('users')
      .select('id, name, email')
      .neq('id', req.user.id)
      .limit(10);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};