import nodemailer from 'nodemailer';
import { CMS } from 'database';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
  isEnabled: boolean;
}

export interface NotificationRecipientsConfig {
  clinicAlertEmails: string[];
  clinicAlertPhones: string[];
  sendToPatientEmail: boolean;
  sendToPatientSms: boolean;
  sendToDoctorEmail: boolean;
  sendToClinicAdmin: boolean;
  autoSendInvoiceOnPayment: boolean;
}

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || 'contact@quickphysio24.com',
  pass: process.env.SMTP_PASS || '',
  senderName: 'QuickPhysio24.com',
  senderEmail: process.env.SMTP_USER || 'contact@quickphysio24.com',
  isEnabled: true,
};

export const DEFAULT_RECIPIENTS_CONFIG: NotificationRecipientsConfig = {
  clinicAlertEmails: ['contact@quickphysio24.com', 'admin@globalwebify.com'],
  clinicAlertPhones: ['+919110912544', '+919693233447'],
  sendToPatientEmail: true,
  sendToPatientSms: true,
  sendToDoctorEmail: true,
  sendToClinicAdmin: true,
  autoSendInvoiceOnPayment: true,
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const block: any = await CMS.findOne({ key: 'smtp_settings' }).lean();
    if (block && block.content && typeof block.content === 'object') {
      const c = block.content as any;
      return {
        host: c.host || DEFAULT_SMTP_CONFIG.host,
        port: Number(c.port) || DEFAULT_SMTP_CONFIG.port,
        secure: Boolean(c.secure),
        user: c.user || DEFAULT_SMTP_CONFIG.user,
        pass: c.pass || DEFAULT_SMTP_CONFIG.pass,
        senderName: c.senderName || DEFAULT_SMTP_CONFIG.senderName,
        senderEmail: c.senderEmail || DEFAULT_SMTP_CONFIG.senderEmail,
        isEnabled: c.isEnabled !== undefined ? Boolean(c.isEnabled) : true,
      };
    }
  } catch (err) {
    console.warn('[Mailer] Could not read smtp_settings from DB, using fallback:', err);
  }
  return DEFAULT_SMTP_CONFIG;
}

