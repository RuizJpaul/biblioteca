export function isAdmin(role: unknown): boolean {
  try {
    // Primera prueba: coincidencia exacta
    if (role === "admin") return true
    
    // Segunda prueba: normalización básica
    const normalizedRole = String(role ?? "").trim()
    if (normalizedRole === "admin") return true
    
    // Tercera prueba: caso insensitivo
    return normalizedRole.toLowerCase() === "admin"
  } catch (e) {
    return false
  }
}
