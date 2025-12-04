import CryptoJS from 'crypto-js'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'
const CURRENT_USER_KEY = 'current_user_email'

/**
 * Hash une mélodie avec l'identifiant utilisateur (salt personnalisé)
 * Cela garantit que deux utilisateurs avec la même mélodie ont des hashes différents
 */
export const hashMelody = (notes, userEmail) => {
  // Combiner l'email et la mélodie pour créer un hash unique
  const melodyString = `${userEmail.toLowerCase()}:${notes.join('-')}`
  return CryptoJS.SHA256(melodyString).toString()
}

/**
 * Vérifie si un email est valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Crée une nouvelle mélodie pour un utilisateur
 */
export const createMelody = async (notes, userEmail) => {
  try {
    if (!userEmail || !isValidEmail(userEmail)) {
      throw new Error('Email invalide')
    }

    const hashedMelody = hashMelody(notes, userEmail)
    const userKey = `melody_${userEmail.toLowerCase()}`
    
    // Stockage local avec clé unique par utilisateur
    localStorage.setItem(userKey, hashedMelody)
    localStorage.setItem(CURRENT_USER_KEY, userEmail.toLowerCase())
    
    // Envoi au backend
    try {
      await axios.post(`${API_URL}/create-melody`, {
        email: userEmail.toLowerCase(),
        melodyHash: hashedMelody,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.log('Backend non disponible, stockage local uniquement')
    }
    
    return true
  } catch (error) {
    console.error('Erreur lors de la création de la mélodie:', error)
    return false
  }
}

/**
 * Vérifie une mélodie pour un utilisateur donné
 */
export const verifyMelody = async (notes, userEmail) => {
  try {
    if (!userEmail || !isValidEmail(userEmail)) {
      return false
    }

    const enteredHash = hashMelody(notes, userEmail)
    const userKey = `melody_${userEmail.toLowerCase()}`
    const storedHash = localStorage.getItem(userKey)
    
    if (!storedHash) {
      console.log('Aucune mélodie enregistrée pour cet utilisateur')
      return false
    }
    
    const isValid = storedHash === enteredHash
    
    if (isValid) {
      localStorage.setItem(CURRENT_USER_KEY, userEmail.toLowerCase())
      resetFailedAttempts(userEmail)
    } else {
      incrementFailedAttempts(userEmail)
    }
    
    // Vérification avec le backend
    try {
      const response = await axios.post(`${API_URL}/verify-melody`, {
        email: userEmail.toLowerCase(),
        melodyHash: enteredHash,
      })
      return response.data.valid
    } catch (error) {
      console.log('Backend non disponible, vérification locale uniquement')
    }
    
    return isValid
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return false
  }
}

/**
 * Vérifie si un utilisateur a déjà une mélodie enregistrée
 */
export const hasMelody = (userEmail = null) => {
  if (userEmail) {
    const userKey = `melody_${userEmail.toLowerCase()}`
    return localStorage.getItem(userKey) !== null
  }
  
  // Chercher n'importe quel utilisateur
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('melody_')) {
      return true
    }
  }
  return false
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = () => {
  return localStorage.getItem(CURRENT_USER_KEY)
}

/**
 * Liste tous les utilisateurs qui ont une mélodie enregistrée
 */
export const getAllUsers = () => {
  const users = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('melody_')) {
      const email = key.replace('melody_', '')
      users.push(email)
    }
  }
  return users
}

/**
 * Supprime la mélodie d'un utilisateur
 */
export const deleteMelody = (userEmail) => {
  const email = userEmail || getCurrentUser()
  if (email) {
    const userKey = `melody_${email.toLowerCase()}`
    localStorage.removeItem(userKey)
    localStorage.removeItem(`failed_attempts_${email}`)
    
    if (getCurrentUser() === email) {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }
}

/**
 * Se déconnecter
 */
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

/**
 * Gestion des tentatives échouées par utilisateur
 */
export const getFailedAttempts = (userEmail) => {
  const key = `failed_attempts_${userEmail.toLowerCase()}`
  const attempts = localStorage.getItem(key)
  return attempts ? parseInt(attempts) : 0
}

export const incrementFailedAttempts = (userEmail) => {
  const current = getFailedAttempts(userEmail)
  const key = `failed_attempts_${userEmail.toLowerCase()}`
  localStorage.setItem(key, (current + 1).toString())
}

export const resetFailedAttempts = (userEmail) => {
  const key = `failed_attempts_${userEmail.toLowerCase()}`
  localStorage.removeItem(key)
}

export const isBlocked = (userEmail) => {
  return getFailedAttempts(userEmail) >= 5
}

/**
 * Calcule la robustesse d'une mélodie
 */
export const calculateMelodyStrength = (notes) => {
  const uniqueNotes = new Set(notes).size
  const hasBlackKeys = notes.some(note => note.includes('#'))
  const hasPattern = checkForPattern(notes)
  
  let strength = 0
  
  // Diversité des notes (max 30 points)
  strength += (uniqueNotes / 6) * 30
  
  // Utilisation de touches noires (20 points)
  if (hasBlackKeys) strength += 20
  
  // Pas de pattern évident (50 points)
  if (!hasPattern) strength += 50
  
  return {
    score: Math.round(strength),
    level: strength < 40 ? 'Faible' : strength < 70 ? 'Moyen' : 'Fort',
    suggestions: getMelodySuggestions(notes)
  }
}

const checkForPattern = (notes) => {
  // Vérifie les patterns trop simples
  const noteSequence = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const melodyStr = notes.join('-')
  
  // Séquence ascendante
  if (melodyStr.includes('C-D-E') || melodyStr.includes('F-G-A')) return true
  
  // Répétition
  if (notes[0] === notes[1] && notes[1] === notes[2]) return true
  
  return false
}

const getMelodySuggestions = (notes) => {
  const suggestions = []
  const uniqueNotes = new Set(notes).size
  const hasBlackKeys = notes.some(note => note.includes('#'))
  
  if (uniqueNotes < 4) {
    suggestions.push('Utilise plus de notes différentes')
  }
  if (!hasBlackKeys) {
    suggestions.push('Ajoute quelques touches noires (♯)')
  }
  if (checkForPattern(notes)) {
    suggestions.push('Évite les séquences trop prévisibles')
  }
  
  return suggestions
}