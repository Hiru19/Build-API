const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const { User, Transaction } = require('./models');
const Dbconnection=require('./Database')


Dbconnection();

const app = express();
const port = 4000;

app.use(bodyParser.json());








// Customer signup
app.post('/signup', async (req, res) => {
    try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }


    const newUser = new User({ username, password, isAdminApproved: false });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Customer login
app.post('/login', async (req, res) => {
    try {
    const { username, password } = req.body;


    const user = await User.findOne({ username, password });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isAdminApproved) {
        return res.status(401).json({ error: 'Account not yet approved by admin' });
    }

      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Customer bill payment
app.post('/payment', async (req, res) => {
    try {
      const { userId, type, serviceProvider, amount } = req.body;
  

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, 
        currency: 'usd',
      });
  
 
      const newTransaction = new Transaction({
        userId,
        type,
        serviceProvider,
        amount,
        status: paymentIntent.status,
      });
      await newTransaction.save();
  
      res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// View customer transactions

app.get('/transactions/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const transactions = await Transaction.find({ userId });
  
      res.status(200).json({ transactions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Admin approval of customer account

app.put('/approve/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      await User.findByIdAndUpdate(userId, { isAdminApproved: true });
  
      res.status(200).json({ message: 'User approved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Admin view pending approvals
app.get('/pending-approvals', async (req, res) => {
    try {
   
      const pendingApprovals = await User.find({ isAdminApproved: false });
  
      res.status(200).json({ pendingApprovals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Admin view all customers
app.get('/customers', async (req, res) => {
    try {
   
      const allCustomers = await User.find();
  
      res.status(200).json({ allCustomers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Admin create bill options
app.post('/create-bill-option', async (req, res) => {
    try {
      const { type, serviceProvider } = req.body;
  

  
      res.status(201).json({ message: 'Bill option created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Admin view all transactions
app.get('/admin-transactions', async (req, res) => {
    try {
    
      const allTransactions = await Transaction.find();
  
      res.status(200).json({ allTransactions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Admin view payment status from Stripe API
app.get('/payment-status/:transactionId', async (req, res) => {
    try {
      const transactionId = req.params.transactionId;

      res.status(200).json({ paymentStatus });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Start the server
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
