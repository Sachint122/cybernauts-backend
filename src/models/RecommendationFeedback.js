const mongoose = require('mongoose');

const RecommendationFeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['USER', 'HOBBY'], required: true },
    action: { type: String, enum: ['ACCEPT', 'REJECT', 'DISMISS'], required: true },
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

RecommendationFeedbackSchema.index({ userId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('RecommendationFeedback', RecommendationFeedbackSchema);
