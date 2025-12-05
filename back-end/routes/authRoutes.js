const express = require("express");
const {
  // Création de comptes
  createMelody,
  createScientificAccount,
  createMathematicalAccount,
  
  // Vérification des authentifications
  verifyMelody,
  verifyScientificData,
  verifyMathematicalData,
  
  // OTP commun
  verifyOTP,
  
  // Utilitaires
  getAllUsers,
  getProfileType,
} = require("../controllers/authController");

const router = express.Router();

// ===== CRÉATION DE COMPTES =====
router.post("/create-melody", createMelody);
router.post("/create-scientific", createScientificAccount);
router.post("/create-mathematical", createMathematicalAccount);

// ===== VÉRIFICATION DES AUTHENTIFICATIONS =====
router.post("/verify-melody", verifyMelody);
router.post("/verify-scientific", verifyScientificData);
router.post("/verify-mathematical", verifyMathematicalData);

// ===== OTP COMMUN =====
router.post("/verify-otp", verifyOTP);

// ===== UTILITAIRES =====
router.get("/users", getAllUsers);
router.get("/profile-type/:email", getProfileType);

module.exports = router;