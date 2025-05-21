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