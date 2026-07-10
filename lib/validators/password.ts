// lib/validators/password.ts
 
export interface PasswordCheck {
  isValid: boolean
  errors: string[]
}
 
export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = []
 
  if (password.length < 8) {
    errors.push("Au moins 8 caractères")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins une majuscule")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Au moins un chiffre")
  }
 
  return { isValid: errors.length === 0, errors }
}
 
export function passwordsMatch(a: string, b: string): boolean {
  return a.length > 0 && a === b
}