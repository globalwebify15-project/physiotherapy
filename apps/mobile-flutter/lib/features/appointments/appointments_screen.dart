import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../utils/phone_helper.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  final _apiService = ApiService();
  List<dynamic> _appointments = [];
  bool _isLoading = true;
  String _selectedTab = 'on-going'; // 'on-going', 'completed', 'cancelled'

  @override
  void initState() {
    super.initState();
    _fetchAppointments();
  }

  Future<void> _fetchAppointments() async {
    try {
      final response = await _apiService.get('/appointments');
      if (response.statusCode == 200 && response.data['appointments'] != null) {
        setState(() {
          _appointments = List.from(response.data['appointments']);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error fetching appointments: $e');
    }
  }

  List<dynamic> _getFilteredAppointments() {
    return _appointments.where((appt) {
      final status = (appt['status'] as String? ?? 'confirmed').toLowerCase();
      if (_selectedTab == 'on-going') {
        return status == 'confirmed' || status == 'assigned' || status == 'pending' || status == 'in-progress';
      } else if (_selectedTab == 'completed') {
        return status == 'completed';
      } else if (_selectedTab == 'cancelled') {
        return status == 'cancelled';
      }
      return true;
    }).toList();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'confirmed':
      case 'assigned':
        return const Color(0xFF0F766E);
      case 'in-progress':
        return const Color(0xFF2563EB);
      case 'completed':
        return const Color(0xFF10B981);
      case 'cancelled':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF64748B);
    }
  }

  void _showAppointmentDetailsModal(Map<String, dynamic> appt) {
    final status = (appt['status'] as String? ?? 'confirmed').toLowerCase();
    final statusColor = _getStatusColor(status);
    final visitType = appt['visitType'] ?? 'clinic';
    final date = appt['date'] ?? '2026-09-10';
    final timeSlot = appt['timeSlot'] ?? '10:00 AM';
    final service = appt['serviceId'];
    final serviceTitle = service is Map && service['title'] != null ? service['title'] : 'Physiotherapy Consultation';
    final therapist = appt['therapistId'];
    final therapistName = therapist is Map && therapist['name'] != null ? therapist['name'] : 'Dr. Rajnish Bariyar';
    final address = appt['address'] ?? (visitType == 'clinic' ? 'QuickPhysio24.com Clinic, Ashok Nagar Rd No 1, Ranchi' : 'Patient Home Address, Ashok Nagar, Ranchi');
    final apptId = appt['_id']?.toString() ?? 'QP-2491';
    final shortId = apptId.length > 6 ? apptId.substring(apptId.length - 6).toUpperCase() : apptId.toUpperCase();
    final isOngoing = status == 'confirmed' || status == 'assigned' || status == 'pending' || status == 'in-progress';
    final price = appt['price'] ?? 500;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.88,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // Drag handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title & Close
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Appointment Details',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Booking ID: #QP24-$shortId',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Status Badge & Visit Type Banner
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: statusColor.withOpacity(0.25)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                visitType == 'home' ? Icons.home_repair_service_rounded : Icons.local_hospital_rounded,
                                color: statusColor,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                visitType == 'home' ? 'HOME CARE VISIT' : 'CLINIC CONSULTATION',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12,
                                  color: statusColor,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Service Overview Card
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
                          const Text(
                            'SERVICE & TREATMENT',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 0.8),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            serviceTitle,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: const [
                              Icon(Icons.timer_outlined, size: 14, color: Color(0xFF0F766E)),
                              SizedBox(width: 4),
                              Text(
                                '45–60 Mins Dedicated Session • One-on-One Care',
                                style: TextStyle(fontSize: 12, color: Color(0xFF0F766E), fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Treating Specialist
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
                          const Text(
                            'TREATING SPECIALIST',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 0.8),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: const Color(0xFF0F766E).withOpacity(0.12),
                                  border: Border.all(color: const Color(0xFF0F766E), width: 1.5),
                                ),
                                child: ClipOval(
                                  child: Image.asset(
                                    therapistName.contains('Priyanka')
                                        ? 'assets/images/dr_priyanka_head.png'
                                        : 'assets/images/dr_rajnish_head.png',
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(Icons.person, color: Color(0xFF0F766E)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      therapistName,
                                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      therapistName.contains('Priyanka')
                                          ? 'Pediatric & Women\'s Rehab Specialist'
                                          : 'Senior Neuro & Spine Consultant',
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'QuickPhysio24.com Clinical Team',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF0F766E), fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Date, Time & Venue
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
                          const Text(
                            'SCHEDULE & LOCATION',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 0.8),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F766E).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.calendar_today_rounded, color: Color(0xFF0F766E), size: 18),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    date,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                  ),
                                  Text(
                                    timeSlot,
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F766E).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.location_pin, color: Color(0xFF0F766E), size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      visitType == 'home' ? 'Patient Home Location' : 'QuickPhysio24 Clinic Centre',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      address,
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Billing & Payment Summary
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
                          const Text(
                            'PAYMENT & BILLING',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 0.8),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Session Fee', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                              Text('₹$price', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Payment Status', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'Paid / Confirmed',
                                  style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Direct Help Desk & Reschedule Actions
                    if (isOngoing) ...[
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _showRescheduleModal(appt);
                        },
                        icon: const Icon(Icons.edit_calendar_rounded, size: 16),
                        label: const Text('Reschedule This Appointment', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],

                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              Navigator.pop(ctx);
                              PhoneHelper.makePhoneCall(PhoneHelper.helplinePhone, context: context);
                            },
                            icon: const Icon(Icons.call, size: 16),
                            label: const Text('Call Helpline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF0F766E),
                              side: const BorderSide(color: Color(0xFF0F766E)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.pop(ctx);
                              PhoneHelper.openWhatsApp(
                                phone: PhoneHelper.whatsappNumber,
                                message: "Hello QuickPhysio24.com, I am inquiring about my appointment #QP24-$shortId for $serviceTitle.",
                                context: context,
                              );
                            },
                            icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                            label: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showRescheduleModal(Map<String, dynamic> appt) {
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    String selectedSlot = '10:00 AM';
    String selectedReason = 'Schedule Conflict';
    bool isSubmitting = false;

    final List<String> availableSlots = [
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
      '05:00 PM',
      '06:00 PM',
    ];

    final List<String> reasons = [
      'Schedule Conflict',
      'Medical Reason',
      'Personal Emergency',
      'Therapist Requested',
      'Other',
    ];

    final service = appt['serviceId'];
    final serviceTitle = service is Map && service['title'] != null ? service['title'] : 'Physiotherapy Consultation';
    final therapist = appt['therapistId'];
    final therapistName = therapist is Map && therapist['name'] != null ? therapist['name'] : 'Dr. Rajnish Bariyar';
    final currentDate = appt['date'] ?? '2026-08-20';
    final currentSlot = appt['timeSlot'] ?? '11:00 AM';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.88,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                children: [
                  // Drag indicator
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 12, bottom: 8),
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // Header Title
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Reschedule Appointment',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Choose your preferred new date and time slot',
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(modalContext),
                          icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),

                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.all(20),
                      children: [
                        // Current Booking Info Card
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDFA),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFCCFBF1)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F766E).withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.calendar_month_rounded, color: Color(0xFF0F766E), size: 22),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      serviceTitle,
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'With $therapistName',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F766E)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Currently Scheduled: $currentDate • $currentSlot',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // STEP 1: SELECT NEW DATE
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              '1. Select New Date',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            Text(
                              DateFormat('MMMM yyyy').format(selectedDate),
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        SizedBox(
                          height: 80,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: 28,
                            itemBuilder: (context, index) {
                              final day = DateTime.now().add(Duration(days: index));
                              final isSelected = day.year == selectedDate.year &&
                                  day.month == selectedDate.month &&
                                  day.day == selectedDate.day;

                              return GestureDetector(
                                onTap: () {
                                  setModalState(() {
                                    selectedDate = day;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  width: 60,
                                  margin: const EdgeInsets.only(right: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
                                      width: isSelected ? 1.5 : 1,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF0F766E).withOpacity(0.25),
                                              blurRadius: 8,
                                              offset: const Offset(0, 3),
                                            )
                                          ]
                                        : null,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        DateFormat('EEE').format(day).toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: isSelected ? Colors.white70 : const Color(0xFF94A3B8),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${day.day}',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: isSelected ? Colors.white : const Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        DateFormat('MMM').format(day),
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: isSelected ? Colors.white : const Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 22),

                        // STEP 2: SELECT TIME SLOT
                        const Text(
                          '2. Select Time Slot',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),

                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: availableSlots.map((slot) {
                            final isSlotSelected = selectedSlot == slot;
                            return ChoiceChip(
                              label: Text(slot),
                              selected: isSlotSelected,
                              showCheckmark: false,
                              avatar: isSlotSelected
                                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                                  : null,
                              onSelected: (selected) {
                                if (selected) {
                                  setModalState(() {
                                    selectedSlot = slot;
                                  });
                                }
                              },
                              selectedColor: const Color(0xFF0F766E),
                              backgroundColor: const Color(0xFFF1F5F9),
                              labelStyle: TextStyle(
                                color: isSlotSelected ? Colors.white : const Color(0xFF334155),
                                fontSize: 12,
                                fontWeight: isSlotSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 22),

                        // STEP 3: REASON (OPTIONAL)
                        const Text(
                          '3. Reason for Rescheduling',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),

                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: reasons.map((reason) {
                            final isReasonSelected = selectedReason == reason;
                            return ChoiceChip(
                              label: Text(reason),
                              selected: isReasonSelected,
                              showCheckmark: false,
                              avatar: isReasonSelected
                                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                                  : null,
                              onSelected: (selected) {
                                if (selected) {
                                  setModalState(() {
                                    selectedReason = reason;
                                  });
                                }
                              },
                              selectedColor: const Color(0xFFD97706),
                              backgroundColor: const Color(0xFFF8FAFC),
                              labelStyle: TextStyle(
                                color: isReasonSelected ? Colors.white : const Color(0xFF475569),
                                fontSize: 11,
                                fontWeight: isReasonSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),

                        // Policy Notice Box
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7).withOpacity(0.5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFFB45309)),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Free Rescheduling Policy: You can reschedule up to 2 hours prior to your scheduled slot without any extra charges.',
                                  style: TextStyle(fontSize: 11, color: Color(0xFF92400E), height: 1.3),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Bottom Action Bar
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Colors.grey.shade200)),
                    ),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                setModalState(() => isSubmitting = true);

                                final formattedDate = DateFormat('yyyy-MM-dd').format(selectedDate);
                                final apptId = appt['_id'] ?? 'app_1';

                                try {
                                  await _apiService.put(
                                    '/appointments/$apptId',
                                    data: {
                                      'id': apptId,
                                      'date': formattedDate,
                                      'timeSlot': selectedSlot,
                                      'note': 'Rescheduled by patient: $selectedReason',
                                    },
                                  );

                                  // Update local state item
                                  setState(() {
                                    appt['date'] = formattedDate;
                                    appt['timeSlot'] = selectedSlot;
                                  });

                                  if (modalContext.mounted) {
                                    Navigator.pop(modalContext);
                                  }

                                  // Show professional success confirmation dialog
                                  if (mounted) {
                                    _showRescheduleSuccessDialog(
                                      serviceTitle: serviceTitle,
                                      therapistName: therapistName,
                                      newDate: DateFormat('EEE, dd MMMM yyyy').format(selectedDate),
                                      newSlot: selectedSlot,
                                    );
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Failed to reschedule: $e')),
                                    );
                                  }
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text(
                                'Confirm Reschedule',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showRescheduleSuccessDialog({
    required String serviceTitle,
    required String therapistName,
    required String newDate,
    required String newSlot,
  }) {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    color: Color(0xFFD1FAE5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 38),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Appointment Rescheduled!',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your session for $serviceTitle has been successfully moved to:',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDFA),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF99F6E4)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 14, color: Color(0xFF0F766E)),
                          const SizedBox(width: 6),
                          Text(
                            newDate,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F766E)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF0F766E)),
                          const SizedBox(width: 6),
                          Text(
                            newSlot,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F766E)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'A confirmation SMS & WhatsApp reminder will be sent to your mobile.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredAppts = _getFilteredAppointments();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // Dark Curved Header
          const AppHeader(
            title: 'My Appointment',
            showBack: false,
          ),

          Expanded(
            child: Column(
              children: [
                const SizedBox(height: 16),

                // Segmented Pills: On-Going, Completed, Cancelled
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF042F2E),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF0F766E)),
                    ),
                    child: Row(
                      children: [
                        _buildSegmentTab('On-Going', 'on-going'),
                        _buildSegmentTab('Completed', 'completed'),
                        _buildSegmentTab('Cancelled', 'cancelled'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Appointment List or Empty State
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                      : RefreshIndicator(
                          onRefresh: _fetchAppointments,
                          child: filteredAppts.isEmpty
                              ? _buildEmptyState()
                              : ListView.builder(
                                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                                  itemCount: filteredAppts.length,
                                  itemBuilder: (context, index) {
                                    final appt = filteredAppts[index];
                                    final service = appt['serviceId'];
                                    final therapist = appt['therapistId'];
                                    final status = appt['status'] as String? ?? 'confirmed';
                                    final visitType = appt['visitType'] as String? ?? 'clinic';
                                    final date = appt['date'] ?? '2026-08-20';
                                    final timeSlot = appt['timeSlot'] ?? '11:00 AM';
                                    final address = appt['address'] as String?;

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 16),
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: const Color(0xFFF1F5F9)),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(0.02),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          )
                                        ],
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Top Row: Visit Type & Status Badge
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Row(
                                                children: [
                                                  Icon(
                                                    visitType == 'home' ? Icons.home_rounded : Icons.business_rounded,
                                                    size: 16,
                                                    color: const Color(0xFF0F766E),
                                                  ),
                                                  const SizedBox(width: 6),
                                                  Text(
                                                    '${visitType.toUpperCase()} VISIT',
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.w800,
                                                      color: Color(0xFF0F766E),
                                                      letterSpacing: 0.5,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: _getStatusColor(status).withOpacity(0.12),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Text(
                                                  status.toUpperCase(),
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                    color: _getStatusColor(status),
                                                  ),
                                                ),
                                              )
                                            ],
                                          ),
                                          const SizedBox(height: 12),

                                          // Service Title
                                          Text(
                                            service is Map && service['title'] != null ? service['title'] : 'Physiotherapy Consultation',
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0F172A),
                                            ),
                                          ),
                                          const SizedBox(height: 8),

                                          // Date & Time
                                          Row(
                                            children: [
                                              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF64748B)),
                                              const SizedBox(width: 6),
                                              Text(
                                                '$date • $timeSlot',
                                                style: const TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                  color: Color(0xFF475569),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),

                                          // Therapist Details
                                          Row(
                                            children: [
                                              const Icon(Icons.person_outline_rounded, size: 14, color: Color(0xFF64748B)),
                                              const SizedBox(width: 6),
                                              Text(
                                                therapist is Map && therapist['name'] != null ? therapist['name'] : 'Auto Assigned Specialist',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                  color: therapist != null ? const Color(0xFF0F172A) : const Color(0xFFD97706),
                                                ),
                                              ),
                                            ],
                                          ),

                                          // Address if home visit
                                          if (visitType == 'home' && address != null && address.isNotEmpty) ...[
                                            const SizedBox(height: 6),
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF64748B)),
                                                const SizedBox(width: 6),
                                                Expanded(
                                                  child: Text(
                                                    address,
                                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],

                                          const SizedBox(height: 14),
                                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                                          const SizedBox(height: 10),

                                          // Card Action Buttons
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.end,
                                            children: [
                                              if (_selectedTab == 'on-going') ...[
                                                OutlinedButton.icon(
                                                  onPressed: () => _showRescheduleModal(appt),
                                                  icon: const Icon(Icons.edit_calendar_rounded, size: 14),
                                                  label: const Text('Reschedule', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                  style: OutlinedButton.styleFrom(
                                                    foregroundColor: const Color(0xFF0F766E),
                                                    side: const BorderSide(color: Color(0xFF0F766E), width: 1.2),
                                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                ElevatedButton.icon(
                                                  onPressed: () => _showAppointmentDetailsModal(appt),
                                                  icon: const Icon(Icons.receipt_long_rounded, size: 14),
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: const Color(0xFF0F766E),
                                                    foregroundColor: Colors.white,
                                                    elevation: 0,
                                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                  ),
                                                  label: const Text('View Appointment', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                ),
                                              ] else ...[
                                                OutlinedButton.icon(
                                                  onPressed: () => _showAppointmentDetailsModal(appt),
                                                  icon: const Icon(Icons.visibility_outlined, size: 14),
                                                  label: const Text('View Details', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                  style: OutlinedButton.styleFrom(
                                                    foregroundColor: const Color(0xFF0F766E),
                                                    side: const BorderSide(color: Color(0xFF0F766E), width: 1.2),
                                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                ElevatedButton.icon(
                                                  onPressed: () => context.push('/booking'),
                                                  icon: const Icon(Icons.refresh_rounded, size: 14),
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: const Color(0xFF0F766E),
                                                    foregroundColor: Colors.white,
                                                    elevation: 0,
                                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                  ),
                                                  label: Text(
                                                    _selectedTab == 'completed' ? 'Re-Book' : 'Book Again',
                                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }

  Widget _buildSegmentTab(String title, String tabKey) {
    final isSelected = _selectedTab == tabKey;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedTab = tabKey;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFD97706) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white70,
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    String message = 'No On-Going Appointments Found!';
    if (_selectedTab == 'completed') message = 'No Completed Appointments Found!';
    if (_selectedTab == 'cancelled') message = 'No Cancelled Appointments Found!';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.event_busy_rounded, size: 40, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Book an appointment with our expert doctors and physiotherapists.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.push('/booking'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F766E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Book New Session', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
