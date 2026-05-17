const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

FriendshipSchema.pre('save', function (next) {
  if (this.requester.toString() === this.recipient.toString()) {
    return next(new Error('Cannot link with self'));
  }
  // Sort IDs to ensure (A,B) is same as (B,A)
  if (this.requester.toString() > this.recipient.toString()) {
    const temp = this.requester;
    this.requester = this.recipient;
    this.recipient = temp;
  }
  next();
});

module.exports = mongoose.model('Friendship', FriendshipSchema);
