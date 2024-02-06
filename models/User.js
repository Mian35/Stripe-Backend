const mongoose = require('mongoose');
const validator = require('validator')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'please provide a firstname']
  },
  lastname: {
    type: String,
    required: [true, 'please provide a lastname']
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },


  address: {
    type: String,
    required: [true, 'please provide your address'],
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  tokens:{
    type: Number,
    default: 0
   },
   plan: {
       type: String,
       enum: ['Standard', 'Premium','none'],
       default: 'none'
     },

  ProfileImage: {
    type: String,
    required: [true, 'please provide your profile image'],
    default: 'profile Image'
  }



},
  { timestamps: true }

)

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model('user', userSchema)