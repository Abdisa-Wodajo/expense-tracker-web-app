const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        fullName: {type: String, required: true},
        email:{type:String, required: true, unique: true},
        password: { type: String, required: true},
        profileImageUrl:{type: String, default: null},
    },
    {timestamps: true}
);

//Hash password before saving
UserSchema.pre("save", async function () {
  // Only hash if the password was modified
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// Compare Passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  
};

module.exports = mongoose.model('User', UserSchema);