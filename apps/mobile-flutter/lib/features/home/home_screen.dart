import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/service_infographic.dart';
import '../../widgets/promo_dialog.dart';
import '../../widgets/faq_section.dart';
import '../../utils/phone_helper.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;

  // Dynamic Dashboard Data
  String _patientName = 'Amarjeet';
  String _locationAddress = 'Near, Ashok Nagar Rd No 1, opposite O...';
  List<dynamic> _appointments = [];
  List<dynamic> _services = [];

  // Interactive Carousel State
  final PageController _bannerController = PageController();
  int _activeBannerIndex = 0;
  Timer? _bannerTimer;

  // Services list for quick grid with custom infographics
  final List<Map<String, dynamic>> _quickServices = [
    {
      'title': 'Stroke / Paralysis',
      'category': 'Neurological Rehab',
      'clinicPrice': 800,
      'homePrice': 1200,
    },
    {
      'title': 'Cervical Spondylosis',
      'category': 'Spine & Neck Care',
      'clinicPrice': 650,
      'homePrice': 950,
    },
    {
      'title': 'Lumbar Spondylosis',
      'category': 'Spine & Back Care',
      'clinicPrice': 650,
      'homePrice': 950,
    },
    {
      'title': 'OA (Knee Pain)',
      'category': 'Joint Care',
      'clinicPrice': 650,
      'homePrice': 950,
    },
    {
      'title': 'CP Child',
      'category': 'Pediatric Rehab',
      'clinicPrice': 850,
      'homePrice': 1300,
    },
    {
      'title': 'Frozen Shoulder',
      'category': 'Joint & Mobility',
      'clinicPrice': 650,
      'homePrice': 950,
    },
    {
      'title': 'Sports Injury Management',
      'category': 'Sports Physio',
      'clinicPrice': 850,
      'homePrice': 1250,
    },
    {
      'title': "Parkinson's / Alzheimer's",
      'category': 'Neuro Rehab',
      'clinicPrice': 800,
      'homePrice': 1200,
    },
    {
      'title': "Facial / Bell's Palsy",
      'category': 'Neuro-Muscular',
      'clinicPrice': 700,
      'homePrice': 1000,
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
    _startBannerTimer();
  }

  void _startBannerTimer() {
    _bannerTimer?.cancel();
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_bannerController.hasClients) return;
      final nextIndex = (_activeBannerIndex + 1) % 4;
      _bannerController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  Future<void> _fetchDashboardData() async {
    final storage = const FlutterSecureStorage();
    final cachedName = await storage.read(key: 'patientName');
    final cachedAddr = await storage.read(key: 'patientAddress');

    if (mounted) {
      setState(() {
        if (cachedName != null && cachedName.isNotEmpty) _patientName = cachedName;
        if (cachedAddr != null && cachedAddr.isNotEmpty) _locationAddress = cachedAddr;
      });
    }

    try {
      // 1. Fetch Patient details
      try {
        final patientRes = await _apiService.get('/patients');
        if (patientRes.statusCode == 200 && patientRes.data['patient'] != null) {
          final fetchedName = patientRes.data['patient']['name'];
          final fetchedAddress = patientRes.data['patient']['address'];

          if (fetchedName != null) await storage.write(key: 'patientName', value: fetchedName);
          if (fetchedAddress != null) await storage.write(key: 'patientAddress', value: fetchedAddress);

          if (mounted) {
            setState(() {
              if (fetchedName != null) _patientName = fetchedName;
              if (fetchedAddress != null) _locationAddress = fetchedAddress;
            });
          }
        }
      } catch (e) {
        // Fallback to storage
      }

      // 2. Fetch Appointments & Services
      final apptsRes = await _apiService.get('/appointments');
      final servicesRes = await _apiService.get('/services');

      setState(() {
        _appointments = apptsRes.data['appointments'] ?? [];
        _services = servicesRes.data['services'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  static final Map<String, Map<String, dynamic>> _serviceDetailsMap = {
    'Stroke / Paralysis': {
      'title': 'Stroke / Paralysis',
      'category': 'Neurological Rehab',
      'description': 'Comprehensive neuro-rehabilitation to restore motor function, rebuild muscle strength, gait re-training, and promote neuroplasticity for stroke recovery.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 800,
      'homePrice': 1200,
      'benefits': ['Motor Control Restoration', 'Gait & Balance Re-training', 'Spasticity & Tone Management'],
    },
    'Cervical Spondylosis': {
      'title': 'Cervical Spondylosis',
      'category': 'Spine & Joint Care',
      'description': 'Advanced neck pain management, cervical decompression, manual cervical traction, posture correction, and scapular strengthening.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 650,
      'homePrice': 950,
      'benefits': ['Nerve Decompression', 'Radiating Neck & Arm Pain Relief', 'Posture & Ergonomic Correction'],
    },
    'Lumbar Spondylosis': {
      'title': 'Lumbar Spondylosis',
      'category': 'Spine & Joint Care',
      'description': 'Lumbar spine decompression, core stabilization, sciatica relief, disk rehabilitation, and ergonomic training for chronic lower back pain.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 650,
      'homePrice': 950,
      'benefits': ['Sciatica Nerve Relief', 'Core Stability Restoration', 'Spinal Disk Decompression'],
    },
    'OA (Knee Pain)': {
      'title': 'OA (Knee Pain)',
      'category': 'Spine & Joint Care',
      'description': 'Osteoarthritis knee pain protocol with joint mobilization, quadriceps/hamstring strengthening, and knee unloading therapies.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 650,
      'homePrice': 950,
      'benefits': ['Cartilage Offloading', 'Joint Mobility Recovery', 'Pain-Free Walking'],
    },
    'CP Child': {
      'title': 'CP Child',
      'category': 'Pediatric Care',
      'description': 'Pediatric cerebral palsy physiotherapy using NDT (Neuro-Developmental Treatment), muscle tone regulation, postural control, and milestone stimulation.',
      'doctor': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 850,
      'homePrice': 1300,
      'benefits': ['NDT Pediatric Therapy', 'Tone & Posture Regulation', 'Milestone Stimulation'],
    },
    'Frozen Shoulder': {
      'title': 'Frozen Shoulder',
      'category': 'Spine & Joint Care',
      'description': 'Adhesive capsulitis multi-stage therapy including glenohumeral joint mobilization, capsular stretch, pain relief, and full ROM recovery.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 650,
      'homePrice': 950,
      'benefits': ['Full ROM Restoration', 'Joint Capsule Mobilization', 'Night Pain Relief'],
    },
    'Sports Injury Management': {
      'title': 'Sports Injury Management',
      'category': 'Sports & Ortho',
      'description': 'Advanced assessment and rehabilitation of ligament sprains, muscle strains, ACL tears, and athletic conditioning.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 850,
      'homePrice': 1250,
      'benefits': ['Ligament & ACL Rehab', 'Return-to-Sport Conditioning', 'Agility & Power Training'],
    },
    "Parkinson's / Alzheimer's": {
      'title': "Parkinson's / Alzheimer's",
      'category': 'Neurological Rehab',
      'description': 'Specialized neuro-physiotherapy focusing on posture, balance restoration, tremor management, and functional mobility retention.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 800,
      'homePrice': 1200,
      'benefits': ['Tremor & Balance Control', 'Fall Prevention Strategies', 'Functional Independence'],
    },
    "Facial / Bell's Palsy": {
      'title': "Facial / Bell's Palsy",
      'category': 'Neurological Rehab',
      'description': 'Targeted neuromuscular facial stimulation, myofascial trigger point release, and facial symmetry exercises for rapid nerve recovery.',
      'doctor': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 700,
      'homePrice': 1000,
      'benefits': ['Neuromuscular Stimulation', 'Facial Symmetry Recovery', 'Eye & Mouth Closure Rehab'],
    },
    'Vestibular Dysfunction': {
      'title': 'Vestibular Dysfunction',
      'category': 'Neurological Rehab',
      'description': 'Vestibular rehabilitation therapy (VRT), canalith repositioning maneuvers, vertigo management, and gaze stabilization exercises.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 750,
      'homePrice': 1100,
      'benefits': ['Canalith Repositioning', 'Vertigo & Dizziness Relief', 'Gaze Stabilization'],
    },
    "Tennis / Golfer's Elbow": {
      'title': "Tennis / Golfer's Elbow",
      'category': 'Sports & Ortho',
      'description': 'Epicondylitis treatment with deep friction massage, ultrasound therapy, eccentric forearm loading, and tendon healing protocols.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 600,
      'homePrice': 900,
      'benefits': ['Tendon Healing Protocol', 'Grip Strength Restoration', 'Pain-Free Forearm Movement'],
    },
    'Developmental Delay': {
      'title': 'Developmental Delay',
      'category': 'Pediatric Care',
      'description': 'Early intervention pediatric physiotherapy to assist infants and children in achieving physical and motor developmental milestones.',
      'doctor': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 800,
      'homePrice': 1200,
      'benefits': ['Milestone Acceleration', 'Motor Planning Exercises', 'Early Intervention Care'],
    },
    'Autism': {
      'title': 'Autism',
      'category': 'Pediatric Care',
      'description': 'Sensory integration therapy, motor planning exercises, coordination games, and neuromuscular regulation for children with Autism.',
      'doctor': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 850,
      'homePrice': 1300,
      'benefits': ['Sensory Integration Therapy', 'Motor Planning Games', 'Behavioral Coordination'],
    },
    'Prenatal & Postnatal Physiotherapy': {
      'title': 'Prenatal & Postnatal Physiotherapy',
      'category': "Women's Health",
      'description': 'Pelvic floor strengthening, prenatal spine & pelvic girdle pain relief, safe labor conditioning, and postnatal core recovery.',
      'doctor': 'Dr. Priyanka Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 750,
      'homePrice': 1100,
      'benefits': ['Pelvic Floor Conditioning', 'Back & Pelvic Pain Relief', 'Postnatal Diastasis Rehab'],
    },
    'Knee / Hip Replacement Rehab': {
      'title': 'Knee / Hip Replacement Rehab',
      'category': 'Sports & Ortho',
      'description': 'Structured post-arthroplasty rehabilitation protocol: swelling control, joint mobility, quad activation, and gait correction.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': 900,
      'homePrice': 1350,
      'benefits': ['Post-Op Joint Mobilization', 'Quad & Hip Activation', 'Independent Gait Recovery'],
    },
  };

  void _showServiceBottomSheet(Map<String, dynamic> service) {
    final title = service['title'] ?? 'Healthcare Service';
    final details = _serviceDetailsMap[title] ?? {
      'title': title,
      'category': service['category'] ?? 'Physiotherapy',
      'description': 'Comprehensive consultation, physical evaluation, and customized therapeutic treatment at our clinic or home.',
      'doctor': 'Dr. Rajnish Bariyar',
      'qualification': 'BPT, MIAP, JSCPT',
      'clinicPrice': service['clinicPrice'] ?? 800,
      'homePrice': service['homePrice'] ?? 1200,
      'benefits': ['Targeted Pain Relief', 'Functional Mobility Recovery', 'Certified Specialist Care'],
    };

    final category = details['category'] as String;
    final description = details['description'] as String;
    final doctor = details['doctor'] as String;
    final qualification = (details['qualification'] ?? 'BPT, MIAP, JSCPT') as String;
    final clinicPrice = details['clinicPrice'];
    final homePrice = details['homePrice'];
    final benefits = (details['benefits'] as List<String>?) ?? [];

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
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Header Infographic + Title + Doctor
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ServiceInfographic(title: title, size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDFA),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF99F6E4)),
                          ),
                          child: Text(
                            category.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F766E),
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          "Specialist: $doctor ($qualification)",
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0F766E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Treatment Description
              const Text(
                'Treatment Description',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 6),
              Text(
                description,
                style: const TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.45),
              ),
              const SizedBox(height: 16),

              // Key Benefits
              if (benefits.isNotEmpty) ...[
                const Text(
                  'Key Benefits & Highlights',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 8),
                ...benefits.map((benefit) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Color(0xFFECFDF5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_rounded, size: 14, color: Color(0xFF059669)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          benefit,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                        ),
                      ),
                    ],
                  ),
                )),
                const SizedBox(height: 14),
              ],

              // Pricing Cards
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.local_hospital_rounded, size: 14, color: Color(0xFF64748B)),
                              SizedBox(width: 4),
                              Text('Clinic Visit', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('₹$clinicPrice', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F766E))),
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
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.home_rounded, size: 14, color: Color(0xFF64748B)),
                              SizedBox(width: 4),
                              Text('Home Visit', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('₹$homePrice', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F766E))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Action Button
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
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Book Appointment Now', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 6),
            ],
          ),
        );
      },
    );
  }

  void _showSupportDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: Color(0xFFFEF3C7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.support_agent_rounded, size: 36, color: Color(0xFFD97706)),
              ),
              const SizedBox(height: 14),
              const Text(
                '24/7 Patient Care & Support',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 6),
              const Text(
                'Need immediate assistance, ambulance support, or therapist booking help?',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        PhoneHelper.makePhoneCall(PhoneHelper.helplinePhone, context: context);
                      },
                      icon: const Icon(Icons.call_rounded, size: 18),
                      label: const Text('Call Support'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F766E),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        PhoneHelper.openWhatsApp(context: context);
                      },
                      icon: const Icon(Icons.chat_rounded, size: 18),
                      label: const Text('Chat Support'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final upcomingAppt = _appointments
        .where((a) =>
            a['status'] == 'confirmed' ||
            a['status'] == 'assigned' ||
            a['status'] == 'pending')
        .firstOrNull;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // 1. Dark Curved Header
          AppHeader(
            isDashboard: true,
            userName: _patientName,
            locationAddress: _locationAddress,
            onSearchTap: () => context.push('/all_services'),
            onNotificationTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('No new notifications')),
              );
            },
          ),

          // 2. Main Scrollable Dashboard Content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                : RefreshIndicator(
                    onRefresh: _fetchDashboardData,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Promo / Banner Slider matching Reference Design (6 Creative Cards)
                          SizedBox(
                            height: 215,
                            child: PageView(
                              controller: _bannerController,
                              onPageChanged: (idx) => setState(() => _activeBannerIndex = idx),
                              children: [
                                // Card 1: Say Goodbye to Pain
                                _buildModernBannerCard(
                                  numberTag: '1.',
                                  pageTag: '1/4',
                                  title: 'Say Goodbye\nto Pain',
                                  subtitle: "Back, neck, knee or shoulder —\nwe've got you covered.",
                                  ctaText: 'Learn More →',
                                  ctaColor: const Color(0xFF0F766E),
                                  ctaTextColor: Colors.white,
                                  gradientColors: const [Color(0xFFFFFDF5), Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                                  borderColor: const Color(0xFFFCD34D).withOpacity(0.8),
                                  titleColor: const Color(0xFF0F172A),
                                  subtitleColor: const Color(0xFF475569),
                                  visual: _buildSpineGlowVisual(),
                                  bottomChips: const [
                                    {'icon': Icons.accessibility_new_rounded, 'label': 'Back Pain'},
                                    {'icon': Icons.bolt_rounded, 'label': 'Neck Pain'},
                                    {'icon': Icons.adjust_rounded, 'label': 'Joint Pain'},
                                  ],
                                  onTap: () => context.push('/all_services'),
                                ),

                                // Card 2: Recover Faster
                                _buildModernBannerCard(
                                  numberTag: '2.',
                                  pageTag: '2/4',
                                  title: 'Recover\nFaster',
                                  subtitle: 'Post-surgery rehab &\nsports physiotherapy.',
                                  ctaText: 'Get Started →',
                                  ctaColor: const Color(0xFF0284C7),
                                  ctaTextColor: Colors.white,
                                  gradientColors: const [Color(0xFFF0F9FF), Color(0xFFE0F2FE), Color(0xFFBAE6FD)],
                                  borderColor: const Color(0xFF38BDF8).withOpacity(0.8),
                                  titleColor: const Color(0xFF0F172A),
                                  subtitleColor: const Color(0xFF334155),
                                  visual: _buildRunnerVisual(),
                                  bottomChips: const [
                                    {'icon': Icons.directions_run_rounded, 'label': 'Rehab'},
                                    {'icon': Icons.sports_kabaddi_rounded, 'label': 'Sports Injury'},
                                    {'icon': Icons.speed_rounded, 'label': 'Performance'},
                                  ],
                                  onTap: () => context.push('/booking'),
                                ),

                                // Card 3: Better Mobility Better Life
                                _buildModernBannerCard(
                                  numberTag: '3.',
                                  pageTag: '3/4',
                                  title: 'Better Mobility\nBetter Life',
                                  subtitle: 'Improve flexibility,\nstrength and balance.',
                                  ctaText: 'Start Your Journey →',
                                  ctaColor: const Color(0xFF6B21A8),
                                  ctaTextColor: Colors.white,
                                  gradientColors: const [Color(0xFFFAF5FF), Color(0xFFF3E8FF), Color(0xFFE9D5FF)],
                                  borderColor: const Color(0xFFC084FC).withOpacity(0.8),
                                  titleColor: const Color(0xFF3B0764),
                                  subtitleColor: const Color(0xFF4C1D95),
                                  visual: _buildYogaFlexibilityVisual(),
                                  bottomChips: const [
                                    {'icon': Icons.self_improvement_rounded, 'label': 'Flexibility'},
                                    {'icon': Icons.balance_rounded, 'label': 'Balance'},
                                    {'icon': Icons.spa_rounded, 'label': 'Wellness'},
                                  ],
                                  onTap: () => context.push('/all_services'),
                                ),

                                // Card 4: Your Journey to a Healthier You
                                _buildModernBannerCard(
                                  numberTag: '4.',
                                  pageTag: '4/4',
                                  title: 'Your Journey\nto a Healthier You',
                                  subtitle: 'Professional care for a\nstronger, healthier you.',
                                  ctaText: 'Start Today →',
                                  ctaColor: const Color(0xFF0F766E),
                                  ctaTextColor: Colors.white,
                                  gradientColors: const [Color(0xFFFFF7ED), Color(0xFFFFEDD5), Color(0xFFFED7AA)],
                                  borderColor: const Color(0xFFFB923C).withOpacity(0.8),
                                  titleColor: const Color(0xFF431407),
                                  subtitleColor: const Color(0xFF7C2D12),
                                  visual: _buildSunriseSilhouetteVisual(),
                                  bottomChips: const [
                                    {'icon': Icons.hiking_rounded, 'label': 'Active Life'},
                                    {'icon': Icons.accessibility_rounded, 'label': 'Better Posture'},
                                    {'icon': Icons.sentiment_very_satisfied_rounded, 'label': 'Happier You'},
                                  ],
                                  onTap: () => context.push('/service_providers'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Dot Indicators (4 Items)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(4, (index) {
                              final isSelected = _activeBannerIndex == index;
                              return AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: const EdgeInsets.symmetric(horizontal: 3),
                                height: 6,
                                width: isSelected ? 20 : 6,
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 22),

                          // "What service are you looking for?  See All >"
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'What service are you looking for?',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => context.push('/all_services'),
                                child: Row(
                                  children: const [
                                    Text(
                                      'See All',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F766E),
                                      ),
                                    ),
                                    Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF0F766E)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Service Grid with Infographics
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: 6,
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 14,
                              childAspectRatio: 0.78,
                            ),
                            itemBuilder: (context, index) {
                              final service = _quickServices[index];
                              final title = service['title'] as String;

                              return GestureDetector(
                                onTap: () => _showServiceBottomSheet(service),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(
                                      color: const Color(0xFFFDE68A),
                                      width: 1.2,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.02),
                                        blurRadius: 6,
                                        offset: const Offset(0, 3),
                                      )
                                    ],
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Center(
                                          child: ServiceInfographic(
                                            title: title,
                                            size: 56,
                                            isCompact: true,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        title,
                                        maxLines: 2,
                                        textAlign: TextAlign.center,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF1E293B),
                                          height: 1.15,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 24),

                          // Quick Action Shortcuts
                          Row(
                            children: [
                              Expanded(
                                child: _buildActionShortcut(
                                  icon: Icons.calendar_month_rounded,
                                  title: 'Book Session',
                                  color: const Color(0xFF2563EB),
                                  onTap: () => context.push('/booking'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _buildActionShortcut(
                                  icon: Icons.phone_in_talk_rounded,
                                  title: 'Call Doctor',
                                  color: const Color(0xFF0F766E),
                                  onTap: () => PhoneHelper.showDoctorCallModal(context),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _buildActionShortcut(
                                  icon: Icons.percent_rounded,
                                  title: 'View Offers',
                                  color: const Color(0xFFD97706),
                                  onTap: () => context.push('/offers'),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Upcoming Appointment
                          const Text(
                            'Upcoming Appointment',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 12),
                          if (upcomingAppt != null)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.02),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 24,
                                    backgroundColor: const Color(0xFF0F766E).withOpacity(0.1),
                                    child: const Icon(Icons.person_rounded, color: Color(0xFF0F766E)),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          (upcomingAppt['therapistId'] is Map && upcomingAppt['therapistId']['name'] != null)
                                              ? upcomingAppt['therapistId']['name']
                                              : 'Auto Assigned Therapist',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          (upcomingAppt['serviceId'] is Map && upcomingAppt['serviceId']['title'] != null)
                                              ? upcomingAppt['serviceId']['title']
                                              : 'Physiotherapy Consultation',
                                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            const Icon(Icons.access_time_filled_rounded, size: 12, color: Color(0xFF0F766E)),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${upcomingAppt['date']} • ${upcomingAppt['timeSlot']}',
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                              ),
                              child: Row(
                                children: [
                                  const CircleAvatar(
                                    radius: 24,
                                    backgroundColor: Color(0xFFEEF2FF),
                                    child: Icon(Icons.medical_services_rounded, color: Color(0xFF4F46E5)),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: const [
                                        Text('No Active Appointments', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                                        SizedBox(height: 2),
                                        Text('Book your consultation today', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => context.push('/booking'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0F766E),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      elevation: 0,
                                    ),
                                    child: const Text('Book', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  )
                                ],
                              ),
                            ),
                          const SizedBox(height: 24),

                          // Creative Doctors Showcase Banner (Standing Together)
                          _buildDoctorShowcaseBanner(),
                          const SizedBox(height: 28),

                          // Frequently Asked Questions Section
                          const FaqSection(),
                          const SizedBox(height: 48),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),

      // Floating Amber Support Assistant Button
      floatingActionButton: FloatingActionButton(
        onPressed: _showSupportDialog,
        backgroundColor: const Color(0xFFE6A740),
        elevation: 6,
        child: const Icon(Icons.support_agent_rounded, color: Color(0xFF0F172A), size: 28),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }

  Widget _buildActionShortcut({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.015),
              blurRadius: 6,
              offset: const Offset(0, 2),
            )
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorShowcaseBanner() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF023834), Color(0xFF012421)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF011A18).withOpacity(0.45),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(color: const Color(0xFF14B8A6).withOpacity(0.35), width: 1.5),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Stack(
          children: [
            // Background subtle medical circular backdrop
            Positioned(
              right: -10,
              top: 35,
              child: Container(
                width: 185,
                height: 185,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF0D5E58).withOpacity(0.5),
                  border: Border.all(color: const Color(0xFF2DD4BF).withOpacity(0.2), width: 2),
                ),
              ),
            ),
            // Medical '+' Cross watermark
            Positioned(
              right: 18,
              top: 40,
              child: Icon(
                Icons.add_rounded,
                size: 40,
                color: const Color(0xFF2DD4BF).withOpacity(0.22),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Header Badges Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFF59E0B).withOpacity(0.4),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.star_rounded, size: 13, color: Colors.white),
                            SizedBox(width: 4),
                            Text(
                              'EXPERT CLINICAL DIRECTORS',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 0.6,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF011C1A).withOpacity(0.7),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.access_time_filled_rounded, size: 13, color: Color(0xFFFBBF24)),
                            SizedBox(width: 5),
                            Text(
                              '9 AM – 7 PM',
                              style: TextStyle(fontSize: 10.5, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // 2. Middle Row: Doctor Information Cards + Large High-Res Doctors Image
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Left Content
                      Expanded(
                        flex: 6,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "QuickPhysio24.com",
                              style: TextStyle(
                                color: Color(0xFF2DD4BF),
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.3,
                              ),
                            ),
                            const Text(
                              "Physiotherapy &\nNeuro Rehab",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                height: 1.15,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Personalized care. Better movement.\nImproved life.",
                              style: TextStyle(
                                color: const Color(0xFFCCFBF1).withOpacity(0.85),
                                fontSize: 10,
                                height: 1.25,
                              ),
                            ),
                            const SizedBox(height: 10),

                            // Dr. Rajnish Bariyar Card
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                              decoration: BoxDecoration(
                                color: const Color(0xFF042D2A).withOpacity(0.8),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFF0D9488).withOpacity(0.45)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: const Color(0xFF0F766E).withOpacity(0.6),
                                      border: Border.all(color: const Color(0xFF2DD4BF).withOpacity(0.6)),
                                    ),
                                    child: const Icon(Icons.person_rounded, size: 18, color: Color(0xFF5EEAD4)),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: const [
                                        Text(
                                          "Dr. Rajnish Bariyar",
                                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                                        ),
                                        Text(
                                          "BPT, MIAP, JSCPT",
                                          style: TextStyle(color: Color(0xFF99F6E4), fontSize: 8.5, fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          "Founder | Joint Secretary, IAP Jharkhand",
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(color: Colors.white70, fontSize: 8),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6),

                            // Dr. Priyanka Bariyar Card
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                              decoration: BoxDecoration(
                                color: const Color(0xFF042D2A).withOpacity(0.8),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFF0D9488).withOpacity(0.45)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: const Color(0xFF0F766E).withOpacity(0.6),
                                      border: Border.all(color: const Color(0xFF2DD4BF).withOpacity(0.6)),
                                    ),
                                    child: const Icon(Icons.face_3_rounded, size: 18, color: Color(0xFF5EEAD4)),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: const [
                                        Text(
                                          "Dr. Priyanka Bariyar",
                                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                                        ),
                                        Text(
                                          "BPT, MIAP, JSCPT",
                                          style: TextStyle(color: Color(0xFF99F6E4), fontSize: 8.5, fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          "Co-Founder | Pediatric & Neuro Specialist",
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(color: Colors.white70, fontSize: 8),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),

                      // High-res Image of Both Doctors Standing Together (Waist-Up Prominent View)
                      Expanded(
                        flex: 5,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            height: 245,
                            alignment: Alignment.topCenter,
                            child: Image.asset(
                              'assets/images/doctors_together.png',
                              fit: BoxFit.cover,
                              alignment: const Alignment(0.0, -0.85),
                              errorBuilder: (_, __, ___) => const Icon(Icons.people_alt_rounded, size: 60, color: Colors.white54),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // 3. Middle-Bottom 4 Feature Columns Strip
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF011C1A).withOpacity(0.55),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.07)),
                    ),
                    child: Row(
                      children: [
                        _buildBannerFeature(
                          icon: Icons.accessibility_new_rounded,
                          label: 'Personalized\nTreatment Plans',
                        ),
                        _buildFeatureDivider(),
                        _buildBannerFeature(
                          icon: Icons.psychology_rounded,
                          label: 'Neuro & Pediatric\nRehabilitation',
                        ),
                        _buildFeatureDivider(),
                        _buildBannerFeature(
                          icon: Icons.directions_run_rounded,
                          label: 'Post-Surgery\nRecovery',
                        ),
                        _buildFeatureDivider(),
                        _buildBannerFeature(
                          icon: Icons.health_and_safety_rounded,
                          label: 'Pain Relief &\nMobility Support',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 4. Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => context.push('/booking'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF59E0B),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.calendar_month_rounded, size: 16),
                              SizedBox(width: 6),
                              Text(
                                'Book Appointment',
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11),
                              ),
                              SizedBox(width: 4),
                              Icon(Icons.arrow_forward_rounded, size: 14),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => context.push('/service_providers'),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: const Color(0xFF02322E).withOpacity(0.5),
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Color(0xFF2DD4BF), width: 1.2),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.badge_rounded, size: 16, color: Color(0xFF5EEAD4)),
                              SizedBox(width: 6),
                              Text(
                                'Doctor Profiles',
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: Colors.white),
                              ),
                              SizedBox(width: 4),
                              Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBannerFeature({required IconData icon, required String label}) {
    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF5EEAD4), size: 18),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 8,
              fontWeight: FontWeight.w600,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureDivider() {
    return Container(
      width: 1,
      height: 28,
      color: Colors.white12,
    );
  }

  // ==========================================
  // CREATIVE MODERN BANNER CARD BUILDER
  // ==========================================
  Widget _buildModernBannerCard({
    required String numberTag,
    required String pageTag,
    required String title,
    required String subtitle,
    required String ctaText,
    required Color ctaColor,
    required Color ctaTextColor,
    required List<Color> gradientColors,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
    required Widget visual,
    required List<Map<String, dynamic>> bottomChips,
    required VoidCallback onTap,
    bool isDark = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.fromLTRB(16, 12, 14, 10),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: borderColor, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.35) : gradientColors.last.withOpacity(0.25),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Section: Tag, Text Content, CTA & Custom Visual
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            Text(
                              numberTag,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: isDark ? const Color(0xFF38BDF8) : ctaColor,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                title.replaceAll('\n', ' '),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  color: titleColor,
                                  letterSpacing: -0.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10.5,
                            height: 1.25,
                            color: subtitleColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: ctaColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: ctaColor.withOpacity(0.35),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                ctaText,
                                style: TextStyle(
                                  color: ctaTextColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Right Visual & Page Tag
                  SizedBox(
                    width: 98,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        visual,
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withOpacity(0.15) : Colors.black.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              pageTag,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white70 : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),

            // Bottom 3 Feature Pills
            Row(
              children: bottomChips.map((chip) {
                return Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withOpacity(0.08) : Colors.white.withOpacity(0.75),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark ? Colors.white12 : Colors.black.withOpacity(0.06),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          chip['icon'] as IconData,
                          size: 11,
                          color: isDark ? const Color(0xFF38BDF8) : ctaColor,
                        ),
                        const SizedBox(width: 3),
                        Flexible(
                          child: Text(
                            chip['label'] as String,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  // 1. Spine & Back Glow Visual
  Widget _buildSpineGlowVisual() {
    return Container(
      height: 90,
      width: 90,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            const Color(0xFFF59E0B).withOpacity(0.28),
            const Color(0xFFFEF3C7).withOpacity(0.05),
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Posture silhouette / back shape
          Icon(
            Icons.accessibility_new_rounded,
            size: 64,
            color: const Color(0xFFD97706).withOpacity(0.4),
          ),
          // Glowing spine dots column
          Column(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(5, (i) {
              return Container(
                margin: const EdgeInsets.symmetric(vertical: 1.5),
                width: 5 + (i == 2 ? 3 : 0),
                height: 5 + (i == 2 ? 3 : 0),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: i == 2 ? const Color(0xFFEF4444) : const Color(0xFFF59E0B),
                  boxShadow: [
                    BoxShadow(
                      color: i == 2 ? const Color(0xFFEF4444).withOpacity(0.8) : const Color(0xFFF59E0B).withOpacity(0.8),
                      blurRadius: 6,
                    ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // 2. Runner & Speed Visual
  Widget _buildRunnerVisual() {
    return Container(
      height: 90,
      width: 90,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            const Color(0xFF0284C7).withOpacity(0.25),
            const Color(0xFFBAE6FD).withOpacity(0.05),
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Dynamic speed lines
          Positioned(
            left: 8,
            top: 24,
            child: Container(
              width: 18,
              height: 2,
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Positioned(
            left: 4,
            top: 36,
            child: Container(
              width: 24,
              height: 2.5,
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.7),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Positioned(
            left: 10,
            bottom: 24,
            child: Container(
              width: 16,
              height: 2,
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Sprinter Runner icon
          const Icon(
            Icons.directions_run_rounded,
            size: 60,
            color: Color(0xFF0284C7),
          ),
        ],
      ),
    );
  }

  // 3. Yoga & Flexibility Visual
  Widget _buildYogaFlexibilityVisual() {
    return Container(
      height: 90,
      width: 90,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            const Color(0xFF9333EA).withOpacity(0.22),
            const Color(0xFFDDD6FE).withOpacity(0.05),
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Zen harmony halo ring
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFC084FC).withOpacity(0.4), width: 1.5),
            ),
          ),
          // Seated Yoga Stretch Pose
          const Icon(
            Icons.self_improvement_rounded,
            size: 58,
            color: Color(0xFF7E22CE),
          ),
          // Sparkle accent
          Positioned(
            top: 10,
            right: 14,
            child: Icon(Icons.auto_awesome_rounded, size: 14, color: const Color(0xFFA855F7)),
          ),
        ],
      ),
    );
  }

  // 4. Smartphone Doctor Tele-consult Visual
  Widget _buildPhoneDoctorVisual() {
    return Container(
      width: 68,
      height: 96,
      decoration: BoxDecoration(
        color: const Color(0xFF064E3B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF34D399), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF059669).withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Doctor avatar on screen
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFD1FAE5),
                ),
                child: const Icon(Icons.person_rounded, size: 28, color: Color(0xFF059669)),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF34D399)),
                  ),
                  const SizedBox(width: 3),
                  const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)),
                ],
              ),
            ],
          ),
          // Notch
          Positioned(
            top: 4,
            child: Container(
              width: 18,
              height: 3,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Video call icon badge
          Positioned(
            bottom: 4,
            right: 4,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF10B981),
              ),
              child: const Icon(Icons.videocam_rounded, size: 10, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  // 5. Biomechanical Neon Body & Pain Heatmap Points
  Widget _buildBiomechanicNeonVisual() {
    return Container(
      height: 94,
      width: 94,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            const Color(0xFF0284C7).withOpacity(0.3),
            Colors.transparent,
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Cyber wireframe human anatomy silhouette
          Icon(
            Icons.directions_walk_rounded,
            size: 64,
            color: const Color(0xFF38BDF8).withOpacity(0.7),
          ),
          // Neon glowing red & cyan joint hotspots
          Positioned(
            top: 26,
            left: 42,
            child: _buildNeonHotspot(const Color(0xFFEF4444)), // Shoulder
          ),
          Positioned(
            top: 44,
            left: 36,
            child: _buildNeonHotspot(const Color(0xFFEF4444)), // Spine / Hip
          ),
          Positioned(
            bottom: 26,
            left: 48,
            child: _buildNeonHotspot(const Color(0xFF06B6D4)), // Knee
          ),
          Positioned(
            bottom: 12,
            left: 32,
            child: _buildNeonHotspot(const Color(0xFF06B6D4)), // Ankle
          ),
        ],
      ),
    );
  }

  Widget _buildNeonHotspot(Color color) {
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.9),
            blurRadius: 6,
            spreadRadius: 1,
          ),
        ],
      ),
    );
  }

  // 6. Sunrise Horizon & Triumphant Silhouette Visual
  Widget _buildSunriseSilhouetteVisual() {
    return Container(
      height: 92,
      width: 92,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            const Color(0xFFF97316).withOpacity(0.3),
            const Color(0xFFFDBA74).withOpacity(0.05),
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Glowing sun arc
          Positioned(
            bottom: 14,
            child: Container(
              width: 50,
              height: 25,
              decoration: const BoxDecoration(
                color: Color(0xFFFBBF24),
                borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
              ),
            ),
          ),
          // Celebrating arms-raised figure silhouette
          const Positioned(
            bottom: 16,
            child: Icon(
              Icons.accessibility_new_rounded,
              size: 50,
              color: Color(0xFF7C2D12),
            ),
          ),
          // Sun flare sparkles
          Positioned(
            top: 8,
            right: 18,
            child: Icon(Icons.wb_sunny_rounded, size: 16, color: const Color(0xFFF59E0B)),
          ),
        ],
      ),
    );
  }
}

