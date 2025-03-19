const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryType: { type: String, required: true},
    categoryFallsOn: { type: String, required: true },
    categoryDescription: { type: String, required: true },
    subCategories: [{ type: String, required: true }],
    categoryImage: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('Category', categorySchema);