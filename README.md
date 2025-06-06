# Cryptocurrency Transaction Management System (English Version)

## Project Fin Overview


| TASK       | DESC                             | STATUS |
| ---------- | -------------------------------- | ------ |
| Backend    | Full Transaction Management API  | ✅     |
| Frontend   | Build a Simple Activity Table UI | ✅     |
| Designer   |                                  |        |
| Blockchain |                                  |        |
| Web3       |                                  |        |

### All code list

![image-20250522022720159](./assets/image-20250522022720159.png )

## Table of Contents

- [Features](#features)
- [Implementation Details](#implementation-details)
- [Frontend](#frontend)
- [Backend](#backend)
- [Core Code Implementation](#core-code-implementation)
- [Installation and Deployment Guide](#installation-and-deployment-guide)
- [Notes](#notes)

## Features

### 1. Transaction Management

- **View Transactions**: Sortable, paginated transaction table
- **Add Transactions**: Modal form with validation for adding new transactions
- **Delete Transactions**: Confirmation modal for transaction deletion
- **Transaction Details**: Comprehensive display of transaction information

### 2. Advanced Filtering and Sorting

- **Search Functionality**: Filter transactions by username or token
- **Type Filtering**: Filter by transaction type (Stake, Borrow, Lend)
- **Date Range Filtering**: Filter transactions by date range
- **Sorting**: Sort transactions by amount, date, and other fields

### 3. Status Tracking

- **Status Indicators**: Color-coded status badges (Successful, Waiting, Canceled)
- **Visual Differentiation**: Clear visual distinction between different transaction states

### 4. Enhanced User Interface

- **Responsive Design**: Fully responsive layout for all screen sizes
- **Tooltips**: Hover functionality for viewing full transaction descriptions
- **Loading States**: Visual feedback during data loading and operations
- **Error Handling**: Graceful error handling with user-friendly messages

## Implementation Details

### Frontend

1. **API Integration**
2. Implemented Axios for backend API interaction
3. Handled response data and displayed it in the user interface
4. Implemented loading indicators and error handling mechanisms
5. Added mock data as a fallback option when API fails
6. **Page Layout Design**
7. Designed transaction record list page with pagination support
8. Provided search box and filtering conditions (by type, status, date range)
9. Added buttons to trigger creation of new transaction records or deletion of existing ones
10. Implemented responsive design for optimal experience on all devices
11. **Form Validation**
12. Used form validation to ensure all required fields are filled and formatted correctly
13. Displayed user-friendly error messages
14. Added real-time validation feedback
15. **UI Enhancements**
16. Implemented status labels with color coding (successful=green, waiting=yellow, canceled=red)
17. Added tooltips for description fields to view full text
18. Optimized filter section layout and styling
19. Improved table design with new columns

### Backend

1. **Model Definition**

2. Defined `Transaction` model with `id`, `username`, `transactionType`, `token`, `amount`, `date`, `status`, and `description` fields

3. Added validation rules to ensure data integrity

4. **API Route Implementation**

5. Implemented CRUD operations for transaction records

6. Added filtering functionality based on `transactionType`, `startDate`, `endDate`, `status`, and `description`

7. Supported pagination, sorting, and searching

8. Added error handling middleware

9. Configured CORS middleware to allow cross-origin requests

10. Added request logging

    

## Core Code Implementation

### Transaction Interface Definition

```typescript
export interface Transaction {
  id: string
  username: string
  transactionType: TransactionType
  token: string
  amount: string
  date: string
  status?: "canceled" | "successful" | "waiting"
  description?: string
}

export type TransactionType = "Stake" | "Borrow" | "Lend"
```

### Restful Api （CRUD）

```typescript
const express = require('express');
const router = express.Router();
const { body, query , check, validationResult} = require('express-validator');
const Transaction = require('../models/Transaction'); // 引入模型

// @route    GET /api/transactions
// @desc     获取所有交易记录（支持分页、搜索、排序）
// @access   Public
router.get(
    '/',
    [
        // 查询参数验证
        check('page').optional().isInt({ min: 1 }).withMessage('页码必须是大于等于1的整数'),
        check('limit').optional().isInt({ gt: 0 }).withMessage('每页数量必须大于0'),
        check('search').optional().isString().withMessage('搜索关键词必须是字符串'),
        check('sortField')
            .optional()
            .isIn(['username', 'transactionType', 'token', 'amount', 'date'])
            .withMessage('排序字段不合法'),
        check('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序顺序必须为 asc 或 desc'),
        check('transactionType').optional().isIn(['Stake', 'Borrow', 'Lend']).withMessage('交易类型必须为 Stake/Borrow/Lend'),
        check('startDate').optional().isISO8601().toDate(),
        check('endDate').optional().isISO8601().toDate()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const sortField = req.query.sortField || 'date';
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

            const filter = {};

            // 添加 transactionType 条件
            if (req.query.transactionType) {
                filter.transactionType = req.query.transactionType;
            }

            // 添加搜索关键字匹配
            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { transactionType: { $regex: search, $options: 'i' } },
                    { token: { $regex: search, $options: 'i' } }
                ];
            }

            // 添加日期范围过滤
            filter.date = {};
            if (req.query.startDate) {
                filter.date.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                const endDate = new Date(req.query.endDate);
                endDate.setHours(23, 59, 59, 999); // 包含当天所有时间
                filter.date.$lte = endDate;
            }

            // 如果没有设置任何 date 条件，则删除 date 空对象
            if (!req.query.startDate && !req.query.endDate) {
                delete filter.date;
            }

            // 查询数据
            const transactions = await Transaction.find(filter)
                .sort({ [sortField]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Transaction.countDocuments(filter);

            res.json({
                data: transactions,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route    GET /api/transactions/:id
// @desc     根据 ID 获取单个交易记录
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ msg: '未找到该交易记录' });
        }

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST /api/transactions
// @desc     创建新的交易记录
// @access   Public
router.post(
    '/',
    [
        check('username', '用户名为必填项').notEmpty(),
        check('transactionType', '交易类型必须为 Stake/Borrow/Lend').isIn(['Stake', 'Borrow', 'Lend']),
        check('token', '代币名称为必填项').notEmpty(),
        check('amount', '金额必须为数字').isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newTransaction = new Transaction(req.body);
            const saved = await newTransaction.save();
            res.status(201).json(saved);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    PUT /api/transactions/:id
// @desc     更新某条交易记录
// @access   Public
router.put(
    '/:id',
    [
        check('username').optional().notEmpty().withMessage('用户名不能为空'),
        check('transactionType').optional().isIn(['Stake', 'Borrow', 'Lend']),
        check('token').optional().notEmpty().withMessage('代币名称不能为空'),
        check('amount').optional().isNumeric().withMessage('金额必须为数字'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updated = await Transaction.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ msg: '未找到该交易记录' });
            }

            res.json(updated);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    DELETE /api/transactions/:id
// @desc     删除某条交易记录
// @access   Public
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ msg: '未找到该交易记录' });
        }

        res.json({ msg: '交易记录已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
```



## Installation and Deployment Guide

### Prerequisites

Ensure you have the following software installed:

- Node.js v14+
- MongoDB

###  Installation

1. Clone the repository:

```shellscript
git clone [repository-url]
```

2. Install dependencies:

```shellscript
npm install
```

3. Configure API endpoint:

```shellscript
# Set API base URL in .env file
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

4. Start the development server:

```shellscript
npm run dev
```

5. The application runs by default at `http://localhost:3000`

## Notes

- Ensure the backend service is running for the frontend to correctly call the API
- If you need to modify the default port numbers, adjust the API request address in the frontend code accordingly
- The system uses mock data by default, which can be switched to actual API by uncommenting the API call code
- All form fields have validation to ensure correct data format input

---