export async function getNotificationRecipients(): Promise<NotificationRecipientsConfig> {
  try {
    const block: any = await CMS.findOne({ key: 'notification_recipients' }).lean();
    if (block && block.content && typeof block.content === 'object') {
      const c = block.content as any;
      return {
        clinicAlertEmails: Array.isArray(c.clinicAlertEmails) && c.clinicAlertEmails.length > 0
          ? c.clinicAlertEmails
          : DEFAULT_RECIPIENTS_CONFIG.clinicAlertEmails,
        clinicAlertPhones: Array.isArray(c.clinicAlertPhones) && c.clinicAlertPhones.length > 0
          ? c.clinicAlertPhones
          : DEFAULT_RECIPIENTS_CONFIG.clinicAlertPhones,
        sendToPatientEmail: c.sendToPatientEmail !== undefined ? Boolean(c.sendToPatientEmail) : true,
        sendToPatientSms: c.sendToPatientSms !== undefined ? Boolean(c.sendToPatientSms) : true,
        sendToDoctorEmail: c.sendToDoctorEmail !== undefined ? Boolean(c.sendToDoctorEmail) : true,
        sendToClinicAdmin: c.sendToClinicAdmin !== undefined ? Boolean(c.sendToClinicAdmin) : true,
        autoSendInvoiceOnPayment: c.autoSendInvoiceOnPayment !== undefined ? Boolean(c.autoSendInvoiceOnPayment) : true,
      };
    }
  } catch (err) {
    console.warn('[Mailer] Could not read notification_recipients from DB, using fallback:', err);
  }
  return DEFAULT_RECIPIENTS_CONFIG;
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for 587
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Live SMTP Testing Service
export async function testSmtpConnection(
  targetEmail: string,
  overrideConfig?: Partial<SmtpConfig>
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const baseConfig = await getSmtpConfig();
  const config: SmtpConfig = { ...baseConfig, ...(overrideConfig || {}) };

  if (!config.user || !config.pass) {
    return {
      success: false,
      message: 'SMTP Username and Password / App Password are required to send emails.',
    };
  }

  const transporter = createTransporter(config);

  try {
    // 1. Verify connection credentials
    await transporter.verify();

    // 2. Dispatch a verification email
    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail || config.user}>`,
      to: targetEmail,
      subject: `[Verified] QuickPhysio24.com SMTP Test Connection`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #0f172a;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #094d47, #0f766e); padding: 24px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">QuickPhysio24.com</h2>
              <p style="margin: 4px 0 0; font-size: 12px; color: #ccfbf1; font-weight: 600;">SMTP Mail Server Test & Verification</p>
            </div>
            <div style="padding: 24px;">
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 20px;">
                <span style="color: #047857; font-weight: 800; font-size: 14px;">✓ SMTP Connection Successfully Established!</span>
              </div>
              <p style="font-size: 13px; line-height: 1.6; color: #475569;">
                This test message confirms that your <strong>QuickPhysio24.com</strong> SMTP credentials and mail server parameters are operating normally.
              </p>
              <div style="background: #f1f5f9; border-radius: 10px; padding: 12px; margin: 16px 0; font-size: 12px; color: #334155; line-height: 1.6;">
                <div><strong>Host:</strong> ${config.host}:${config.port}</div>
                <div><strong>Encryption:</strong> ${config.secure ? 'SSL (465)' : 'TLS / STARTTLS (587)'}</div>
                <div><strong>Sender Identity:</strong> ${config.senderName} &lt;${config.senderEmail || config.user}&gt;</div>
                <div><strong>Target Recipient:</strong> ${targetEmail}</div>
                <div><strong>Verified Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
              </div>
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
                Automated clinical notification system • QuickPhysio24.com
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      message: `Test email successfully dispatched to ${targetEmail} (Message ID: ${info.messageId})`,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[SMTP Test Error]:', err);
    return {
      success: false,
      message: err.message || 'SMTP handshake failed. Please check host, port, or app password.',
    };
  }
}

// Multi-Recipient Booking Confirmation Dispatcher
export async function sendBookingConfirmationEmails(data: {
  appointment: any;
  patient?: any;
  therapist?: any;
  service?: any;
  customNote?: string;
}): Promise<{ sentCount: number; errors: string[] }> {
  const [smtpConfig, recipientRules] = await Promise.all([
    getSmtpConfig(),
    getNotificationRecipients(),
  ]);

  if (!smtpConfig.isEnabled || !smtpConfig.user || !smtpConfig.pass) {
    return { sentCount: 0, errors: ['SMTP is disabled or unconfigured'] };
  }

  const { appointment, patient, therapist, service } = data;
  const invNo = (appointment._id || 'A58652').toString().slice(-6).toUpperCase();
  const dateStr = appointment.date || 'Scheduled Date';
  const timeSlot = appointment.timeSlot || 'Scheduled Time';
  const visitType = appointment.sessionType === 'home' || appointment.visitType === 'home' ? 'Doorstep Home Visit' : 'In-Clinic Consultation';
  const serviceTitle = service?.title || 'Comprehensive Physiotherapy Care';
  const patientName = patient?.name || 'Valued Patient';
  const patientMobile = patient?.emergencyContact?.phone || patient?.mobile || 'N/A';
  const patientEmail = patient?.email || (patient?.userId && patient.userId.email ? patient.userId.email : null);
  const doctorName = therapist?.name || 'QuickPhysio24 Senior Physiotherapist';
  const doctorEmail = therapist?.email || null;
  const address = appointment.address || 'Ashok Nagar Clinic, Ranchi';

  // Gather target recipients according to configured rules
  const targetEmails: { email: string; role: 'patient' | 'doctor' | 'admin' }[] = [];

  if (recipientRules.sendToPatientEmail && patientEmail && patientEmail.includes('@')) {
    targetEmails.push({ email: patientEmail, role: 'patient' });
  }

  if (recipientRules.sendToDoctorEmail && doctorEmail && doctorEmail.includes('@')) {
    targetEmails.push({ email: doctorEmail, role: 'doctor' });
  }

  if (recipientRules.sendToClinicAdmin && recipientRules.clinicAlertEmails.length > 0) {
    recipientRules.clinicAlertEmails.forEach((adminEmail) => {
      const clean = adminEmail.trim();
      if (clean && clean.includes('@') && !targetEmails.some((t) => t.email.toLowerCase() === clean.toLowerCase())) {
        targetEmails.push({ email: clean, role: 'admin' });
      }
    });
  }

  if (targetEmails.length === 0) {
    return { sentCount: 0, errors: ['No valid recipient email addresses found'] };
  }

  const transporter = createTransporter(smtpConfig);
  let sentCount = 0;
  const errors: string[] = [];

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 24px 12px; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #094d47, #0f766e); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">QuickPhysio24.com</h1>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #ccfbf1; font-weight: 700;">
            Appointment Confirmation & Clinical Summary
          </p>
        </div>

        <div style="padding: 24px;">
          <!-- Status Stamp -->
          <div style="background: #f0fdfa; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; text-align: center;">
            <span style="color: #047857; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
              ✓ Appointment Confirmed (ID: #${invNo})
            </span>
          </div>

          <p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
            Hello <strong>${patientName}</strong>, your physiotherapy consultation with <strong>QuickPhysio24.com</strong> has been scheduled successfully.
          </p>

          <!-- Appointment Details Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Treatment Service:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 800; text-align: right;">${serviceTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Date & Time Slot:</td>
                <td style="padding: 10px 0; color: #0f766e; font-weight: 800; text-align: right;">${dateStr} • ${timeSlot}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Visit Mode:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right;">${visitType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Assigned Specialist:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right;">${doctorName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Patient Contact:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right;">${patientMobile}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Consultation Location:</td>
                <td style="padding: 10px 0; color: #334155; font-weight: 600; text-align: right;">${address}</td>
              </tr>
            </tbody>
          </table>

          <!-- Instructions Card -->
          <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #44403c; line-height: 1.5;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Patient Guidelines:</strong>
            • For Home Visits: Please keep previous MRI / X-Ray / clinical reports accessible.<br>
            • For Clinic Visits: Arrive 10 minutes prior at Ashok Nagar Road No. 1 center.<br>
            • Emergency / Helpline: Call <strong>+91 91109 12544</strong> or WhatsApp <strong>+91 96932 33447</strong>.
          </div>

          <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              QuickPhysio24.com • Ashok Nagar Rd No 1, opp. Overhead Water Tank, Ranchi, Jharkhand 834002<br>
              MIAP Certified • JSCPT Registered Physical Rehabilitation Center
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Send to all targets in parallel
  await Promise.all(
    targetEmails.map(async (target) => {
      try {
        await transporter.sendMail({
          from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail || smtpConfig.user}>`,
          to: target.email,
          subject: `[Confirmed] QuickPhysio24 Appointment #${invNo} - ${patientName} (${visitType})`,
          html: htmlContent,
        });
        sentCount++;
      } catch (e: any) {
        errors.push(`Failed sending to ${target.email}: ${e.message}`);
      }
    })
  );

  return { sentCount, errors };
}

