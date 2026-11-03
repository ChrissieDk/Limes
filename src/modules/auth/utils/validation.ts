// South African numbers: 0XX XXX XXXX, +27 XX XXX XXXX or 27XX XXX XXXX (spaces, dashes, brackets allowed)
const SA_PHONE = /^(?:\+27|27|0)[1-8]\d{8}$/
const EMAIL = /^[^\s@.][^\s@]*@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/

export const isSaPhone = (value: string): boolean => SA_PHONE.test(value.replace(/[\s\-()]/g, ''))

export const isEmail = (value: string): boolean => EMAIL.test(value.trim())
