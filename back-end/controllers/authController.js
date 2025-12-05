const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ---- Fonction de hachage sécurisé ----
function hashData(data) {
  return crypto.createHash('sha256').update(data.toString()).digest('hex');
}

// ---- Email Transporter (Gmail) ----
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chouchenechadha01@gmail.com",
    pass: "hgjwzjoplsoifwzl",
  },
});

// ---- Fonction pour envoyer OTP ----
async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: '"NIRD Auth" <chouchenechadha01@gmail.com>',
    to: email,
    subject: "Votre code OTP",
    html: `
      <h1>Code OTP d'authentification</h1>
      <h2 style="color: #4A90E2;">${otp}</h2>
      <p>Ce code est valide pendant 5 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    `,
  });
}

// ---- Vérifier et gérer le blocage ----
async function checkAndHandleBlocking(user, res) {
  if (user.failedAttempts === undefined) user.failedAttempts = 0;
  if (!user.blockedUntil) user.blockedUntil = null;

  if (user.blockedUntil && new Date() < user.blockedUntil) {
    const remaining = Math.ceil((user.blockedUntil - new Date()) / 1000);
    return res.status(429).json({
      success: false,
      blocked: true,
      message: `Compte bloqué pour ${remaining} secondes`,
    });
  }
  return null;
}

// ---- Générer et sauvegarder OTP ----
async function generateAndSaveOTP(user) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
  user.failedAttempts = 0;
  user.blockedUntil = null;
  await user.save();
  return otp;
}


