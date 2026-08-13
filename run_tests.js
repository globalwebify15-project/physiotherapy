const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('=== STARTING PHYSIOTHERAPY APPOINTMENT PLATFORM API TESTS ===\n');

  try {
    // 1. Send OTP
    console.log('1. Sending OTP...');
    const sendOtpRes = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543219' })
    });
    const sendOtpData = await sendOtpRes.json();
    console.log('   Response Status:', sendOtpRes.status);
    console.log('   Response Body:', JSON.stringify(sendOtpData, null, 2));
    
    if (!sendOtpData.success || !sendOtpData.otp) {
      throw new Error('Failed to send OTP or retrieve OTP code.');
    }
    const otp = sendOtpData.otp;

    // 2. Verify OTP
    console.log('\n2. Verifying OTP...');
    const verifyOtpRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543219', otp: otp })
    });
    const verifyOtpData = await verifyOtpRes.json();
    console.log('   Response Status:', verifyOtpRes.status);
    console.log('   Response Body:', JSON.stringify(verifyOtpData, null, 2));

    if (!verifyOtpData.success || !verifyOtpData.accessToken) {
      throw new Error('Failed to verify OTP or retrieve access token.');
    }
    const patientToken = verifyOtpData.accessToken;

    // 3. Admin Staff Login
    console.log('\n3. Admin Staff Login...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@globalwebify.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('   Response Status:', adminLoginRes.status);
    console.log('   Response Body:', JSON.stringify(adminLoginData, null, 2));

    if (!adminLoginData.success || !adminLoginData.accessToken) {
      throw new Error('Failed to log in as admin.');
    }
    const adminToken = adminLoginData.accessToken;

    // 4. Fetch Services (Public)
    console.log('\n4. Fetching Services...');
    const servicesRes = await fetch(`${BASE_URL}/services`);
    const servicesData = await servicesRes.json();
    console.log('   Response Status:', servicesRes.status);
    console.log('   Services Count:', servicesData.services ? servicesData.services.length : 0);

    if (!servicesData.services || servicesData.services.length === 0) {
      throw new Error('No services available in the database.');
    }
    const serviceId = servicesData.services[0]._id;
    console.log('   Selected Service ID:', serviceId, `(${servicesData.services[0].title})`);

    // 5. Fetch Therapists (Public)
    console.log('\n5. Fetching Therapists...');
    const therapistsRes = await fetch(`${BASE_URL}/therapists`);
    const therapistsData = await therapistsRes.json();
    console.log('   Response Status:', therapistsRes.status);
    console.log('   Therapists Count:', therapistsData.therapists ? therapistsData.therapists.length : 0);

    if (!therapistsData.therapists || therapistsData.therapists.length === 0) {
      throw new Error('No therapists available in the database.');
    }
    const therapistId = therapistsData.therapists[0]._id;
    console.log('   Selected Therapist ID:', therapistId, `(${therapistsData.therapists[0].name})`);

    // 6. Fetch Available Slots for Therapist
    console.log(`\n6. Fetching Available Slots for Therapist on 2026-08-12...`);
    const slotsRes = await fetch(`${BASE_URL}/appointments/slots?date=2026-08-12&therapistId=${therapistId}`);
    const slotsData = await slotsRes.json();
    console.log('   Response Status:', slotsRes.status);
    console.log('   Available Slots:', slotsData.slots);

    if (!slotsData.slots || slotsData.slots.length === 0) {
      throw new Error('No slots available for Dr. Sarah Connor on 2026-08-12. Please seed or choose another date.');
    }
    const availableSlot = slotsData.slots[0];
    console.log('   Selected Available Slot:', availableSlot);

    // 7. Book an Appointment (As Patient)
    console.log('\n7. Booking Appointment as Patient...');
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        serviceId: serviceId,
        therapistId: therapistId,
        date: '2026-08-12',
        timeSlot: availableSlot,
        visitType: 'clinic'
      })
    });
    const bookData = await bookRes.json();
    console.log('   Response Status:', bookRes.status);
    console.log('   Response Body:', JSON.stringify(bookData, null, 2));

    if (!bookData.success || !bookData.appointment) {
      throw new Error('Failed to book appointment.');
    }
    const appointmentId = bookData.appointment._id;

    // 8. Initiate Payment (As Patient)
    console.log('\n8. Initiating Payment Order...');
    const paymentRes = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({ appointmentId: appointmentId })
    });
    const paymentData = await paymentRes.json();
    console.log('   Response Status:', paymentRes.status);
    console.log('   Response Body:', JSON.stringify(paymentData, null, 2));

    if (!paymentData.orderId) {
      throw new Error('Failed to initiate payment.');
    }
    const orderId = paymentData.orderId;

    // 9. Verify Razorpay Payment (As Patient)
    console.log('\n9. Verifying Razorpay Payment...');
    const verifyPayRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: orderId,
        razorpayPaymentId: 'pay_sandbox_12345',
        razorpaySignature: 'sandbox_sig'
      })
    });
    const verifyPayData = await verifyPayRes.json();
    console.log('   Response Status:', verifyPayRes.status);
    console.log('   Response Body:', JSON.stringify(verifyPayData, null, 2));

    // 10. Fetch Admin Dashboard Stats (As Admin)
    console.log('\n10. Fetching Admin Dashboard Stats...');
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    console.log('   Response Status:', dashRes.status);
    console.log('   Response Body:', JSON.stringify(dashData, null, 2));

    // 11. Generate Revenue Report (As Admin)
    console.log('\n11. Generating Revenue Report...');
    const reportRes = await fetch(`${BASE_URL}/reports?type=revenue`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const reportData = await reportRes.json();
    console.log('   Response Status:', reportRes.status);
    console.log('   Response Body:', JSON.stringify(reportData, null, 2));

    // 12. Fetch Patient Notifications (As Patient)
    console.log('\n12. Fetching Patient Notifications...');
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const notifData = await notifRes.json();
    console.log('   Response Status:', notifRes.status);
    console.log('   Notifications Count:', notifData.notifications ? notifData.notifications.length : 0);
    console.log('   Notifications:', JSON.stringify(notifData.notifications, null, 2));

    if (!notifData.notifications || notifData.notifications.length === 0) {
      throw new Error('No notifications found for the patient.');
    }
    const notificationId = notifData.notifications[0]._id;

    // 13. Mark Notification as Read (As Patient)
    console.log(`\n13. Marking Notification ${notificationId} as Read...`);
    const readRes = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const readData = await readRes.json();
    console.log('   Response Status:', readRes.status);
    console.log('   Response Body:', JSON.stringify(readData, null, 2));

    if (!readData.success || !readData.notification.isRead) {
      throw new Error('Failed to mark notification as read.');
    }

    console.log('\n=== ALL API TESTS COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n=== API TEST FAILURE ===');
    console.error(error);
    process.exit(1);
  }
}

runTests();
