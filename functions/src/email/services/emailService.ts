import { Resend } from 'resend'

interface SendEmailOptions {
  /** One or more recipient addresses (same message to all). */
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

/**
 * Send email using Resend.
 * Resend client is created at runtime so secrets are available (not during deploy analysis).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Read at runtime so Firebase Secrets are available (empty during deploy analysis)
  const resendApiKey = process.env.RESEND_API_KEY || ''
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set. Use firebase functions:secrets:set RESEND_API_KEY')
  }

  const resend = new Resend(resendApiKey)

  // Get email from address from environment variable
  const defaultFrom = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'
  const fromEmail = options.from || defaultFrom

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    })

    if (error) {
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`)
    }

    console.log('Email sent successfully:', data)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