/// ================================
/// CRÉER COMPTE MUSICAL
/// ================================
exports.createMelody = async (req, res) => {
  try {
    const { email, melodyHash } = req.body;

    if (!email || !melodyHash)
      return res.status(400).json({ success: false, message: "Email et hash requis" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "Email déjà enregistré" });

    // Hasher la mélodie
    const hashedMelody = hashData(melodyHash);

    await User.create({
      email,
      profileType: 'musical',
      melodyHash: hashedMelody,
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Compte musical créé 🎵" });
  } catch (err) {
    console.error("Erreur createMelody:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// CRÉER COMPTE SCIENTIFIQUE
/// ================================
exports.createScientificAccount = async (req, res) => {
  try {
    console.log("🧬 Création compte scientifique:", req.body);
    
    const { email, scientificData } = req.body;

    if (!email || !scientificData)
      return res.status(400).json({ success: false, message: "Données incomplètes" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "Email déjà enregistré" });

    // Hasher toutes les données scientifiques
    const hashedData = {
      bloodTypeHash: hashData(scientificData.bloodType),
      birthDateHash: hashData(scientificData.birthDate),
      heightHash: hashData(scientificData.height),
      weightHash: hashData(scientificData.weight),
      chemicalFormulaHash: hashData(scientificData.chemicalFormula.toUpperCase())
    };

    await User.create({
      email,
      profileType: 'scientific',
      scientificData: hashedData,
      createdAt: new Date(),
    });

    console.log("✅ Compte scientifique créé pour:", email);

    res.status(200).json({ success: true, message: "Compte scientifique créé 🧬" });
  } catch (err) {
    console.error("❌ Erreur createScientificAccount:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// CRÉER COMPTE MATHÉMATIQUE
/// ================================
exports.createMathematicalAccount = async (req, res) => {
  try {
    console.log("📐 Création compte mathématique - Requête reçue");
    console.log("📦 Body:", req.body);
    
    const { email, mathematicalData } = req.body;

    // Validation des données
    if (!email || !mathematicalData) {
      console.log("❌ Données incomplètes");
      return res.status(400).json({ 
        success: false, 
        message: "Données incomplètes" 
      });
    }

    if (!mathematicalData.equation || !mathematicalData.sequence || !mathematicalData.result) {
      console.log("❌ Données mathématiques incomplètes");
      return res.status(400).json({ 
        success: false, 
        message: "Données mathématiques incomplètes" 
      });
    }

    // Vérifier si l'email existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("❌ Email déjà enregistré:", email);
      return res.status(409).json({ 
        success: false, 
        message: "Email déjà enregistré" 
      });
    }

    // Hasher les données mathématiques
    const hashedData = {
      equationHash: hashData(mathematicalData.equation),
      sequenceHash: hashData(mathematicalData.sequence.join(',')),
      resultHash: hashData(mathematicalData.result)
    };

    console.log("🔐 Données hashées:", {
      equationHash: hashedData.equationHash.substring(0, 20) + "...",
      sequenceHash: hashedData.sequenceHash.substring(0, 20) + "...",
      resultHash: hashedData.resultHash.substring(0, 20) + "..."
    });

    // Créer l'utilisateur
    const newUser = await User.create({
      email,
      profileType: 'mathematical',
      mathematicalData: hashedData,
      createdAt: new Date(),
    });

    console.log("✅ Compte mathématique créé pour:", email);
    console.log("✅ ID utilisateur:", newUser._id);

    res.status(200).json({ 
      success: true, 
      message: "Compte mathématique créé 🔢" 
    });

  } catch (err) {
    console.error("❌ Erreur createMathematicalAccount:", err);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur",
      error: err.message 
    });
  }
};


/// ================================
/// VÉRIFIER MÉLODIE + ENVOYER OTP
/// ================================
exports.verifyMelody = async (req, res) => {
  try {
    const { email, melodyHash } = req.body;

    if (!email || !melodyHash)
      return res.status(400).json({ valid: false, message: "Email et mélodie requis" });

    const user = await User.findOne({ email, profileType: 'musical' });
    if (!user)
      return res.status(404).json({ valid: false, message: "Utilisateur introuvable" });

    const blockResponse = await checkAndHandleBlocking(user, res);
    if (blockResponse) return blockResponse;

    // Vérifier la mélodie
    const hashedInput = hashData(melodyHash);
    if (user.melodyHash !== hashedInput) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }
      await user.save();
      
      return res.status(200).json({
        valid: false,
        message: "Mélodie incorrecte",
        attemptsRemaining: 5 - user.failedAttempts,
      });
    }

    // Mélodie correcte → Envoyer OTP
    const otp = await generateAndSaveOTP(user);
    await sendOTP(user.email, otp);
    console.log(`OTP envoyé à ${user.email}: ${otp}`);

    return res.status(200).json({
      valid: true,
      requiresOTP: true,
      message: "Mélodie correcte. OTP envoyé 📧",
    });
  } catch (err) {
    console.error("Erreur verifyMelody:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// VÉRIFIER DONNÉES SCIENTIFIQUES + ENVOYER OTP
/// ================================
exports.verifyScientificData = async (req, res) => {
  try {
    const { email, scientificData } = req.body;

    if (!email || !scientificData)
      return res.status(400).json({ valid: false, message: "Données incomplètes" });

    const user = await User.findOne({ email, profileType: 'scientific' });
    if (!user)
      return res.status(404).json({ valid: false, message: "Utilisateur introuvable" });

    const blockResponse = await checkAndHandleBlocking(user, res);
    if (blockResponse) return blockResponse;

    // Vérifier chaque donnée
    const inputHashes = {
      bloodTypeHash: hashData(scientificData.bloodType),
      birthDateHash: hashData(scientificData.birthDate),
      heightHash: hashData(scientificData.height),
      weightHash: hashData(scientificData.weight),
      chemicalFormulaHash: hashData(scientificData.chemicalFormula.toUpperCase())
    };

    const isValid = 
      user.scientificData.bloodTypeHash === inputHashes.bloodTypeHash &&
      user.scientificData.birthDateHash === inputHashes.birthDateHash &&
      user.scientificData.heightHash === inputHashes.heightHash &&
      user.scientificData.weightHash === inputHashes.weightHash &&
      user.scientificData.chemicalFormulaHash === inputHashes.chemicalFormulaHash;

    if (!isValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }
      await user.save();
      
      return res.status(200).json({
        valid: false,
        message: "Données incorrectes",
        attemptsRemaining: 5 - user.failedAttempts,
      });
    }

    // Données correctes → Envoyer OTP
    const otp = await generateAndSaveOTP(user);
    await sendOTP(user.email, otp);
    console.log(`OTP envoyé à ${user.email}: ${otp}`);

    return res.status(200).json({
      valid: true,
      requiresOTP: true,
      message: "Données correctes. OTP envoyé 📧",
    });
  } catch (err) {
    console.error("Erreur verifyScientificData:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// VÉRIFIER DONNÉES MATHÉMATIQUES + ENVOYER OTP
/// ================================
exports.verifyMathematicalData = async (req, res) => {
  try {
    console.log("🔍 Vérification données mathématiques pour:", req.body.email);
    
    const { email, mathematicalData } = req.body;

    if (!email || !mathematicalData)
      return res.status(400).json({ valid: false, message: "Données incomplètes" });

    const user = await User.findOne({ email, profileType: 'mathematical' });
    if (!user) {
      console.log("❌ Utilisateur mathématique introuvable:", email);
      return res.status(404).json({ valid: false, message: "Utilisateur introuvable" });
    }

    const blockResponse = await checkAndHandleBlocking(user, res);
    if (blockResponse) return blockResponse;

    // Vérifier les données mathématiques
    const inputHashes = {
      equationHash: hashData(mathematicalData.equation),
      sequenceHash: hashData(mathematicalData.sequence.join(',')),
      resultHash: hashData(mathematicalData.result)
    };

    console.log("🔐 Comparaison hash...");

    const isValid = 
      user.mathematicalData.equationHash === inputHashes.equationHash &&
      user.mathematicalData.sequenceHash === inputHashes.sequenceHash &&
      user.mathematicalData.resultHash === inputHashes.resultHash;

    if (!isValid) {
      console.log("❌ Données mathématiques incorrectes");
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }
      await user.save();
      
      return res.status(200).json({
        valid: false,
        message: "Données mathématiques incorrectes",
        attemptsRemaining: 5 - user.failedAttempts,
      });
    }

    console.log("✅ Données mathématiques correctes");

    // Données correctes → Envoyer OTP
    const otp = await generateAndSaveOTP(user);
    await sendOTP(user.email, otp);
    console.log(`📧 OTP envoyé à ${user.email}: ${otp}`);

    return res.status(200).json({
      valid: true,
      requiresOTP: true,
      message: "Données mathématiques correctes. OTP envoyé 📧",
    });
  } catch (err) {
    console.error("❌ Erreur verifyMathematicalData:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// VÉRIFIER OTP (commun à tous)
/// ================================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email et OTP requis" });

    const user = await User.findOne({ email });

    if (!user || !user.otp || !user.otpExpire)
      return res.status(400).json({ success: false, message: "OTP non demandé" });

    if (new Date() > user.otpExpire)
      return res.status(400).json({ success: false, message: "OTP expiré" });

    if (otp !== user.otp)
      return res.status(400).json({ success: false, message: "OTP incorrect" });

    // OTP correct → Connexion réussie
    user.otp = null;
    user.otpExpire = null;
    user.lastLogin = new Date();
    
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      timestamp: new Date(),
      success: true,
      profileType: user.profileType
    });
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Connexion réussie 🎉",
      profileType: user.profileType
    });

  } catch (err) {
    console.error("Erreur verifyOTP:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// RÉCUPÉRER TOUS LES UTILISATEURS
/// ================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "email profileType createdAt lastLogin"); 
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("Erreur récupération utilisateurs:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


/// ================================
/// OBTENIR TYPE DE PROFIL
/// ================================
exports.getProfileType = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log("🔍 Recherche profil pour:", email);
    
    const user = await User.findOne({ email }, "profileType");
    
    if (!user) {
      console.log("❌ Utilisateur introuvable:", email);
      return res.status(404).json({ 
        success: false, 
        message: "Utilisateur introuvable" 
      });
    }
    
    console.log("✅ Profil trouvé:", user.profileType);
    
    res.status(200).json({
      success: true,
      profileType: user.profileType
    });
  } catch (err) {
    console.error("Erreur getProfileType:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};