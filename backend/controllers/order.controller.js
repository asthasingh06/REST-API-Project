const Order = require('../models/Order.model');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderNumber
 *         - customerName
 *         - customerEmail
 *         - items
 *         - totalAmount
 *       properties:
 *         orderNumber:
 *           type: string
 *         customerName:
 *           type: string
 *         customerEmail:
 *           type: string
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded]
 *         shippingAddress:
 *           type: object
 *         assignedTo:
 *           type: string
 *           description: User ID - Admin only field
 *         adminNotes:
 *           type: string
 *           description: Internal notes - Admin only field
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         tags:
 *           type: array
 *         estimatedDeliveryDate:
 *           type: string
 *           format: date-time
 */

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders (user's own orders, admin sees all)
 * @access  Private
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, refunded]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    // Build query - users see only their orders, admins see all
    const query = {};
    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get single order
 * @access  Private
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get a single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (req.user.role !== 'admin' && order.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 */
exports.createOrder = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const order = await Order.create(req.body);

    await order.populate('createdBy', 'name email');
    await order.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Order number already exists',
      });
    }
    next(error);
  }
};

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order
 * @access  Private
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (req.user.role !== 'admin' && order.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    // Admin-only fields are already filtered by middleware if user is not admin
    // Update order
    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Order number already exists',
      });
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Delete order
 * @access  Private
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (req.user.role !== 'admin' && order.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this order',
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


