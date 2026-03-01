/**
 * Validates South African ID number (13 digits).
 * Checks: shape, date of birth (YYMMDD), citizenship digit, Luhn checksum.
 */
export function isValidSouthAfricanId(id: string): boolean {
  if (typeof id !== 'string' || !/^\d{13}$/.test(id)) return false

  const yy = Number(id.slice(0, 2))
  const mm = Number(id.slice(2, 4))
  const dd = Number(id.slice(4, 6))

  const now = new Date()
  const currentYY = now.getFullYear() % 100
  const fullYear = yy > currentYY ? 1900 + yy : 2000 + yy

  const dob = new Date(fullYear, mm - 1, dd)
  const isValidDate =
    dob.getFullYear() === fullYear &&
    dob.getMonth() === mm - 1 &&
    dob.getDate() === dd

  if (!isValidDate) return false

  const citizenship = id[10]
  if (citizenship !== '0' && citizenship !== '1') return false

  let sum = 0
  let shouldDouble = false

  for (let i = id.length - 1; i >= 0; i--) {
    let digit = Number(id[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
