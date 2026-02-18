const argon2 = require('argon2');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    unique: [true, 'Name must be unique'],
  },

  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: [true, 'Email must be unique'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false, // so that password will not be shown in any output from db
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (e) {
        return e === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  updatePasswordAt: Date,
  resetToken: String,
  resetTokenExpiryDate: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

/* SANITIZATION */
/* 
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
*/

/* MIDDLEWARES */

// query middleware

userSchema.pre(/^find/, function () {
   this.find({ active: { $ne: false } });
   // dont find the users which are not active aka allow null and true
});

//db middlewares
userSchema.pre('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with 2id with best of 2 world
  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
  });
  // Delete passwordConfirm field
  this.confirmPassword = undefined;
});

//Update the updatePasswordAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return;
  this.updatePasswordAt = Date.now() - 1000;
});

/* INSTANCES */

// Instance method to check password validity
userSchema.methods.matchPassword = async function (
  candidatePassword,
  userPassword
) {
  return await argon2.verify(userPassword, candidatePassword);
};

// Instance method to check validity of token: false
userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.updatePasswordAt) {
    const changePasswordTime = parseInt(
      this.updatePasswordAt.getTime() / 1000,
      10
    );
    return changePasswordTime > jwtTimeStamp;
  }
  return false;
  // if the passwird is updated after token generation than its FALSE
};

//Instance method to generate reset token
userSchema.methods.generateResetToken = function () {
  //1) generate the reset token
  const token = crypto.randomBytes(32).toString('hex');
  //2) Encrypt the reset token for the DB
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpiryDate = Date.now() + 10 * 60 * 1000;
  //3) send the reset token
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
