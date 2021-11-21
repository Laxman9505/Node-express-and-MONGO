const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;
const crypto = require('crypto');

const userSchema = new Schema({
  name: {
    type: String,
    required: ['true', 'Name field is required'],
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
      isAsync: false,
    },
    unique: true,
    lowercase: true,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please enter the password'],
    minLength: [8, 'password should contained characters more than 8'],
    maxLength: [20, 'password should contain characters less than 20'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password!'],
    validate: {
      //This only works on create or save
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  changedPasswordAt: Date,
  resetPasswordToken: String,
  resetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  //only runs if the password was actually  modified
  if (!this.isModified('password')) return next();

  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete the confirm password field
  this.confirmPassword = undefined;
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

//query middleware
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//creating the method in the document. The method is available in every document created out of userSchema.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//this method checks if the user changed his password after the token was issued.
userSchema.methods.changedPasswordAfter = async function (jwtTimeStamp) {
  if (this.changedPassword) {
    const changedPassword = parseInt(this.changedPassword.getTime() / 1000, 10);
    return changedPassword > jwtTimeStamp;
  }

  //returns falls as a default
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, this.resetPasswordToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
