import * as functions from 'firebase-functions/v1'
import { adminAuth } from './config/firebaseAdmin'
import { sendEmail } from './email/services/emailService'
import { getVerificationEmailHtml } from './email/templates/verificationEmail'
import { getPasswordResetEmailHtml } from './email/templates/passwordResetEmail'

// Secrets must be bound via runWith() so they are available as process.env in 1st gen
const runtimeOpts = { secrets: ['RESEND_API_KEY', 'EMAIL_FROM_ADDRESS', 'FRONTEND_URL'] }

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
