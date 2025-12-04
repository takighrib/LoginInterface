const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage en mémoire (remplacer par MongoDB/PostgreSQL en production)
const users = new Map();

// Classe utilisateur améliorée
class User {
  constructor(email, melodyHash, createdAt) {
    this.email = email.toLowerCase();
    this.melodyHash = melodyHash;
    this.failedAttempts = 0;
    this.lastAttempt = null;
    this.blockedUntil = null;
    this.loginHistory = [];
    this.createdAt = createdAt || new Date();
  }

  addLoginAttempt(success, ip = 'unknown') {
    this.loginHistory.push({
      timestamp: new Date(),
      success: success,
      ip: ip
    });
    
    // Garder seulement les 50 dernières tentatives
    if (this.loginHistory.length > 50) {
      this.loginHistory = this.loginHistory.slice(-50);
    }
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalUsers: users.size,
    version: '2.0.0 - Multi-utilisateurs'
  });
});

/**
 * Créer une nouvelle mélodie pour un utilisateur
 * POST /api/auth/create-melody
 * Body: { email, melodyHash, timestamp }
 */
app.post('/api/auth/create-melody', (req, res) => {
  try {
    const { email, melodyHash, timestamp } = req.body;
    
    if (!email || !melodyHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et hash de mélodie requis' 
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Vérifier si l'utilisateur existe déjà
    if (users.has(normalizedEmail)) {
      console.log(`⚠️  Tentative de création d'un compte existant: ${normalizedEmail}`);
      return res.status(409).json({ 
        success: false, 
        message: 'Cet email a déjà une mélodie enregistrée' 
      });
    }
    
    // Créer l'utilisateur
    const user = new User(normalizedEmail, melodyHash, new Date(timestamp));
    users.set(normalizedEmail, user);
    
    console.log(`✓ Nouveau compte créé: ${normalizedEmail}`);
    console.log(`📊 Total utilisateurs: ${users.size}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Mélodie créée avec succès',
      email: normalizedEmail 
    });
  } catch (error) {
    console.error('❌ Erreur création mélodie:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

/**
 * Vérifier une mélodie pour un utilisateur
 * POST /api/auth/verify-melody
 * Body: { email, melodyHash }
 */
app.post('/api/auth/verify-melody', (req, res) => {
  try {
    const { email, melodyHash } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (!email || !melodyHash) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Email et hash de mélodie requis' 
      });
    }

    const normalizedEmail = email.toLowerCase();
    const user = users.get(normalizedEmail);
    
    if (!user) {
      console.log(`✗ Utilisateur ${normalizedEmail} non trouvé`);
      return res.status(404).json({ 
        valid: false, 
        message: 'Aucune mélodie enregistrée pour cet email' 
      });
    }

    // Vérifier si l'utilisateur est bloqué
    if (user.blockedUntil && new Date() < user.blockedUntil) {
      const remainingTime = Math.ceil((user.blockedUntil - new Date()) / 1000);
      console.log(`🔒 ${normalizedEmail} bloqué pour ${remainingTime}s`);
      
      return res.status(429).json({ 
        valid: false, 
        message: `Compte bloqué. Réessayez dans ${Math.ceil(remainingTime / 60)} minutes.`,
        remainingTime: remainingTime,
        blocked: true
      });
    }

    // Réinitialiser le blocage si le temps est écoulé
    if (user.blockedUntil && new Date() >= user.blockedUntil) {
      user.failedAttempts = 0;
      user.blockedUntil = null;
      console.log(`🔓 Déblocage de ${normalizedEmail}`);
    }

    // Vérifier le hash
    const isValid = user.melodyHash === melodyHash;
    
    if (isValid) {
      user.failedAttempts = 0;
      user.blockedUntil = null;
      user.addLoginAttempt(true, clientIp);
      
      console.log(`✓ Authentification réussie: ${normalizedEmail}`);
      
      res.status(200).json({ 
        valid: true, 
        message: 'Authentification réussie' 
      });
    } else {
      user.failedAttempts++;
      user.lastAttempt = new Date();
      user.addLoginAttempt(false, clientIp);
      
      // Bloquer après 5 tentatives échouées
      if (user.failedAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        console.log(`🔒 ${normalizedEmail} bloqué pour 5 minutes`);
      }
      
      console.log(`✗ Tentative échouée: ${normalizedEmail} (${user.failedAttempts}/5)`);
      
      res.status(200).json({ 
        valid: false, 
        message: 'Mélodie incorrecte',
        attemptsRemaining: Math.max(0, 5 - user.failedAttempts)
      });
    }
  } catch (error) {
    console.error('❌ Erreur vérification mélodie:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Erreur serveur' 
    });
  }
});

/**
 * Obtenir les statistiques globales
 * GET /api/auth/stats
 */
app.get('/api/auth/stats', (req, res) => {
  const stats = {
    totalUsers: users.size,
    blockedUsers: 0,
    users: []
  };
  
  for (const user of users.values()) {
    const isBlocked = user.blockedUntil && new Date() < user.blockedUntil;
    if (isBlocked) stats.blockedUsers++;
    
    stats.users.push({
      email: user.email,
      failedAttempts: user.failedAttempts,
      blocked: isBlocked,
      lastLogin: user.loginHistory.length > 0 
        ? user.loginHistory[user.loginHistory.length - 1].timestamp 
        : null,
      createdAt: user.createdAt
    });
  }
  
  res.status(200).json(stats);
});

/**
 * Obtenir les informations d'un utilisateur spécifique
 * GET /api/auth/user/:email
 */
app.get('/api/auth/user/:email', (req, res) => {
  const { email } = req.params;
  const normalizedEmail = email.toLowerCase();
  const user = users.get(normalizedEmail);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'Utilisateur non trouvé' 
    });
  }
  
  res.status(200).json({
    email: user.email,
    failedAttempts: user.failedAttempts,
    blocked: user.blockedUntil && new Date() < user.blockedUntil,
    blockedUntil: user.blockedUntil,
    loginHistory: user.loginHistory.slice(-10), // 10 dernières tentatives
    createdAt: user.createdAt
  });
});

/**
 * Supprimer un utilisateur spécifique
 * DELETE /api/auth/user/:email
 */
app.delete('/api/auth/user/:email', (req, res) => {
  const { email } = req.params;
  const normalizedEmail = email.toLowerCase();
  
  if (users.has(normalizedEmail)) {
    users.delete(normalizedEmail);
    console.log(`🗑️  Utilisateur supprimé: ${normalizedEmail}`);
    res.status(200).json({ 
      success: true, 
      message: 'Utilisateur supprimé' 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Utilisateur non trouvé' 
    });
  }
});

/**
 * Réinitialiser tous les utilisateurs
 * DELETE /api/auth/reset-all
 */
app.delete('/api/auth/reset-all', (req, res) => {
  const count = users.size;
  users.clear();
  console.log(`🗑️  ${count} utilisateurs supprimés`);
  res.status(200).json({ 
    success: true, 
    message: `${count} utilisateurs supprimés` 
  });
});

/**
 * Débloquer un utilisateur
 * POST /api/auth/unblock/:email
 */
app.post('/api/auth/unblock/:email', (req, res) => {
  const { email } = req.params;
  const normalizedEmail = email.toLowerCase();
  const user = users.get(normalizedEmail);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'Utilisateur non trouvé' 
    });
  }
  
  user.failedAttempts = 0;
  user.blockedUntil = null;
  console.log(`🔓 ${normalizedEmail} débloqué manuellement`);
  
  res.status(200).json({ 
    success: true, 
    message: 'Utilisateur débloqué' 
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur interne' 
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('🎵 ========================================');
  console.log(`🎵 Music Auth Server v2.0 (Multi-users)`);
  console.log(`🎵 Port: ${PORT}`);
  console.log(`🎵 API: http://localhost:${PORT}/api`);
  console.log(`🎵 Health: http://localhost:${PORT}/api/health`);
  console.log(`🎵 Stats: http://localhost:${PORT}/api/auth/stats`);
  console.log('🎵 ========================================');
  console.log('📝 Chaque utilisateur a un hash unique:');
  console.log('   email:melody → SHA-256');
  console.log('   Exemple: user@mail.com:C-D-E-F-G-A');
  console.log('🎵 ========================================');
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});