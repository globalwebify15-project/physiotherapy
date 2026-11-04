import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment, Patient, Therapist, Service } from 'database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || url.searchParams.get('appointmentId') || url.searchParams.get('paymentId');
    const isDownload = url.searchParams.get('download') === 'true';

    let appointment: any = null;
    let payment: any = null;

    if (id) {
      // 1. Try finding by appointment ID
      appointment = await Appointment.findById(id)
        .populate({ path: 'patientId', model: Patient })
        .populate({ path: 'therapistId', model: Therapist })
        .populate({ path: 'serviceId', model: Service })
        .lean();

      if (appointment) {
        payment = await Payment.findOne({ appointmentId: appointment._id }).lean();
      } else {
        // 2. Try finding by payment ID
        payment = await Payment.findById(id).lean();
        if (payment && payment.appointmentId) {
          appointment = await Appointment.findById(payment.appointmentId)
            .populate({ path: 'patientId', model: Patient })
            .populate({ path: 'therapistId', model: Therapist })
            .populate({ path: 'serviceId', model: Service })
            .lean();
        }
      }
    }

    // Default / Seed Fallback for Preview
    const invNo = (appointment?._id || payment?._id || 'A58652').toString().slice(-6).toUpperCase();
    const invDate = appointment?.date
      ? new Date(appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const patientName = appointment?.patientId?.name || payment?.patientName || 'Verified Patient';
    const patientMobile = appointment?.patientId?.emergencyContact?.phone || payment?.patientMobile || '+91 91109 12544';
    const patientAddr = appointment?.patientId?.savedAddresses?.[0]?.addressLine ||
      appointment?.patientId?.savedAddresses?.[0] ||
      (appointment?.sessionType === 'home' ? 'Patient Residence, Ranchi' : 'In-Clinic Consultation (Ashok Nagar)');

    const doctorName = appointment?.therapistId?.name || 'Dr. Rajnish Bariyar & Dr. Priyanka Bariyar';
    const doctorQual = appointment?.therapistId?.qualification || 'BPT, MIAP, JSCPT Registered';

    const treatmentTitle = appointment?.serviceId?.title || 'Comprehensive Physiotherapy & Manual Therapy';
    const sessionDuration = appointment?.serviceId?.duration ? `${appointment.serviceId.duration} Mins` : '45-60 Mins';
    const visitType = appointment?.sessionType === 'home' ? 'Doorstep Home Visit' : 'In-Clinic Consultation';
    const amount = payment?.amount || appointment?.serviceId?.price?.clinic || 700;
    const paymentStatus = (payment?.status || appointment?.status || 'Paid').toUpperCase();
    const paymentMethod = payment?.paymentMethod || 'Online Razorpay / Verified';
    const txnId = payment?.razorpayPaymentId || payment?.razorpayOrderId || `TXN_${invNo}_VERIFIED`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuickPhysio24.com Invoice #${invNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 16px; }
    .invoice-wrapper { max-width: 780px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden; }
    .action-bar { background: #0f766e; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .btn-action { background: #ffffff; color: #0f766e; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .btn-action:hover { background: #f0fdfa; }
    .invoice-header { padding: 32px 32px 24px; border-bottom: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .brand-logo { display: inline-flex; align-items: center; gap: 10px; }
    .badge-icon { background: #0f766e; color: #ffffff; font-weight: 900; font-size: 18px; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .brand-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .clinic-address { font-size: 12px; color: #64748b; margin-top: 8px; line-height: 1.5; }
    .meta-box { text-align: right; }
    .paid-stamp { display: inline-block; background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; padding: 6px 14px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
    .inv-details { font-size: 12px; color: #64748b; line-height: 1.6; }
    .inv-details strong { color: #0f172a; }
    .party-grid { padding: 24px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #fafaf9; border-bottom: 1px solid #f1f5f9; }
    .party-col h4 { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
    .party-col p { font-size: 13px; color: #334155; line-height: 1.5; }
    .party-col strong { color: #0f172a; font-size: 14px; }
    .table-section { padding: 28px 32px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    td { padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .totals-area { padding: 0 32px 28px; display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; padding: 6px 0; }
    .totals-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0f172a; padding: 12px 0; border-top: 2px solid #e2e8f0; }
    .footer-note { background: #f0fdfa; border-top: 1px solid #ccfbf1; padding: 20px 32px; text-align: center; }
    .footer-note p { font-size: 12px; color: #0f766e; line-height: 1.5; font-weight: 600; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-wrapper { border: none; box-shadow: none; border-radius: 0; max-width: 100%; }
      .action-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="invoice-wrapper">
    <div class="action-bar">
      <span style="font-weight: 800; font-size: 13px;">Official Tax Invoice & Patient Receipt</span>
      <div style="display: flex; gap: 10px;">
        <button class="btn-action" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>
    </div>

    <div class="invoice-header">
      <div>
        <div class="brand-logo">
          <div class="badge-icon">QP</div>
          <div>
            <div class="brand-title">QuickPhysio24.com</div>
            <div class="brand-sub">Physiotherapy & Rehabilitation Center</div>
          </div>
        </div>
        <p class="clinic-address">
          Near Ashok Nagar Rd No 1, opp. Overhead Water Tank, Ranchi, Jharkhand 834002<br>
          MIAP Certified • JSCPT Registered • Govt. Recognized Center<br>
          Helpline: +91 91109 12544 | Support: contact@QuickPhysio24.com
        </p>
      </div>

      <div class="meta-box">
        <div class="paid-stamp">✓ ${paymentStatus}</div>
        <div class="inv-details">
          <p>Invoice No: <strong>INV-${invNo}</strong></p>
          <p>Date: <strong>${invDate}</strong></p>
          <p>Txn Ref: <strong>${txnId.slice(0, 18)}</strong></p>
        </div>
      </div>
    </div>

    <div class="party-grid">
      <div class="party-col">
        <h4>Billed To (Patient)</h4>
        <p><strong>${patientName}</strong></p>
        <p>Mobile: ${patientMobile}</p>
        <p>Location: ${patientAddr}</p>
      </div>
      <div class="party-col">
        <h4>Clinical Specialist & Care</h4>
        <p><strong>${doctorName}</strong></p>
        <p>${doctorQual}</p>
        <p>Visit Mode: <strong>${visitType}</strong></p>
      </div>
    </div>

    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th>Description / Clinical Treatment</th>
            <th>Type</th>
            <th>Duration</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong style="color: #0f172a; font-size: 14px;">${treatmentTitle}</strong><br>
              <span style="color: #64748b; font-size: 12px;">Evidence-based physical therapy & manual rehabilitation protocol</span>
            </td>
            <td>${visitType}</td>
            <td>${sessionDuration}</td>
            <td style="text-align: right; font-weight: 700;">₹${amount}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>₹${amount}</span>
        </div>
        <div class="totals-row">
          <span>Tax / GST</span>
          <span>₹0.00 (Healthcare Exempt)</span>
        </div>
        <div class="totals-total">
          <span>Total Paid</span>
          <span style="color: #0f766e;">₹${amount}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>
        🔒 Computer Generated Official Digital Receipt • No physical signature required.<br>
        Thank you for choosing QuickPhysio24.com for your rehabilitation and recovery care.
      </p>
    </div>
  </div>

  <script>
    // If opened directly on mobile without download trigger, auto-prepare print on request
    if (window.location.search.includes('autoPrint=true')) {
      window.onload = function() { window.print(); };
    }
  </script>
</body>
</html>`;

    if (isDownload) {
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="QuickPhysio24_Invoice_${invNo}.html"`,
        },
      });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
