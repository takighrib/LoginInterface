const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Email
  email: { type: String, required: true, unique: true, lowercase: true },

  // Type de profil utilisateur
  profileType: { 
    type: String, 
    required: true,
    enum: ['musical', 'scientific', 'mathematical', 'visual']
  },

  // Authentification MUSICALE
  melodyHash: { 
    type: String,
    required: function() { return this.profileType === 'musical'; }
  },

  // Authentification SCIENTIFIQUE
  scientificData: {
    bloodTypeHash: { type: String, required: function() { return this.profileType === 'scientific'; } },
    birthDateHash: { type: String, required: function() { return this.profileType === 'scientific'; } },
    heightHash: { type: String, required: function() { return this.profileType === 'scientific'; } },
    weightHash: { type: String, required: function() { return this.profileType === 'scientific'; } },
    chemicalFormulaHash: { type: String, required: function() { return this.profileType === 'scientific'; } }
  },

  // Authentification MATHÉMATIQUE
  mathematicalData: {
    equationHash: { type: String, required: function() { return this.profileType === 'mathematical'; } },
    sequenceHash: { type: String, required: function() { return this.profileType === 'mathematical'; } },
    resultHash: { type: String, required: function() { return this.profileType === 'mathematical'; } }
  },

  // Authentification VISUELLE (pour futur)
  visualData: {
    colorPatternHash: { type: String },
    shapeSequenceHash: { type: String }
  },

  // Sécurité commune
  failedAttempts: { type: Number, default: 0 },
  blockedUntil: { type: Date, default: null },

  // OTP pour 2FA
  otp: { type: String, default: null },
  otpExpire: { type: Date, default: null },

  // Historique de connexion
  loginHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      success: Boolean,
      ip: String,
      profileType: String
    }
  ],

  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ profileType: 1 });

module.exports = mongoose.model("User", userSchema);
