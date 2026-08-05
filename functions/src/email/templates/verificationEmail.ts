/**
 * Email verification template
 * Matches Limes dark design system:
 *  - bg: #0E0E12 (app dark background)
 *  - card: transparent-ish with white/10 border → emailed as #16161C
 *  - primary green: #ABFF63
 *  - text: white / #A0A0A8 (neutral-400)
 *  - button: #ABFF63 bg, #000 text, border-2 solid black, 4px hard shadow
 */
export function getVerificationEmailHtml(
  userName: string,
  verificationLink: string
): string {
  const year = new Date().getFullYear()
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email – Limes</title>
</head>
<body style="margin:0;padding:0;background-color:#0E0E12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E0E12;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#16161C;border-radius:28px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background-color:#ABFF63;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 0 40px;">
              <!-- Logo text -->
              <p style="margin:0 0 32px 0;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.03em;">Limes</p>

              <!-- Badge -->
              <p style="margin:0 0 16px 0;display:inline-block;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#A0A0A8;letter-spacing:0.04em;text-transform:uppercase;">
                  <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#ABFF63;"></span>
                  Email Verification
                </span>
              </p>

              <!-- Headline -->
              <h1 style="margin:0 0 12px 0;font-size:36px;font-weight:800;color:#FFFFFF;line-height:1.1;letter-spacing:-0.02em;">
                Welcome to Limes!
              </h1>
              <p style="margin:0;font-size:15px;color:#A0A0A8;line-height:1.6;">
                Your mobile plan that actually makes sense.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <div style="height:1px;background-color:rgba(255,255,255,0.07);font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#E8E8F0;line-height:1.7;">
                Hi ${userName || 'there'},
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#E8E8F0;line-height:1.7;">
                Thanks for signing up! We're excited to have you join the Limes community. Please verify your email address to complete your registration and start enjoying your mobile plan.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ABFF63;border-radius:12px;border:2px solid rgba(0,0,0,0.7);box-shadow:4px 4px 0 0 rgba(0,0,0,0.7);">
                    <a href="${verificationLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000000;text-decoration:none;letter-spacing:-0.01em;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <p style="margin:0 0 6px 0;font-size:13px;color:#606068;line-height:1.5;">
                Button not working? Copy and paste this link:
              </p>
              <p style="margin:0;font-size:12px;color:#ABFF63;word-break:break-all;line-height:1.5;">
                ${verificationLink}
              </p>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(171,255,99,0.07);border-radius:12px;border:1px solid rgba(171,255,99,0.15);">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#A0A0A8;line-height:1.6;">
                      This link will expire in <strong style="color:#ABFF63;">24 hours</strong>. If you didn't create a Limes account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 36px 40px;">
              <div style="height:1px;background-color:rgba(255,255,255,0.07);margin-bottom:24px;font-size:0;line-height:0;">&nbsp;</div>
              <p style="margin:0 0 6px 0;font-size:13px;color:#606068;text-align:center;">
                © ${year} Limes. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#484850;text-align:center;">
                Questions? Reach out to our support team.
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
