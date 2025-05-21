// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    username: {type: String, required: true},
    transactionType: {type: String, enum: ['Stake', 'Borrow', 'Lend'], required: true},
    token: {type: String, required: true},
    amount: {type: Number, required: true},
    date: {type: Date, default: Date.now},
    status: { type: String ,default: 'finished'},
    description: { type: String },
});

module.exports = mongoose.model('Transaction', transactionSchema);