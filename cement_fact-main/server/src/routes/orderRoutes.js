const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };
  const orders = await Order.find(query)
    .populate('items.product', 'name category')
    .populate('user', 'name email contactNo place address state')
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.post(
  '/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty().withMessage('Product id is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, notes } = req.body;
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'One or more products not found' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const price = product.price;
      orderItems.push({ product: product._id, quantity: item.quantity, priceAtPurchase: price });
      total += price * item.quantity;
    }

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      notes: notes || ''
    });

    const populated = await order.populate('items.product', 'name category');
    res.status(201).json(populated);
  }
);

router.patch('/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'processing', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('items.product', 'name category')
    .populate('user', 'name email contactNo place address state');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
});

module.exports = router;
