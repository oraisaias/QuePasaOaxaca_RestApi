import { createHash } from 'crypto';

export class EventIdentifierUtil {
  private static readonly SECRET_KEY = process.env.EVENT_ID_SECRET;
  /**
   * Genera un identificador único para un evento basado en su ID real
   * @param realId - El ID real del evento en la base de datos
   * @param titulo - El título del evento para mayor unicidad
   * @param fechaInicio - La fecha de inicio para mayor unicidad
   * @returns Un identificador único de 32 caracteres
   */
  static generateEventIdentifier(
    realId: string,
    titulo: string,
    fechaInicio: Date,
  ): string {
    const dataToHash = `${realId}-${titulo}-${fechaInicio.toISOString()}-${this.SECRET_KEY}`;
    const hash = createHash('sha256').update(dataToHash).digest('hex');

    return hash.substring(0, 32);
  }
  /**
   * Valida si un identificador es válido (formato correcto)
   * @param identifier - El identificador a validar
   * @returns true si el formato es válido
   */
  static isValidIdentifier(identifier: string): boolean {
    // Verificar que sea una cadena hexadecimal de 32 caracteres
    return /^[a-f0-9]{32}$/.test(identifier);
  }
}