// Multi-Recipient Official Payment Invoice & Receipt Dispatcher
export async function sendPaymentInvoiceEmail(data: {
  payment: any;
  appointment?: any;
  patient?: any;
  therapist?: any;
  service?: any;
}): Promise<{ sentCount: number; errors: string[] }> {
  const [smtpConfig, recipientRules] = await Promise.all([
    getSmtpConfig(),
    getNotificationRecipients(),
  ]);

  if (!smtpConfig.isEnabled || !smtpConfig.user || !smtpConfig.pass) {
    return { sentCount: 0, errors: ['SMTP is disabled or unconfigured'] };
  }

  const { payment, appointment, patient, therapist, service } = data;
  const invNo = (payment._id || appointment?._id || 'A58652').toString().slice(-6).toUpperCase();
  const dateStr = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const amount = payment.amount || 700;
  const paymentMethod = payment.paymentMethod || 'Razorpay Online';
  const txnId = payment.razorpayPaymentId || payment.razorpayOrderId || `TXN_${invNo}`;
  const patientName = patient?.name || 'Verified Patient';
  const patientEmail = patient?.email || (patient?.userId && patient.userId.email ? patient.userId.email : null);
  const patientMobile = patient?.emergencyContact?.phone || patient?.mobile || 'N/A';
  const doctorName = therapist?.name || 'QuickPhysio24 Senior Physiotherapist';
  const serviceTitle = service?.title || 'Physical Therapy Consultation';

  const targetEmails: string[] = [];
  if (patientEmail && patientEmail.includes('@')) {
    targetEmails.push(patientEmail);
  }

  // Also include clinic alert emails
  recipientRules.clinicAlertEmails.forEach((email) => {
    const clean = email.trim();
    if (clean && clean.includes('@') && !targetEmails.includes(clean)) {
      targetEmails.push(clean);
    }
  });

  if (targetEmails.length === 0) {
    return { sentCount: 0, errors: ['No recipient emails found'] };
  }

  const transporter = createTransporter(smtpConfig);
  let sentCount = 0;
  const errors: string[] = [];

  const invoiceHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 24px 12px; color: #0f172a;">
      <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #094d47, #0f766e); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 900;">QuickPhysio24.com</h1>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #ccfbf1; font-weight: 700;">
            Official Tax Invoice & Patient Payment Receipt
          </p>
        </div>

        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 16px;">
            <div>
              <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 11px;">
                ✓ PAID &amp; VERIFIED
              </span>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Invoice No: <strong style="color: #0f172a;">INV-${invNo}</strong><br>
              Date: <strong>${dateStr}</strong>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Billed To:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${patientName} (${patientMobile})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Specialist Doctor:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Payment Mode:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Transaction Reference:</td>
                <td style="padding: 6px 0; color: #64748b; font-family: monospace; text-align: right;">${txnId.slice(0, 20)}</td>
              </tr>
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; text-align: left; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 0;">Description</th>
                <th style="padding: 8px 0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0;">
                  <strong style="color: #0f172a;">${serviceTitle}</strong><br>
                  <span style="font-size: 11px; color: #64748b;">Clinical physical rehabilitation session fees</span>
                </td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Tax / GST (Healthcare Exempt):</td>
                <td style="padding: 8px 0; text-align: right; color: #64748b;">₹0.00</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0; font-size: 15px;">
                <td style="padding: 12px 0; font-weight: 900; color: #0f172a;">Total Amount Paid:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 900; color: #0f766e;">₹${amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 12px; text-align: center; font-size: 11px; color: #0f766e; margin-top: 16px;">
            🔒 Computer generated official digital receipt • QuickPhysio24.com
          </div>
        </div>
      </div>
    </div>
  `;

  await Promise.all(
    targetEmails.map(async (email) => {
      try {
        await transporter.sendMail({
          from: `"${smtpConfig.senderName}" <${smtpConfig.senderEmail || smtpConfig.user}>`,
          to: email,
          subject: `[Official Invoice] QuickPhysio24 Receipt INV-${invNo} (₹${amount}) - ${patientName}`,
          html: invoiceHtml,
        });
        sentCount++;
      } catch (e: any) {
        errors.push(`Failed sending invoice to ${email}: ${e.message}`);
      }
    })
  );

  return { sentCount, errors };
}
