const mongoose = require('mongoose');

const HobbySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

HobbySchema.pre('save', function (next) {
  if (this.isModified('name')) this.name = this.name.toLowerCase();
  next();
});

module.exports = mongoose.model('Hobby', HobbySchema);
