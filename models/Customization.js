const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
    selectSize: {
        shoulder: [{ type: String }],
        chest: [{ type: String }],
        bust: [{ type: String }],
        underBust: [{ type: String }],
        waist: [{ type: String }],
        hip: [{ type: String }],
        underArm: [{ type: String }]
    },
    customizationType: [{
        typeName: { type: String, required: true },
        standardImage: { type: String},
        productImage: { type: String },
        options: [{ type: String, default: [] }],
    }],
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Customization', customizationSchema);
