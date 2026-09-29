export const MIN_PASSWORD_LENGTH = 12

export function validatePasswordLength(password: string): true | string {
  return password.length >= MIN_PASSWORD_LENGTH
    ? true
    : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres. Usa la que genera Bitwarden.`
}

/** Cookie de sesión del panel: `Secure` siempre que el sitio se sirva por https. */
export function sessionCookies(serverURL: string): { secure: boolean; sameSite: 'Lax' } {
  return { secure: serverURL.startsWith('https://'), sameSite: 'Lax' }
}
