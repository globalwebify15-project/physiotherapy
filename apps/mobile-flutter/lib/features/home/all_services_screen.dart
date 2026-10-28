import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/service_infographic.dart';

class AllServicesScreen extends StatefulWidget {
  final int initialTabIndex;
  const AllServicesScreen({super.key, this.initialTabIndex = 0});

  @override
  State<AllServicesScreen> createState() => _AllServicesScreenState();
}

class _AllServicesScreenState extends State<AllServicesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final _apiService = ApiService();

  final List<String> _categories = [
    'All',
    'Neurological Rehab',
    'Spine & Joint Care',
    'Pediatric Care',
    "Women's Health",
    'Sports & Ortho'
  ];

  final List<Map<String, dynamic>> _catalogServices = [
    {
      'title': 'Stroke / Paralysis',
      'category': 'Neurological Rehab',
      'description': 'Comprehensive neuro-rehabilitation to restore motor function, rebuild muscle strength, gait re-training, and promote neuroplasticity for stroke recovery.',
      'duration': 60,
      'pricingClinic': 800,
      'pricingHome': 1200,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': "Parkinson's / Alzheimer's",
      'category': 'Neurological Rehab',
      'description': 'Specialized neuro-physiotherapy focusing on posture, balance restoration, tremor management, and functional mobility retention.',
      'duration': 60,
      'pricingClinic': 800,
      'pricingHome': 1200,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': "Facial / Bell's Palsy",
      'category': 'Neurological Rehab',
      'description': 'Targeted neuromuscular facial stimulation, myofascial trigger point release, and facial symmetry exercises for rapid nerve recovery.',
      'duration': 45,
      'pricingClinic': 700,
      'pricingHome': 1000,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Priyanka Bariyar',
    },
    {
      'title': 'Vestibular Dysfunction',
      'category': 'Neurological Rehab',
      'description': 'Vestibular rehabilitation therapy (VRT), canalith repositioning maneuvers, vertigo management, and gaze stabilization exercises.',
      'duration': 45,
      'pricingClinic': 750,
      'pricingHome': 1100,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'Cervical Spondylosis',
      'category': 'Spine & Joint Care',
      'description': 'Advanced neck pain management, cervical decompression, manual cervical traction, posture correction, and scapular strengthening.',
      'duration': 45,
      'pricingClinic': 650,
      'pricingHome': 950,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'Lumbar Spondylosis',
      'category': 'Spine & Joint Care',
      'description': 'Lumbar spine decompression, core stabilization, sciatica relief, disk rehabilitation, and ergonomic training for chronic lower back pain.',
      'duration': 45,
      'pricingClinic': 650,
      'pricingHome': 950,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'OA (Knee Pain)',
      'category': 'Spine & Joint Care',
      'description': 'Osteoarthritis knee pain protocol with joint mobilization, quadriceps/hamstring strengthening, and knee unloading therapies.',
      'duration': 45,
      'pricingClinic': 650,
      'pricingHome': 950,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': "Tennis / Golfer's Elbow",
      'category': 'Sports & Ortho',
      'description': 'Epicondylitis treatment with deep friction massage, ultrasound therapy, eccentric forearm loading, and tendon healing protocols.',
      'duration': 40,
      'pricingClinic': 600,
      'pricingHome': 900,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'Frozen Shoulder',
      'category': 'Spine & Joint Care',
      'description': 'Adhesive capsulitis multi-stage therapy including glenohumeral joint mobilization, capsular stretch, pain relief, and full ROM recovery.',
      'duration': 45,
      'pricingClinic': 650,
      'pricingHome': 950,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'CP Child',
      'category': 'Pediatric Care',
      'description': 'Pediatric cerebral palsy physiotherapy using NDT, muscle tone regulation, postural control, and milestone stimulation.',
      'duration': 60,
      'pricingClinic': 850,
      'pricingHome': 1300,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Priyanka Bariyar',
    },
    {
      'title': 'Developmental Delay',
      'category': 'Pediatric Care',
      'description': 'Early intervention pediatric physiotherapy to assist infants and children in achieving physical and motor developmental milestones.',
      'duration': 60,
      'pricingClinic': 800,
      'pricingHome': 1200,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Priyanka Bariyar',
    },
    {
      'title': 'Autism',
      'category': 'Pediatric Care',
      'description': 'Sensory integration therapy, motor planning exercises, coordination games, and neuromuscular regulation for children with Autism.',
      'duration': 60,
      'pricingClinic': 850,
      'pricingHome': 1300,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Priyanka Bariyar',
    },
    {
      'title': 'Prenatal & Postnatal Physiotherapy',
      'category': "Women's Health",
      'description': 'Pelvic floor strengthening, prenatal spine & pelvic girdle pain relief, safe labor conditioning, and postnatal core recovery.',
      'duration': 50,
      'pricingClinic': 750,
      'pricingHome': 1100,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Priyanka Bariyar',
    },
    {
      'title': 'Knee / Hip Replacement Rehab',
      'category': 'Sports & Ortho',
      'description': 'Structured post-arthroplasty rehabilitation protocol: swelling control, joint mobility, quad activation, and gait correction.',
      'duration': 60,
      'pricingClinic': 900,
      'pricingHome': 1350,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
    {
      'title': 'Sports Injury Management',
      'category': 'Sports & Ortho',
      'description': 'Advanced assessment and rehabilitation of ligament sprains, muscle strains, ACL tears, and athletic conditioning.',
      'duration': 60,
      'pricingClinic': 850,
      'pricingHome': 1250,
      'clinicVisitAvailable': true,
      'homeVisitAvailable': true,
      'doctor': 'Dr. Rajnish Bariyar',
    },
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
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTabIndex);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
    _loadLiveServices();
    _loadLiveDoctors();
  }

  Future<void> _loadLiveDoctors() async {
    try {
      final res = await _apiService.get('/therapists');
      if (res.statusCode == 200 && res.data != null && res.data['therapists'] != null) {
        final List<dynamic> list = res.data['therapists'];
        if (list.isNotEmpty && mounted) {
          final List<Map<String, dynamic>> liveDocs = [];
          for (final item in list) {
            if (item is Map) {
              final id = item['_id']?.toString() ?? item['id']?.toString() ?? '';
              final name = item['name']?.toString() ?? '';
              if (name.isEmpty) continue;

              final qual = item['qualification']?.toString() ?? 'Physiotherapy Specialist';
              final exp = item['experience'] is num ? (item['experience'] as num).toInt() : 5;
              final rating = item['ratingAverage'] is num ? (item['ratingAverage'] as num).toDouble() : 5.0;
              final reviews = item['ratingCount'] is num ? (item['ratingCount'] as num).toInt() : 45;
              final phone = item['mobile']?.toString() ?? '+91 91109 12544';
              final photo = item['profilePhoto']?.toString() ?? '';
              final workingHours = item['workingHours'] is Map
                  ? "${item['workingHours']['start'] ?? '09:00 AM'} – ${item['workingHours']['end'] ?? '07:00 PM'}"
                  : '9:00 AM – 7:00 PM';

              final rawSpecs = item['specialization'];
              final List<String> specs = (rawSpecs is List)
                  ? rawSpecs.map((s) => s.toString()).toList()
                  : ['General Physiotherapy', 'Pain Management'];

              final isRajnish = name.toLowerCase().contains('rajnish');
              final isPriyanka = name.toLowerCase().contains('priyanka');

              String defaultImg = isRajnish
                  ? 'assets/images/dr_rajnish_head.png'
                  : (isPriyanka ? 'assets/images/dr_priyanka_head.png' : '');

              liveDocs.add({
                'id': id,
                '_id': id,
                'name': name,
                'qualification': qual,
                'designation': isRajnish
                    ? "Founder & Chief Physiotherapist of Dr. Bariyar's Physiotherapy & Rehabilitation\nJoint Secretary, IAP (Jharkhand Branch)"
                    : (isPriyanka
                        ? "Co- Founder & Director of Dr. Bariyar's Physiotherapy & Neuro Rehabilitation"
                        : "Consultant Physiotherapist at QuickPhysio24.com"),
                'shortRole': isRajnish
                    ? 'Founder & Chief Physiotherapist'
                    : (isPriyanka ? 'Co-Founder & Director' : 'Consultant Physiotherapist'),
                'experience': '$exp+ Years Experience',
                'hours': workingHours,
                'image': photo.isNotEmpty ? photo : defaultImg,
                'profilePhoto': photo,
                'rating': rating,
                'reviews': reviews,
                'phone': phone,
                'consultationFee': '₹800 (Clinic) / ₹1200 (Home)',
                'specialties': specs,
                'bio': '$name is a qualified physiotherapist specializing in ${(specs.take(4).join(', '))} with over $exp years of clinical experience.',
                'isLive': true,
              });
            }
          }

          if (liveDocs.isNotEmpty) {
            final liveNames = liveDocs.map((d) => d['name'].toString().toLowerCase().trim()).toSet();
            final remainingDefaults = _doctors.where((d) => !liveNames.contains(d['name'].toString().toLowerCase().trim())).toList();

            setState(() {
              _doctors
                ..clear()
                ..addAll([...liveDocs, ...remainingDefaults]);
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading live therapists: $e');
    }
  }

  Future<void> _loadLiveServices() async {
    try {
      final res = await _apiService.get('/services');
      if (res.statusCode == 200 && res.data != null && res.data['services'] != null) {
        final List<dynamic> list = res.data['services'];
        if (list.isNotEmpty && mounted) {
          final List<Map<String, dynamic>> liveMapped = [];
          for (final item in list) {
            if (item is Map) {
              final title = item['title']?.toString() ?? '';
              if (title.isEmpty) continue;
              final cat = item['category']?.toString() ?? 'General Care';
              final desc = item['description']?.toString() ?? 'Comprehensive therapy and care customized to patient requirements.';
              final dur = item['duration'] is num ? (item['duration'] as num).toInt() : 45;
              final pClinic = item['pricingClinic'] is num ? (item['pricingClinic'] as num).toDouble() : 650.0;
              final pHome = item['pricingHome'] is num ? (item['pricingHome'] as num).toDouble() : 950.0;
              final clinicAvail = item['clinicVisitAvailable'] ?? true;
              final homeAvail = item['homeVisitAvailable'] ?? true;
              
              final isPriyanka = cat.toLowerCase().contains('pediatric') || 
                                 cat.toLowerCase().contains('women') || 
                                 title.toLowerCase().contains('bell') ||
                                 title.toLowerCase().contains('facial') ||
                                 title.toLowerCase().contains('cp') ||
                                 title.toLowerCase().contains('autism');
              final doctor = item['doctor']?.toString() ?? (isPriyanka ? 'Dr. Priyanka Bariyar' : 'Dr. Rajnish Bariyar');

              liveMapped.add({
                '_id': item['_id']?.toString(),
                'title': title,
                'category': cat,
                'description': desc,
                'duration': dur,
                'pricingClinic': pClinic,
                'pricingHome': pHome,
                'clinicVisitAvailable': clinicAvail,
                'homeVisitAvailable': homeAvail,
                'doctor': doctor,
                'isLive': true,
              });

              if (!_categories.contains(cat)) {
                _categories.add(cat);
              }
            }
          }

          if (liveMapped.isNotEmpty) {
            final liveTitles = liveMapped.map((s) => s['title'].toString().toLowerCase().trim()).toSet();
            final remainingDefaults = _catalogServices.where((s) => !liveTitles.contains((s['title'] ?? '').toString().toLowerCase().trim())).toList();

            setState(() {
              _catalogServices
                ..clear()
                ..addAll([...liveMapped, ...remainingDefaults]);
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading live services: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredServices {
    return _catalogServices.where((s) {
      final title = (s['title'] as String).toLowerCase();
      final desc = (s['description'] as String).toLowerCase();
      final cat = s['category'] as String;

      final matchesSearch = _searchQuery.isEmpty ||
          title.contains(_searchQuery.toLowerCase()) ||
          desc.contains(_searchQuery.toLowerCase());

      final matchesCategory = _selectedCategory == 'All' || cat == _selectedCategory;

      return matchesSearch && matchesCategory;
    }).toList();
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

      return matchesSearch;
    }).toList();
  }

  Widget _buildDoctorAvatar(Map<String, dynamic> doctor, {double width = 80, double height = 95, double radius = 18}) {
    final isRajnish = (doctor['id'] ?? '') == 'dr_rajnish' || (doctor['name'] ?? '').toString().toLowerCase().contains('rajnish');
    final assetPath = isRajnish ? 'assets/images/dr_rajnish_head.png' : 'assets/images/dr_priyanka_head.png';
    final customImage = (doctor['image'] ?? doctor['profilePhoto']) as String?;

    Widget imageWidget;
    if (customImage != null && customImage.isNotEmpty) {
      if (customImage.startsWith('http')) {
        imageWidget = Image.network(
          customImage,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, __, ___) => Image.asset(assetPath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, size: 40, color: Color(0xFF0F766E))),
        );
      } else if (customImage.startsWith('/doctors') || customImage.startsWith('/uploads')) {
        final fullUrl = 'https://physiotherapy-backend-nextjs.vercel.app$customImage';
        imageWidget = Image.network(
          fullUrl,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, __, ___) => Image.asset(assetPath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, size: 40, color: Color(0xFF0F766E))),
        );
      } else {
        imageWidget = Image.asset(
          customImage,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, __, ___) => Image.asset(assetPath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, size: 40, color: Color(0xFF0F766E))),
        );
      }
    } else {
      imageWidget = Image.asset(
        assetPath,
        fit: BoxFit.cover,
        alignment: Alignment.topCenter,
        errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, size: 40, color: Color(0xFF0F766E)),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Container(
        width: width,
        height: height,
        color: const Color(0xFFE0F2FE),
        child: imageWidget,
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
                    const Text('About Doctor', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 6),
                    Text(
                      doctor['bio'],
                      style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
                    ),
                    const SizedBox(height: 16),
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

  void _showServiceDetails(Map<String, dynamic> service) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  ServiceInfographic(title: service['title'], size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service['title'],
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Specialist: ${service['doctor']}",
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Treatment Description', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
              const SizedBox(height: 6),
              Text(
                service['description'],
                style: const TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Clinic Visit', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('₹${service['pricingClinic']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F766E))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Home Visit', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('₹${service['pricingHome']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F766E))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final servTitle = service['title'] ?? '';
                    final servDoc = service['doctor'] ?? '';
                    final docId = servDoc.toString().toLowerCase().contains('priyanka') ? 'dr_priyanka' : 'dr_rajnish';
                    Navigator.pop(context);
                    context.push(
                      '/booking',
                      extra: {
                        'serviceId': service['_id']?.toString(),
                        'serviceTitle': servTitle,
                        'doctorId': docId,
                        'doctorName': servDoc,
                      },
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F766E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Book Appointment Now', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
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
          
          // Header Tab switcher + Search Bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Tab Switcher: Services vs Doctors
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF042F2E),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF0F766E)),
                  ),
                  child: Row(
                    children: [
                      _buildTopTab('Services (${_catalogServices.length})', 0, Icons.medical_services_rounded),
                      _buildTopTab('Doctors (${_doctors.length})', 1, Icons.people_alt_rounded),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Live Search Bar
                TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: _tabController.index == 0
                        ? 'Search services (e.g. Stroke, Knee, Spine)...'
                        : 'Search doctors (e.g. Dr. Rajnish, Priyanka, Neuro)...',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B)),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18, color: Color(0xFF94A3B8)),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),

                // Category selector (only shown when on Services tab)
                if (_tabController.index == 0) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 34,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, idx) {
                        final cat = _categories[idx];
                        final isSelected = _selectedCategory == cat;
                        return ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          showCheckmark: false,
                          avatar: isSelected
                              ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                              : null,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _selectedCategory = cat);
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
              ],
            ),
          ),

          // Tab Content Area
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // TAB 1: Services List
                _buildServicesList(),

                // TAB 2: Doctors List
                _buildDoctorsList(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }

  Widget _buildTopTab(String title, int index, IconData icon) {
    final isSelected = _tabController.index == index;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          _tabController.animateTo(index);
          setState(() {});
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFD97706) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? Colors.white : Colors.white70,
              ),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.white70,
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServicesList() {
    if (_filteredServices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off_rounded, size: 56, color: Color(0xFF94A3B8)),
            const SizedBox(height: 12),
            const Text('No services found matching your criteria.', style: TextStyle(color: Color(0xFF64748B))),
            TextButton(
              onPressed: () {
                setState(() {
                  _searchQuery = '';
                  _selectedCategory = 'All';
                  _searchController.clear();
                });
              },
              child: const Text('Reset Search & Filters'),
            )
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadLiveServices,
      color: const Color(0xFF0F766E),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _filteredServices.length,
        itemBuilder: (context, index) {
        final item = _filteredServices[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 8,
                offset: const Offset(0, 3),
              )
            ],
          ),
          child: InkWell(
            onTap: () => _showServiceDetails(item),
            borderRadius: BorderRadius.circular(18),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ServiceInfographic(title: item['title'], size: 60),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['title'],
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item['category'],
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F766E),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['description'],
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Clinic: ₹${item['pricingClinic']} | Home: ₹${item['pricingHome']}",
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0D9488),
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF94A3B8)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    ),
  );
}

  Widget _buildDoctorsList() {
    if (_filteredDoctors.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_search_rounded, size: 56, color: Color(0xFF94A3B8)),
            const SizedBox(height: 12),
            const Text('No specialists found matching your search.', style: TextStyle(color: Color(0xFF64748B))),
            TextButton(
              onPressed: () {
                setState(() {
                  _searchQuery = '';
                  _searchController.clear();
                });
              },
              child: const Text('Reset Search'),
            )
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadLiveDoctors,
      color: const Color(0xFF0F766E),
      child: ListView.builder(
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
                    _buildDoctorAvatar(doc, width: 80, height: 95, radius: 18),
                    const SizedBox(width: 14),
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
  );
  }
}
