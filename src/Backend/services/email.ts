/**
 * Email Service Abstraction
 * 
 * - Development: Logs reset link to console (ConsoleEmailService)
 * - Production: Sends real email via Resend API (ResendEmailService)
 */

// ── Interface ──

interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string, expiresInMinutes: number): Promise<void>;
}

// ── HTML Email Template ──

function buildResetEmailHtml(resetUrl: string, expiresInMinutes: number): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #eee;">
              <div style="font-size:24px;font-weight:800;letter-spacing:0.1em;color:#1a1a1a;">NORA</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1a1a1a;">Đặt lại mật khẩu</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                Nhấn nút bên dưới để tạo mật khẩu mới:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetUrl}" 
                       style="display:inline-block;padding:14px 32px;background-color:#0066cc;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.02em;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#888;">
                Link này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>. 
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">
                Nếu nút không hoạt động, sao chép và dán link sau vào trình duyệt:<br>
                <a href="${resetUrl}" style="color:#0066cc;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#fafafa;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#999;">&copy; NORA — Email này được gửi tự động, vui lòng không trả lời.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ── Console Email Service (Development) ──

class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(to: string, resetUrl: string, expiresInMinutes: number): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
    console.log('='.repeat(60));
    console.log(`To:      ${to}`);
    console.log(`Expires: ${expiresInMinutes} minutes`);
    console.log(`Link:    ${resetUrl}`);
    console.log('='.repeat(60) + '\n');
  }
}

// ── Resend Email Service (Production) ──

class ResendEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'NORA <noreply@nora.com>') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, expiresInMinutes: number): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [to],
        subject: 'NORA — Đặt lại mật khẩu của bạn',
        html: buildResetEmailHtml(resetUrl, expiresInMinutes),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      throw new Error('Failed to send password reset email');
    }
  }
}

// ── Factory ──

export function getEmailService(): EmailService {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'NORA <onboarding@resend.dev>';

  if (resendApiKey) {
    return new ResendEmailService(resendApiKey, fromEmail);
  }

  // Fallback to console logging in development
  console.warn('⚠️  RESEND_API_KEY not set — using ConsoleEmailService (reset links will be logged to console)');
  return new ConsoleEmailService();
}
