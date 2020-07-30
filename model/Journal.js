const mongoose = require('mongoose');
const slugify = require('slugify');

const journalSchema = mongoose.Schema({
  title: {
    type: String,
    maxLength: [300, 'Title cannot be more than 300 characters'],
    trim: true,
    required: [true, 'Please enter title'],
  },
  body: {
    type: String,
    minLength: [300, 'Body must be minimun 300 characters'],
    required: [true, 'Please enter body'],
  },
  note: {
    type: String,
    default: '',
  },
  slug: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

journalSchema.pre('save', function (next) {
  this.createdAt = Date.now();
  this.updatedAt = Date.now();
  this.slug = slugify(this.title, { lower: true });
  next();
});

module.exports = mongoose.model('Journal', journalSchema);
