import axios from 'axios'
import CryptoJS from 'crypto-js'

const API_URL = 'http://localhost:5000/api/auth'

// ===== FONCTIONS DE HACHAGE =====
function hashData(data) {
  return CryptoJS.SHA256(data.toString()).toString()
}

// ===== STOCKAGE LOCAL =====
const STORAGE_KEY = 'nird_users'
const CURRENT_USER_KEY = 'nird_current_user'

function getLocalUsers() {
  const users = localStorage.getItem(STORAGE_KEY)
  return users ? JSON.parse(users) : []
}

function saveLocalUser(user) {
  const users = getLocalUsers()
  users.push(user)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

// ===== CRÉATION DE COMPTES =====

export async function createMelody(melody, email) {
  try {
    const melodyHash = melody.join(',')
    
    const response = await axios.post(`${API_URL}/create-melody`, {
      email,
      melodyHash
    })
    
    // Sauvegarder localement aussi
    saveLocalUser({
      email,
      profileType: 'musical',
      createdAt: new Date().toISOString()
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur création mélodie:', error)
    throw error
  }
}

export async function createScientificAccount(email, scientificData) {
  try {
    const response = await axios.post(`${API_URL}/create-scientific`, {
      email,
      scientificData
    })
    
    saveLocalUser({
      email,
      profileType: 'scientific',
      createdAt: new Date().toISOString()
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur création compte scientifique:', error)
    throw error
  }
}

export async function createMathematicalAccount(email, mathematicalData) {
  try {
    const response = await axios.post(`${API_URL}/create-mathematical`, {
      email,
      mathematicalData
    })
    
    saveLocalUser({
      email,
      profileType: 'mathematical',
      createdAt: new Date().toISOString()
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur création compte mathématique:', error)
    throw error
  }
}

// ===== VÉRIFICATION =====

export async function verifyMelody(melody, email) {
  try {
    const melodyHash = melody.join(',')
    
    const response = await axios.post(`${API_URL}/verify-melody`, {
      email,
      melodyHash
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur vérification mélodie:', error)
    throw error
  }
}

export async function verifyScientificData(scientificData, email) {
  try {
    const response = await axios.post(`${API_URL}/verify-scientific`, {
      email,
      scientificData
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur vérification scientifique:', error)
    return false
  }
}

export async function verifyMathematicalData(mathematicalData, email) {
  try {
    const response = await axios.post(`${API_URL}/verify-mathematical`, {
      email,
      mathematicalData
    })
    
    return response.data
  } catch (error) {
    console.error('Erreur vérification mathématique:', error)
    return false
  }
}

export async function verifyOTP(email, otp) {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      email,
      otp
    })
    
    if (response.data.success) {
      // Sauvegarder l'utilisateur connecté
      localStorage.setItem(CURRENT_USER_KEY, email)
    }
    
    return response.data
  } catch (error) {
    console.error('Erreur vérification OTP:', error)
    throw error
  }
}

// ===== GESTION DES UTILISATEURS =====

export async function getAllUsers() {
  try {
    const response = await axios.get(`${API_URL}/users`)
    return response.data.users
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return getLocalUsers()
  }
}

export async function getUserProfile(email) {
  try {
    const response = await axios.get(`${API_URL}/profile-type/${email}`)
    return response.data
  } catch (error) {
    // Fallback sur stockage local
    const users = getLocalUsers()
    const user = users.find(u => u.email === email)
    return user ? { profileType: user.profileType } : null
  }
}

export function hasMelody(email) {
  const users = getLocalUsers()
  return users.some(user => user.email === email)
}

export function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY)
}
export function setCurrentUser(email) {
  localStorage.setItem(CURRENT_USER_KEY, email)
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// ===== GESTION DES TENTATIVES ÉCHOUÉES =====

const FAILED_ATTEMPTS_KEY = 'nird_failed_attempts'
const BLOCKED_USERS_KEY = 'nird_blocked_users'

export function getFailedAttempts(email) {
  const attempts = localStorage.getItem(`${FAILED_ATTEMPTS_KEY}_${email}`)
  return attempts ? parseInt(attempts) : 0
}

export function incrementFailedAttempts(email) {
  const current = getFailedAttempts(email)
  const newCount = current + 1
  localStorage.setItem(`${FAILED_ATTEMPTS_KEY}_${email}`, newCount)
  
  if (newCount >= 5) {
    const blockedUntil = Date.now() + 5 * 60 * 1000 // 5 minutes
    localStorage.setItem(`${BLOCKED_USERS_KEY}_${email}`, blockedUntil)
  }
  
  return newCount
}

export function resetFailedAttempts(email) {
  localStorage.removeItem(`${FAILED_ATTEMPTS_KEY}_${email}`)
  localStorage.removeItem(`${BLOCKED_USERS_KEY}_${email}`)
}

export function isBlocked(email) {
  const blockedUntil = localStorage.getItem(`${BLOCKED_USERS_KEY}_${email}`)
  if (!blockedUntil) return false
  
  const now = Date.now()
  const blockTime = parseInt(blockedUntil)
  
  if (now < blockTime) {
    return true
  } else {
    // Débloquer si le temps est écoulé
    resetFailedAttempts(email)
    return false
  }
}