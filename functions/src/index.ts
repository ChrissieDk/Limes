import * as functions from 'firebase-functions/v1'
import { adminAuth } from './config/firebaseAdmin'
import { sendEmail } from './email/services/emailService'
import { getVerificationEmailHtml } from './email/templates/verificationEmail'
import { getPasswordResetEmailHtml } from './email/templates/passwordResetEmail'

// Secrets must be bound via runWith() so they are available as process.env in 1st gen
const runtimeOpts = { secrets: ['RESEND_API_KEY', 'EMAIL_FROM_ADDRESS', 'FRONTEND_URL', 'CONTACT_SUPPORT_EMAILS'] }

/** Default inbox when env is unset (contact form only). */
const DEFAULT_CONTACT_INBOX =
  'support@simpal.co.za,christiaan@simpal.co.za,wayne@simpal.co.za,imtiyaaz@simpal.co.za,ryan@simpal.co.za,hayley@simpal.co.za'

/** Comma-separated inbox list, e.g. "a@x.com,b@y.com". Falls back to CONTACT_SUPPORT_EMAIL or DEFAULT_CONTACT_INBOX. */
function getContactInboxRecipients(): string[] {
  const raw =
    process.env.CONTACT_SUPPORT_EMAILS ??
    process.env.CONTACT_SUPPORT_EMAIL ??
    DEFAULT_CONTACT_INBOX
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => emailRegex.test(s))
  if (list.length > 0) {
    return list
  }
  return DEFAULT_CONTACT_INBOX.split(',')
    .map((s) => s.trim())
    .filter((s) => emailRegex.test(s))
}

const CONTACT_QUERY_LABEL: Record<string, string> = {
  partnership: 'Partnership',
  support: 'Support',
  sales: 'Sales',
  other: 'Other',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Cloud Function: Automatically sends verification email when user signs up
 * Trigger: Firebase Auth onCreate event
 */
export const onUserSignup = functions.runWith(runtimeOpts).auth.user().onCreate(async (user) => {
  try {
    // Skip if email is not provided
    if (!user.email) {
      console.log('User created without email, skipping verification email')
      return
    }

    // Skip if email is already verified
    if (user.emailVerified) {
      console.log('User email already verified, skipping verification email')
      return
    }

    // Generate email verification link using Firebase Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(user.email)

    // Extract user name from displayName or email
    const userName = user.displayName || user.email.split('@')[0]

    const frontendUrl = process.env.FRONTEND_URL || 'https://yourdomain.com'
    const emailHtml = getVerificationEmailHtml(userName, verificationLink, frontendUrl)

    // Send email via Resend
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Limes! Verify your email',
      html: emailHtml,
    })

    console.log(`Verification email sent to ${user.email}`)
  } catch (error) {
    console.error('Error sending verification email:', error)
    // Don't throw - we don't want to fail user creation if email fails
  }
})

/**
 * Cloud Function: Send password reset email
 * Callable from frontend
 */
export const sendPasswordResetEmail = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  try {
    // Validate input
    const { email } = data

    if (!email || typeof email !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email is required and must be a string'
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid email format'
      )
    }

    // Check if user exists
    let user
    try {
      user = await adminAuth.getUserByEmail(email)
    } catch (error: any) {
      // If user doesn't exist, don't reveal this to prevent email enumeration
      // Return success anyway for security
      console.log(`User not found for email: ${email}`)
      return { success: true, message: 'If the email exists, a password reset link has been sent.' }
    }

    // Generate password reset link using Firebase Admin SDK
    const resetLink = await adminAuth.generatePasswordResetLink(email)

    // Extract user name from displayName or email
    const userName = user.displayName || email.split('@')[0]

    // Generate email HTML
    const frontendUrl = process.env.FRONTEND_URL || 'https://yourdomain.com'
    const emailHtml = getPasswordResetEmailHtml(userName, resetLink, frontendUrl)

    // Send email via Resend
    await sendEmail({
      to: email,
      subject: 'Reset your Limes password',
      html: emailHtml,
    })

    console.log(`Password reset email sent to ${email}`)

    // Return success (don't reveal if user exists for security)
    return { 
      success: true, 
      message: 'If the email exists, a password reset link has been sent.' 
    }
  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    // Otherwise, wrap in HttpsError
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while sending the password reset email'
    )
  }
})

type ContactPayload = {
  fullName?: unknown
  email?: unknown
  phone?: unknown
  company?: unknown
  queryType?: unknown
  message?: unknown
}

/** Callable: website contact form → support inbox (Resend) */
export const submitContactInquiry = functions.runWith(runtimeOpts).https.onCall(async (data: ContactPayload, _context) => {
  try {
    const fullNameRaw = typeof data.fullName === 'string' ? data.fullName.trim() : ''
    const emailRaw = typeof data.email === 'string' ? data.email.trim() : ''
    const phoneRaw = typeof data.phone === 'string' ? data.phone.trim() : ''
    const companyRaw = typeof data.company === 'string' ? data.company.trim() : ''
    const queryType = typeof data.queryType === 'string' ? data.queryType : ''
    const messageRaw = typeof data.message === 'string' ? data.message.trim() : ''

    if (!fullNameRaw || fullNameRaw.length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Enter your full name (max 200 characters).')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailRaw)) {
      throw new functions.https.HttpsError('invalid-argument', 'Enter a valid email address.')
    }
    if (phoneRaw.length > 40) {
      throw new functions.https.HttpsError('invalid-argument', 'Contact number is too long.')
    }
    if (companyRaw.length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Company name is too long.')
    }
    if (!CONTACT_QUERY_LABEL[queryType]) {
      throw new functions.https.HttpsError('invalid-argument', 'Select a query type.')
    }
    if (!messageRaw || messageRaw.length > 5000) {
      throw new functions.https.HttpsError('invalid-argument', 'Enter a message (max 5000 characters).')
    }

    const queryLabel = CONTACT_QUERY_LABEL[queryType]

    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.5; color:#111;">
        <p><strong>New contact form — Limes</strong></p>
        <table style="border-collapse:collapse;max-width:560px;">
          <tr><td style="padding:4px 12px 4px 0;color:#444;">Full name</td><td>${escapeHtml(fullNameRaw)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#444;">Email</td><td><a href="mailto:${escapeHtml(emailRaw)}">${escapeHtml(emailRaw)}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#444;">Contact number</td><td>${escapeHtml(phoneRaw) || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#444;">Company</td><td>${escapeHtml(companyRaw) || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#444;">Query type</td><td>${escapeHtml(queryLabel)}</td></tr>
        </table>
        <p style="margin-top:16px;"><strong>Message</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(messageRaw)}</p>
      </div>
    `

    await sendEmail({
      to: getContactInboxRecipients(),
      subject: `[Limes contact] ${queryLabel} — ${fullNameRaw}`,
      html: emailHtml,
      replyTo: emailRaw,
    })

    return { success: true as const }
  } catch (error: unknown) {
    console.error('Error sending contact inquiry:', error)
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    throw new functions.https.HttpsError(
      'internal',
      'Could not send your message. Please try again shortly.'
    )
  }
})
