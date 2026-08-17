import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _apiService = ApiService();
  
  List<dynamic> _services = [];
  List<dynamic> _therapists = [];
  List<String> _slots = [];

  String? _selectedServiceId;
  String? _selectedTherapistId;
  String _selectedVisitType = 'clinic';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedSlot;
  final _addressController = TextEditingController();

  bool _isLoading = true;
  bool _isSlotsLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchBookingDetails();
  }

  Future<void> _fetchBookingDetails() async {
    try {
      final servicesRes = await _apiService.get('/services');
      final therapistsRes = await _apiService.get('/therapists');
      
      setState(() {
        _services = servicesRes.data['services'] ?? [];
        _therapists = therapistsRes.data['therapists'] ?? [];
        if (_services.isNotEmpty) {
          _selectedServiceId = _services[0]['_id'];
        }
        _isLoading = false;
      });
      _fetchSlots();
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error fetching details: $e');
    }
  }

  Future<void> _fetchSlots() async {
    setState(() {
      _isSlotsLoading = true;
      _slots.clear();
      _selectedSlot = null;
    });

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      String path = '/appointments/slots?date=$dateStr';
      if (_selectedTherapistId != null) {
        path += '&therapistId=$_selectedTherapistId';
      }

      final response = await _apiService.get(path);
      if (response.statusCode == 200) {
        setState(() {
          _slots = List<String>.from(response.data['slots']);
          _isSlotsLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isSlotsLoading = false);
      print('Error fetching slots: $e');
    }
  }

  Future<void> _createBooking() async {
    if (_selectedServiceId == null || _selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select all required fields')),
      );
      return;
    }

    if (_selectedVisitType == 'home' && _addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Address is required for home visits')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      
      // 1. Create Appointment
      final apptRes = await _apiService.post('/appointments', data: {
        'serviceId': _selectedServiceId,
        'therapistId': _selectedTherapistId,
        'date': dateStr,
        'timeSlot': _selectedSlot,
        'visitType': _selectedVisitType,
        'address': _selectedVisitType == 'home' ? _addressController.text : null,
      });

      if (apptRes.statusCode == 201) {
        final appointmentId = apptRes.data['appointment']['_id'];

        // 2. Initiate Payment Order
        final paymentRes = await _apiService.post('/payments', data: {
          'appointmentId': appointmentId,
        });

        if (paymentRes.statusCode == 200) {
          final orderId = paymentRes.data['orderId'];

          // 3. Verify Payment sandbox trigger
          final verifyRes = await _apiService.post('/payments/verify', data: {
            'razorpayOrderId': orderId,
            'razorpayPaymentId': 'pay_sandbox_${DateTime.now().millisecondsSinceEpoch}',
            'razorpaySignature': 'signature_sandbox',
          });

          if (verifyRes.statusCode == 200) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Booking Confirmed & Paid Successfully!')),
              );
              context.go('/appointments');
            }
            return;
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Booking failed: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Book Appointment', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Select Service Dropdown
                  const Text('Select Service', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _selectedServiceId,
                    items: _services.map<DropdownMenuItem<String>>((s) {
                      return DropdownMenuItem<String>(
                        value: s['_id'],
                        child: Text(s['title']),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() => _selectedServiceId = val);
                    },
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Visit Type Selector (Home / Clinic)
                  const Text('Visit Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: Container(
                            alignment: Alignment.center,
                            height: 40,
                            child: const Text('Clinic Visit', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                          selected: _selectedVisitType == 'clinic',
                          selectedColor: const Color(0xFF0F766E),
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(color: _selectedVisitType == 'clinic' ? Colors.white : const Color(0xFF0F172A)),
                          backgroundColor: const Color(0xFFF1F5F9),
                          onSelected: (val) {
                            if (val) setState(() => _selectedVisitType = 'clinic');
                          },
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ChoiceChip(
                          label: Container(
                            alignment: Alignment.center,
                            height: 40,
                            child: const Text('Home Visit', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                          selected: _selectedVisitType == 'home',
                          selectedColor: const Color(0xFF0F766E),
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(color: _selectedVisitType == 'home' ? Colors.white : const Color(0xFF0F172A)),
                          backgroundColor: const Color(0xFFF1F5F9),
                          onSelected: (val) {
                            if (val) setState(() => _selectedVisitType = 'home');
                          },
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Home visit address field
                  if (_selectedVisitType == 'home') ...[
                    const Text('Delivery Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _addressController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        hintText: 'Flat number, building name, street address...',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Horizontal Date Picker (Screen 4 Layout)
                  const Text('Select Date', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: datesList.length,
                      itemBuilder: (context, index) {
                        final date = datesList[index];
                        final isSelected = DateFormat('yyyy-MM-dd').format(date) == DateFormat('yyyy-MM-dd').format(_selectedDate);
                        
                        return GestureDetector(
                          onTap: () {
                            setState(() => _selectedDate = date);
                            _fetchSlots();
                          },
                          child: Container(
                            width: 64,
                            margin: const EdgeInsets.only(right: 12),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  DateFormat('E').format(date),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected ? Colors.white70 : const Color(0xFF94A3B8),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  DateFormat('d').format(date),
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
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
                  const SizedBox(height: 28),

                  // Select Time Grid (Screen 4 Layout)
                  const Text('Select Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),
                  if (_isSlotsLoading)
                    const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator()))
                  else if (_slots.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Text('No slots available for this day.', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    )
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 2.3,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                      ),
                      itemCount: _slots.length,
                      itemBuilder: (context, index) {
                        final slot = _slots[index];
                        final isSelected = _selectedSlot == slot;
                        return ChoiceChip(
                          label: Container(
                            alignment: Alignment.center,
                            child: Text(slot, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          ),
                          selected: isSelected,
                          selectedColor: const Color(0xFF0F766E),
                          labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF0F172A)),
                          backgroundColor: const Color(0xFFF8FAFC),
                          onSelected: (val) {
                            if (val) setState(() => _selectedSlot = slot);
                          },
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0)),
                          ),
                        );
                      },
                    ),
                  const SizedBox(height: 28),

                  // Select Physiotherapist List (Screen 4 Layout)
                  const Text('Select Physiotherapist', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _therapists.length + 1,
                    itemBuilder: (context, index) {
                      // Option 1: Auto Assign
                      if (index == 0) {
                        final isSelected = _selectedTherapistId == null;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _selectedTherapistId = null);
                            _fetchSlots();
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF22C55E) : const Color(0xFFE2E8F0),
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: isSelected ? const Color(0xFF22C55E).withOpacity(0.1) : const Color(0xFFF1F5F9),
                                  child: Icon(Icons.shuffle_rounded, color: isSelected ? const Color(0xFF22C55E) : const Color(0xFF94A3B8)),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: const [
                                      Text(
                                        'Any Therapist (Auto Assign)',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                      ),
                                      SizedBox(height: 2),
                                      Text('We will assign the best therapist available.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                    ],
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 20),
                              ],
                            ),
                          ),
                        );
                      }

                      // Option 2: Live Therapist Cards
                      final therapist = _therapists[index - 1];
                      final isSelected = _selectedTherapistId == therapist['_id'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedTherapistId = therapist['_id']);
                          _fetchSlots();
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF22C55E) : const Color(0xFFE2E8F0),
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: const Color(0xFFEEF2FF),
                                child: Text(
                                  therapist['name'].isNotEmpty ? therapist['name'][0] : 'T',
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      therapist['name'],
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      (therapist['specialization'] is List && (therapist['specialization'] as List).isNotEmpty)
                                          ? (therapist['specialization'] as List).join(', ')
                                          : 'Physiotherapist',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${therapist['experience'] ?? '5'} Years Experience',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                              if (isSelected)
                                const Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 20),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 36),

                  ElevatedButton(
                    onPressed: _createBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E), // Dark teal premium color
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Confirm Appointment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
