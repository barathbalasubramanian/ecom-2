const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (req, res) => {
    const { orderData, timestamp } = req.body;

    if (!orderData || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const Product = require('../models/Product');
        
        // Calculate prices
        const itemsPrice = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const taxPrice = itemsPrice * 0.18; // 18% tax
        const shippingPrice = orderData.customerInfo.shippingMethod === 'express' ? 200 : 100;
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // Format shipping address according to schema requirements
        const shippingAddress = {
            firstName: orderData.customerInfo.firstName,
            lastName: orderData.customerInfo.lastName,
            email: orderData.customerInfo.email,
            phoneNumber: orderData.customerInfo.phone,
            addressLine1: orderData.customerInfo.address1,
            addressLine2: orderData.customerInfo.address2,
            city: orderData.customerInfo.city,
            state: 'Tamil Nadu', // Default state
            pincode: orderData.customerInfo.postal,
            country: 'India'
        };

        for (const item of orderData.items) {
            // Skip stock check for custom products
            if (!item.id.startsWith('custom-')) {
                const product = await Product.findById(item.id);
                if (!product) {
                    return res.status(404).json({ 
                        message: `Product not found: ${item.id}` 
                    });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for product: ${product.productName}. Available: ${product.stock}, Requested: ${item.quantity}` 
                    });
                }
            }
        }

        const createdOrderItems = [];
        for (const item of orderData.items) {
            if (!item.id.startsWith('custom-')) {
                // Handle regular products
                const product = await Product.findById(item.id);
                product.stock -= item.quantity;
                await product.save();

                const orderItem = await OrderItem.create({
                    product: item.id,
                    name: item.name,
                    qty: item.quantity,
                    price: item.price,
                    image: item.image,
                    selectedSize: item.selectedSize,
                    measurements: item.measurements,
                    customSize: item.customSize,
                });
                createdOrderItems.push(orderItem);
            } else {
                // Handle custom products
                const orderItem = await OrderItem.create({
                    product: item.id,
                    name: item.name,
                    qty: item.quantity,
                    price: item.price,
                    image: item.images.front, // Using front image as main image
                    isCustom: true,
                    customizationDetails: {
                        color: item.color,
                        designs: item.designs,
                        images: item.images
                    }
                });
                createdOrderItems.push(orderItem);
            }
        }

        const order = new Order({
            orderItems: createdOrderItems.map(item => item._id),
            shippingAddress,
            paymentMethod: 'COD', // Default payment method
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            customerInfo: {
                firstName: orderData.customerInfo.firstName,
                lastName: orderData.customerInfo.lastName,
                email: orderData.customerInfo.email,
                phone: orderData.customerInfo.phone
            },
            createdAt: timestamp
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.restoreStock = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('orderItems');
        const Product = require('../models/Product');

        for (const orderItem of order.orderItems) {
            const product = await Product.findById(orderItem.product);
            if (product) {
                product.stock += orderItem.qty;
                await product.save();
            }
        }
    } catch (error) {
        console.error('Error restoring stock:', error);
        throw error;
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('orderItems');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refundOrderItem = async (req, res) => {
    const { refundAmount } = req.body;

    try {
        const orderItem = await OrderItem.findById(req.params.itemId);
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        orderItem.refunded = true;
        orderItem.refundAmount = refundAmount;
        const updatedOrderItem = await orderItem.save();

        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShippingStatus = async (req, res) => {
    const { shippingStatus } = req.body;

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.shippingStatus = shippingStatus;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
