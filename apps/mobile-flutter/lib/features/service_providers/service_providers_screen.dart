import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';

class ServiceProvidersScreen extends StatefulWidget {
  const ServiceProvidersScreen({super.key});

  @override
  State<ServiceProvidersScreen> createState() => _ServiceProvidersScreenState();
}

class _ServiceProvidersScreenState extends State<ServiceProvidersScreen> {
  final _searchController = TextEditingController();
  
  String _selectedServiceFilter = 'All';
  String _searchQuery = '';

  final List<String> _serviceCategories = [
    'All',
    'Stroke / Paralysis',
    "Parkinson's / Alzheimer's",
    "Facial / Bell's Palsy",
    'Vestibular Dysfunction',
    'Cervical Spondylosis',
    'Lumbar Spondylosis',
    'OA (Knee Pain)',
    "Tennis / Golfer's Elbow",
    'Frozen Shoulder',
    'CP Child',
    'Developmental Delay',
    'Autism',
    'Prenatal & Postnatal',
    'Knee / Hip Replacement',
    'Sports Injury',
  ];

  final List<Map<String, dynamic>> _doctors = [
    {
      'id': 'dr_rajnish',
      'name': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'designation': "Founder & Chief Physiotherapist of Dr. Bariyar's Physiotherapy & Rehabilitation\nJoint Secretary, IAP (Jharkhand Branch)",
      'shortRole': 'Founder & Chief Physiotherapist',
      'experience': '16+ Years Experience',
      'hours': '9:00 AM – 7:00 PM',
      'image': 'assets/images/dr_rajnish_head.png',
      'rating': 5.0,
      'reviews': 240,
      'phone': '+91 98765 43210',
      'consultationFee': '₹800 (Clinic) / ₹1200 (Home)',
      'specialties': [
        'Stroke / Paralysis',
        "Parkinson's / Alzheimer's",
        'Cervical Spondylosis',
        'Lumbar Spondylosis',
        'OA (Knee Pain)',
        'Frozen Shoulder',
        'Knee / Hip Replacement Rehab',
        'Sports Injury Management',
        'Vestibular Dysfunction',
        "Tennis / Golfer's Elbow"
      ],
      'bio': 'Dr. Rajnish Bariyar is a renowned Senior Consultant Physiotherapist and Joint Secretary of IAP (Jharkhand Branch) with over 16 years of expertise in Stroke & Paralysis Rehabilitation, Spine Decompression, Joint Replacement Recovery, and Sports Medicine.'
    },
    {
      'id': 'dr_priyanka',
      'name': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'designation': "Co- Founder & Director of Dr. Bariyar's Physiotherapy & Neuro Rehabilitation",
      'shortRole': 'Co-Founder & Director',
      'experience': '14+ Years Experience',
      'hours': '9:00 AM – 7:00 PM',
      'image': 'assets/images/dr_priyanka_head.png',
      'rating': 4.9,
      'reviews': 195,
      'phone': '+91 98765 43211',
      'consultationFee': '₹800 (Clinic) / ₹1200 (Home)',
      'specialties': [
        'CP Child',
        'Developmental Delay',
        'Autism',
        "Facial / Bell's Palsy",
        'Prenatal & Postnatal Physiotherapy',
        'Neuro Rehabilitation',
        'Pediatric Sensory Integration',
        'Pelvic Floor Therapy'
      ],
      'bio': 'Dr. Priyanka Bariyar is a specialist in Pediatric Neuro-Physiotherapy, Child Developmental Milestones, Sensory Integration for Autism/CP, Facial Nerve Rehabilitation, and Women\'s Prenatal & Postnatal Care.'
    }
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredDoctors {
    return _doctors.where((doc) {
      final name = (doc['name'] as String).toLowerCase();
      final qual = (doc['qualification'] as String).toLowerCase();
      final desig = (doc['designation'] as String).toLowerCase();
      final specs = (doc['specialties'] as List<String>).map((s) => s.toLowerCase()).toList();

      final matchesSearch = _searchQuery.isEmpty ||
          name.contains(_searchQuery.toLowerCase()) ||
          qual.contains(_searchQuery.toLowerCase()) ||
          desig.contains(_searchQuery.toLowerCase()) ||
          specs.any((s) => s.contains(_searchQuery.toLowerCase()));

      final matchesCategory = _selectedServiceFilter == 'All' ||
          specs.any((s) => s.toLowerCase().contains(_selectedServiceFilter.toLowerCase()) || _selectedServiceFilter.toLowerCase().contains(s.toLowerCase()));

      return matchesSearch && matchesCategory;
    }).toList();
  }

  Widget _buildDoctorAvatar(Map<String, dynamic> doctor, {double width = 80, double height = 95, double radius = 18}) {
    final isRajnish = (doctor['id'] ?? '') == 'dr_rajnish' || (doctor['name'] ?? '').toString().toLowerCase().contains('rajnish');
    final assetPath = isRajnish ? 'assets/images/dr_rajnish_head.png' : 'assets/images/dr_priyanka_head.png';
    final customImage = doctor['image'] as String?;

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Container(
        width: width,
        height: height,
        color: const Color(0xFFE0F2FE),
        child: Image.asset(
          (customImage != null && customImage.isNotEmpty) ? customImage : assetPath,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (context, error, stackTrace) {
            return Image.asset(
              assetPath,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
              errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, size: 40, color: Color(0xFF0F766E)),
            );
          },
        ),
      ),
    );
  }

  void _showDoctorDetailsModal(Map<String, dynamic> doctor) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.88,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // Header indicator
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
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Profile Head
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDoctorAvatar(doctor, width: 90, height: 110, radius: 20),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doctor['name'],
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                doctor['qualification'],
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  doctor['experience'],
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                                  const SizedBox(width: 4),
                                  Text(
                                    "${doctor['rating']} (${doctor['reviews']} Reviews)",
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Designation box
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Designation & Roles',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            doctor['designation'],
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A), height: 1.3),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Clinic Hours & Schedule Box
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.access_time_filled_rounded, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Clinic Schedule',
                                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  '9:00 AM – 7:00 PM (Daily)',
                                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Open: 9:00 AM  •  Close: 7:00 PM',
                                  style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // About / Bio
                    const Text('About Doctor', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 6),
                    Text(
                      doctor['bio'],
                      style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
                    ),
                    const SizedBox(height: 16),

                    // Specialties
                    const Text('Specialized Services', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: (doctor['specialties'] as List<String>).map((spec) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDFA),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF99F6E4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF0D9488)),
                              const SizedBox(width: 4),
                              Text(
                                spec,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
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
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.call_rounded, size: 18),
                        label: const Text('Call Clinic'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF0F766E),
                          side: const BorderSide(color: Color(0xFF0F766E)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          final docId = doctor['_id'] ?? (doctor['name']?.toString().toLowerCase().contains('priyanka') == true ? 'dr_priyanka' : 'dr_rajnish');
                          Navigator.pop(context);
                          context.push(
                            '/booking',
                            extra: {
                              'doctorId': docId,
                              'doctorName': doctor['name'] ?? '',
                            },
                          );
                        },
                        icon: const Icon(Icons.calendar_month_rounded, size: 18),
                        label: const Text('Book Appointment'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          const AppHeader(),
          
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Doctor Profiles & Specialists',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          SizedBox(height: 2),
                          const Text(
                            "QuickPhysio24.com",
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        '9 AM – 7 PM',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Search Box
                TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search doctors, conditions, services...',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B)),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Service Horizontal Categories
                SizedBox(
                  height: 34,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _serviceCategories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final cat = _serviceCategories[idx];
                      final isSelected = _selectedServiceFilter == cat;
                      return ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        showCheckmark: false,
                        avatar: isSelected
                            ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                            : null,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedServiceFilter = cat);
                          }
                        },
                        selectedColor: const Color(0xFF0F766E),
                        backgroundColor: const Color(0xFFF1F5F9),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : const Color(0xFF334155),
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Doctor List
          Expanded(
            child: _filteredDoctors.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.person_search_rounded, size: 56, color: Color(0xFF94A3B8)),
                        const SizedBox(height: 12),
                        const Text('No specialists found matching your search', style: TextStyle(color: Color(0xFF64748B))),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _searchQuery = '';
                              _selectedServiceFilter = 'All';
                              _searchController.clear();
                            });
                          },
                          child: const Text('Reset Filters'),
                        )
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredDoctors.length,
                    itemBuilder: (context, index) {
                      final doc = _filteredDoctors[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ],
                        ),
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Doctor Image
                                  _buildDoctorAvatar(doc, width: 80, height: 95, radius: 18),
                                  const SizedBox(width: 14),

                                  // Details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                doc['name'],
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Color(0xFF0F172A),
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFFEF3C7),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Row(
                                                children: [
                                                  const Icon(Icons.star_rounded, size: 14, color: Color(0xFFD97706)),
                                                  const SizedBox(width: 2),
                                                  Text(
                                                    "${doc['rating']}",
                                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                                                  ),
                                                ],
                                              ),
                                            )
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          doc['qualification'],
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          doc['shortRole'],
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            const Icon(Icons.access_time_rounded, size: 13, color: Color(0xFF0D9488)),
                                            const SizedBox(width: 4),
                                            Text(
                                              doc['hours'],
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Specialties tags
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              color: const Color(0xFFF8FAFC),
                              child: Row(
                                children: [
                                  const Icon(Icons.medical_information_rounded, size: 14, color: Color(0xFF64748B)),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      (doc['specialties'] as List<String>).take(3).join(' • '),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Action buttons
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () => _showDoctorDetailsModal(doc),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFF0F766E),
                                        side: const BorderSide(color: Color(0xFF0F766E)),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        padding: const EdgeInsets.symmetric(vertical: 10),
                                      ),
                                      child: const Text('View Profile', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        final docId = doc['_id'] ?? (doc['name']?.toString().toLowerCase().contains('priyanka') == true ? 'dr_priyanka' : 'dr_rajnish');
                                        context.push(
                                          '/booking',
                                          extra: {
                                            'doctorId': docId,
                                            'doctorName': doc['name'] ?? '',
                                          },
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F766E),
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        padding: const EdgeInsets.symmetric(vertical: 10),
                                        elevation: 0,
                                      ),
                                      child: const Text('Book Visit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }
}
