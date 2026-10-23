import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';

class BookingScreen extends StatefulWidget {
  final String? initialDoctorId;
  final String? initialDoctorName;
  final String? initialServiceId;
  final String? initialServiceTitle;

  const BookingScreen({
    super.key,
    this.initialDoctorId,
    this.initialDoctorName,
    this.initialServiceId,
    this.initialServiceTitle,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _apiService = ApiService();
  final _storage = const FlutterSecureStorage();
  
  List<dynamic> _services = [];
  List<dynamic> _therapists = [
    {
      '_id': 'dr_rajnish',
      'name': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'role': 'Founder & Chief Physiotherapist',
      'image': 'assets/images/dr_rajnish_head.png'
    },
    {
      '_id': 'dr_priyanka',
      'name': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'role': 'Co-Founder & Director',
      'image': 'assets/images/dr_priyanka_head.png'
    }
  ];
  List<String> _slots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM'
  ];

  String? _selectedServiceId = '1';
  String? _selectedTherapistId = 'dr_rajnish';
  String _selectedVisitType = 'clinic';
  String _selectedPaymentMethod = 'online'; // 'online' or 'clinic'
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedSlot = '10:00 AM';
  final _addressController = TextEditingController();

  late Razorpay _razorpay;
  String? _pendingAppointmentId;
  String? _pendingPaymentId;

  bool _isLoading = true;
  bool _isSlotsLoading = false;
  bool _isBookingSubmitting = false;

  @override
  void initState() {
    super.initState();
    _initRazorpay();
    _applyInitialSelections();
    _fetchBookingDetails();
  }

  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    try {
      await _apiService.post('/payments/verify', data: {
        'paymentId': _pendingPaymentId,
        'razorpayPaymentId': response.paymentId,
        'razorpayOrderId': response.orderId,
        'razorpaySignature': response.signature,
      });
    } catch (e) {
      print('[Payment Verify Warning]: $e');
    }

    if (mounted) {
      setState(() => _isBookingSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment Verified! Appointment Confirmed Successfully.'),
          backgroundColor: Color(0xFF0F766E),
        ),
      );
      context.go('/appointments');
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (mounted) {
      setState(() => _isBookingSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment Incomplete: ${response.message ?? "Transaction not completed"}'),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Wallet Selected: ${response.walletName}'),
          backgroundColor: const Color(0xFF0F766E),
        ),
      );
    }
  }

  void _applyInitialSelections() {
    if (widget.initialDoctorId != null && widget.initialDoctorId!.isNotEmpty) {
      _selectedTherapistId = widget.initialDoctorId;
    } else if (widget.initialDoctorName != null && widget.initialDoctorName!.isNotEmpty) {
      final dName = widget.initialDoctorName!.toLowerCase();
      if (dName.contains('priyanka')) {
        _selectedTherapistId = 'dr_priyanka';
      } else if (dName.contains('rajnish')) {
        _selectedTherapistId = 'dr_rajnish';
      }
    }

    if (widget.initialServiceId != null && widget.initialServiceId!.isNotEmpty) {
      _selectedServiceId = widget.initialServiceId;
    }
  }

  @override
  void dispose() {
    _razorpay.clear();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _fetchBookingDetails() async {
    // 1. Preload saved address
    final savedAddr = await _storage.read(key: 'patientAddress');
    if (savedAddr != null && savedAddr.isNotEmpty) {
      _addressController.text = savedAddr;
    }

    try {
      final servicesRes = await _apiService.get('/services');
      final therapistsRes = await _apiService.get('/therapists');
      
      setState(() {
        _services = servicesRes.data['services'] ?? [];
        if (therapistsRes.data['therapists'] != null && (therapistsRes.data['therapists'] as List).isNotEmpty) {
          _therapists = therapistsRes.data['therapists'];
        }
        if (widget.initialServiceTitle != null && widget.initialServiceTitle!.isNotEmpty) {
          final matched = _services.firstWhere(
            (s) => s['title'] != null && s['title'].toString().toLowerCase().contains(widget.initialServiceTitle!.toLowerCase()),
            orElse: () => null,
          );
          if (matched != null) {
            _selectedServiceId = matched['_id'];
          }
        }
        if (_selectedServiceId == null && _services.isNotEmpty) {
          _selectedServiceId = _services[0]['_id'] ?? '1';
        }
        _isLoading = false;
      });
    } catch (e) {
      // Fallback default services if network is offline
      setState(() {
        _services = [
          {'_id': '1', 'title': 'Stroke / Paralysis', 'homePrice': 1200, 'clinicPrice': 800},
          {'_id': '2', 'title': "Parkinson's / Alzheimer's", 'homePrice': 1200, 'clinicPrice': 800},
          {'_id': '3', 'title': "Facial / Bell's Palsy", 'homePrice': 1000, 'clinicPrice': 700},
          {'_id': '4', 'title': 'Vestibular Dysfunction', 'homePrice': 1100, 'clinicPrice': 750},
          {'_id': '5', 'title': 'Cervical Spondylosis', 'homePrice': 950, 'clinicPrice': 650},
          {'_id': '6', 'title': 'Lumbar Spondylosis', 'homePrice': 950, 'clinicPrice': 650},
          {'_id': '7', 'title': 'OA (Knee Pain)', 'homePrice': 950, 'clinicPrice': 650},
          {'_id': '8', 'title': "Tennis / Golfer's Elbow", 'homePrice': 900, 'clinicPrice': 600},
          {'_id': '9', 'title': 'Frozen Shoulder', 'homePrice': 950, 'clinicPrice': 650},
          {'_id': '10', 'title': 'CP Child', 'homePrice': 1300, 'clinicPrice': 850},
          {'_id': '11', 'title': 'Developmental Delay', 'homePrice': 1200, 'clinicPrice': 800},
          {'_id': '12', 'title': 'Autism', 'homePrice': 1300, 'clinicPrice': 850},
          {'_id': '13', 'title': 'Prenatal & Postnatal Physiotherapy', 'homePrice': 1100, 'clinicPrice': 750},
          {'_id': '14', 'title': 'Knee / Hip Replacement Rehab', 'homePrice': 1350, 'clinicPrice': 900},
          {'_id': '15', 'title': 'Sports Injury Management', 'homePrice': 1250, 'clinicPrice': 850},
        ];
        if (widget.initialServiceTitle != null && widget.initialServiceTitle!.isNotEmpty) {
          final matched = _services.firstWhere(
            (s) => s['title'] != null && s['title'].toString().toLowerCase().contains(widget.initialServiceTitle!.toLowerCase()),
            orElse: () => null,
          );
          if (matched != null) {
            _selectedServiceId = matched['_id'];
          }
        }
        if (_selectedServiceId == null) {
          _selectedServiceId = '1';
        }
        _isLoading = false;
      });
    }
  }

  Future<void> _createBooking() async {
    if (_selectedServiceId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a healthcare service')),
      );
      return;
    }

    if (_selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an appointment time slot')),
      );
      return;
    }

    if (_selectedVisitType == 'home' && _addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter delivery address for home visit')),
      );
      return;
    }

    // Save address for future bookings
    if (_addressController.text.trim().isNotEmpty) {
      final addr = _addressController.text.trim();
      final currentMobile = await _storage.read(key: 'userMobile') ?? '';
      await _storage.write(key: 'patientAddress', value: addr);
      if (currentMobile.isNotEmpty) {
        await _storage.write(key: 'patientAddress_$currentMobile', value: addr);
      }
    }

    setState(() => _isBookingSubmitting = true);

    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final selectedService = _services.firstWhere(
      (s) => s['_id'] == _selectedServiceId,
      orElse: () => {'title': 'Physiotherapy Consultation'},
    );

    try {
      // 1. Create Appointment
      final apptRes = await _apiService.post('/appointments', data: {
        'serviceId': _selectedServiceId,
        'therapistId': _selectedTherapistId,
        'date': dateStr,
        'timeSlot': _selectedSlot,
        'visitType': _selectedVisitType,
        'paymentMethod': _selectedPaymentMethod,
        'address': _selectedVisitType == 'home' ? _addressController.text.trim() : null,
      });

      final apptData = apptRes.data;
      final createdAppt = apptData is Map && apptData['appointment'] != null
          ? apptData['appointment']
          : apptData;
      final apptId = createdAppt is Map
          ? (createdAppt['_id']?.toString() ?? createdAppt['id']?.toString() ?? 'QP-${DateTime.now().millisecondsSinceEpoch}')
          : 'QP-${DateTime.now().millisecondsSinceEpoch}';

      _pendingAppointmentId = apptId;

      // 2. If Online Payment is selected, trigger Razorpay Gateway
      if (_selectedPaymentMethod == 'online') {
        try {
          final paymentRes = await _apiService.post('/payments', data: {
            'appointmentId': apptId,
          });

          final payData = paymentRes.data;
          if (payData is Map) {
            _pendingPaymentId = payData['paymentId']?.toString() ??
                (payData['payment'] is Map ? payData['payment']['_id']?.toString() : null);
            final orderId = payData['orderId']?.toString();
            final amount = payData['amount'] ?? 80000;
            final keyId = payData['keyId']?.toString() ?? 'rzp_test_placeholder';

            final userMobile = await _storage.read(key: 'userMobile') ?? '9876543210';
            final userName = await _storage.read(key: 'patientName') ?? 'Patient';
            final userEmail = await _storage.read(key: 'patientEmail') ?? 'patient@quickphysio24.com';

            var options = {
              'key': keyId,
              'amount': amount,
              'name': "Dr. Bariyar's Physiotherapy",
              'description': 'Booking: ${selectedService['title']}',
              'order_id': orderId,
              'timeout': 300,
              'prefill': {
                'contact': userMobile,
                'email': userEmail,
                'name': userName,
              },
              'theme': {
                'color': '#0F766E',
              }
            };

            _razorpay.open(options);
            return;
          }
        } catch (payErr) {
          print('[Razorpay Error]: $payErr');
        }
      }

      // If Cash on Visit (or direct confirmation):
      if (mounted) {
        setState(() => _isBookingSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Appointment for ${selectedService['title']} Confirmed!'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
        context.go('/appointments');
      }
      return;
    } catch (e) {
      print('Error during booking creation: $e');
    }

    if (mounted) {
      setState(() => _isBookingSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Generate dates for the next 10 days
    final List<DateTime> datesList = List.generate(
      10,
      (index) => DateTime.now().add(Duration(days: index)),
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // Dark Curved Header
          AppHeader(
            title: 'Book Appointment',
            showBack: true,
            onBack: () => context.go('/home'),
          ),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                : SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Service Selector
                        const Text(
                          'Select Service / सेवा चुनें',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.015),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              )
                            ],
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _selectedServiceId,
                              icon: const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF0F766E)),
                              items: _services.map<DropdownMenuItem<String>>((service) {
                                return DropdownMenuItem<String>(
                                  value: service['_id'],
                                  child: Text(
                                    service['title'] ?? 'Service',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                setState(() => _selectedServiceId = val);
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Doctor Selector
                        const Text(
                          'Select Doctor / डॉक्टर चुनें',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: _therapists.map<Widget>((doctor) {
                            final isSelected = _selectedTherapistId == doctor['_id'];
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedTherapistId = doctor['_id']),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  margin: EdgeInsets.only(
                                    right: doctor == _therapists.first ? 6 : 0,
                                    left: doctor == _therapists.last ? 6 : 0,
                                  ),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
                                      width: isSelected ? 2 : 1,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.02),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      )
                                    ],
                                  ),
                                  child: Column(
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Container(
                                          width: 48,
                                          height: 54,
                                          color: const Color(0xFFE0F2FE),
                                          child: Image.asset(
                                          (doctor['image'] != null && (doctor['image'] as String).isNotEmpty)
                                              ? doctor['image']
                                              : ((doctor['_id'] == 'dr_rajnish' || (doctor['name'] ?? '').toString().toLowerCase().contains('rajnish'))
                                                  ? 'assets/images/dr_rajnish_head.png'
                                                  : 'assets/images/dr_priyanka_head.png'),
                                          fit: BoxFit.cover,
                                          alignment: Alignment.topCenter,
                                          errorBuilder: (_, __, ___) => const Icon(Icons.person, color: Color(0xFF0F766E)),
                                        ),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        doctor['name'] ?? '',
                                        textAlign: TextAlign.center,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        doctor['qualification'] ?? 'BPT, MIAP',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),

                        // Visit Type Selector (Clinic Visit vs Home Visit)
                        const Text(
                          'Visit Type / अपॉइंटमेंट प्रकार',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _buildVisitTypeCard(
                                title: 'Clinic Visit',
                                icon: Icons.local_hospital_rounded,
                                isSelected: _selectedVisitType == 'clinic',
                                onTap: () => setState(() => _selectedVisitType = 'clinic'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildVisitTypeCard(
                                title: 'Home Visit',
                                icon: Icons.home_rounded,
                                isSelected: _selectedVisitType == 'home',
                                onTap: () => setState(() => _selectedVisitType = 'home'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Delivery Address for Home Visit
                        if (_selectedVisitType == 'home') ...[
                          const Text(
                            'Delivery / Home Address',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFF0F766E), width: 1.5),
                            ),
                            child: TextField(
                              controller: _addressController,
                              maxLines: 2,
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF0F172A)),
                              decoration: const InputDecoration(
                                hintText: 'Enter complete house/street address...',
                                hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                prefixIcon: Icon(Icons.location_on_rounded, color: Color(0xFF0F766E)),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // Date Selector
                        const Text(
                          'Select Date / दिनांक चुनें',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          height: 84,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: datesList.length,
                            itemBuilder: (context, index) {
                              final date = datesList[index];
                              final isSelected = DateUtils.isSameDay(date, _selectedDate);

                              return GestureDetector(
                                onTap: () => setState(() => _selectedDate = date),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  width: 64,
                                  margin: const EdgeInsets.only(right: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF0F766E) : Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
                                      width: 1.2,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF0F766E).withOpacity(0.3),
                                              blurRadius: 8,
                                              offset: const Offset(0, 4),
                                            )
                                          ]
                                        : null,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        DateFormat('EEE').format(date),
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: isSelected ? Colors.white70 : const Color(0xFF64748B),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        DateFormat('d').format(date),
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: isSelected ? Colors.white : const Color(0xFF0F172A),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Time Slot Selector
                        const Text(
                          'Select Time / समय स्लॉट',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _slots.length,
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 2.2,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                          itemBuilder: (context, index) {
                            final slot = _slots[index];
                            final isSelected = _selectedSlot == slot;

                            return GestureDetector(
                              onTap: () => setState(() => _selectedSlot = slot),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF0F766E) : Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
                                    width: 1.2,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  slot,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                    color: isSelected ? Colors.white : const Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 24),

                        // Payment Method Selection
                        const Text(
                          'Payment Option / भुगतान का माध्यम',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _buildPaymentOptionCard(
                                title: 'Online Payment\n(UPI / Card / NetBanking)',
                                subtitle: 'Instant Confirmation via Razorpay',
                                icon: Icons.payment_rounded,
                                isSelected: _selectedPaymentMethod == 'online',
                                onTap: () => setState(() => _selectedPaymentMethod = 'online'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _buildPaymentOptionCard(
                                title: 'Pay at Clinic\n(Cash / Card on Visit)',
                                subtitle: 'Pay when attending session',
                                icon: Icons.storefront_rounded,
                                isSelected: _selectedPaymentMethod == 'clinic',
                                onTap: () => setState(() => _selectedPaymentMethod = 'clinic'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Fee Breakdown Summary
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _selectedVisitType == 'home' ? 'Home Visit Consultation' : 'Clinic Consultation Fee',
                                    style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    _selectedVisitType == 'home' ? '₹950' : '₹650',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              const Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Platform & Appointment Fee',
                                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    'FREE',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                                  ),
                                ],
                              ),
                              const Divider(height: 20, color: Color(0xFFE2E8F0)),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Total Payable Amount',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                                  ),
                                  Text(
                                    _selectedVisitType == 'home' ? '₹950' : '₹650',
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F766E)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Confirm Booking Button
                        ElevatedButton(
                          onPressed: _isBookingSubmitting ? null : _createBooking,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F766E),
                            foregroundColor: Colors.white,
                            minimumSize: const Size(double.infinity, 54),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: _isBookingSubmitting
                              ? const SizedBox(
                                  height: 22,
                                  width: 22,
                                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                                )
                              : const Text(
                                  'Confirm Appointment / बुक करें',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                        ),
                        const SizedBox(height: 36),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildVisitTypeCard({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F766E) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
            width: 1.2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0F766E).withOpacity(0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? Icons.check_circle_rounded : icon,
              size: 18,
              color: isSelected ? Colors.white : const Color(0xFF64748B),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOptionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F766E).withOpacity(0.06) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.8 : 1.2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                ),
                const Spacer(),
                Icon(
                  isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                  size: 16,
                  color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF0F172A),
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 10,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
