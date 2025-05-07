const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    refunded: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false },
    measurements: { type: mongoose.Schema.Types.Mixed, default: {} },
    selectedSize: { type: String },
    customSize: { type: mongoose.Schema.Types.Mixed, default: {} },
    customizationDetails: {
        color: String,
        designs: {
            front: {
                leftChest: {
                    type: { type: String },
                    content: String,
                    style: mongoose.Schema.Types.Mixed,
                    position: {
                        x: Number,
                        y: Number
                    },
                    size: {
                        width: Number,
                        height: Number
                    }
                },
                center: {
                    type: { type: String },
                    content: String,
                    style: mongoose.Schema.Types.Mixed,
                    position: {
                        x: Number,
                        y: Number
                    }
                }
            },
            back: {
                center: {
                    type: { type: String },
                    content: String,
                    style: mongoose.Schema.Types.Mixed,
                    position: {
                        x: Number,
                        y: Number
                    },
                    size: {
                        width: Number,
                        height: Number
                    }
                }
            },
            rightSleeve: {
                text: {
                    type: { type: String },
                    content: String,
                    style: mongoose.Schema.Types.Mixed,
                    position: {
                        x: Number,
                        y: Number
                    }
                }
            },
            leftSleeve: {
                text: {
                    type: { type: String },
                    content: String,
                    style: mongoose.Schema.Types.Mixed,
                    position: {
                        x: Number,
                        y: Number
                    }
                }
            }
        },
        images: {
            front: String,
            back: String,
            rightSleeve: String,
            leftSleeve: String
        }
    }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
