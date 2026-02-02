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
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Passwords - HANDLES BOTH HASHED AND PLAIN PASSWORDS
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // Check if stored password is already hashed (starts with $2b$10$)
    if (this.password && this.password.startsWith('$2b$10$')) {
        return await bcrypt.compare(candidatePassword, this.password);
    } else {
        // Password is plain text - compare directly
        return candidatePassword === this.password;
    }
};

module.exports = mongoose.model('User', UserSchema);