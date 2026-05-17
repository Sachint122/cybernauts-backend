const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hobby' }],
    popularityScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.statics.updatePopularityScore = async function (userId) {
  const Friendship = mongoose.model('Friendship');
  const User = mongoose.model('User');

  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }]
  });

  const friendIds = friendships.map(f => 
    f.requester.toString() === userId.toString() ? f.recipient : f.requester
  );

  const [friends, user] = await Promise.all([
    User.find({ _id: { $in: friendIds } }).populate('hobbies'),
    User.findById(userId).populate('hobbies')
  ]);

  if (!user) return 0;

  const userHobbyIds = user.hobbies.map(h => h._id.toString());
  let sharedHobbyCount = 0;
  
  friends.forEach(friend => {
    const friendHobbyIds = friend.hobbies.map(h => h._id.toString());
    sharedHobbyCount += friendHobbyIds.filter(id => userHobbyIds.includes(id)).length;
  });

  const score = friendIds.length + (sharedHobbyCount * 0.5);
  await User.findByIdAndUpdate(userId, { popularityScore: score });
  return score;
};

module.exports = mongoose.model('User', UserSchema);
