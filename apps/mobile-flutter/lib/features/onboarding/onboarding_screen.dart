import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../utils/app_storage.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  final ApiService _apiService = ApiService();
  int _currentPage = 0;

  Map<String, dynamic> _config = Map<String, dynamic>.from(ApiService.defaultOnboardingConfig);

  @override
  void initState() {
    super.initState();
    _loadDynamicConfig();
  }

  Future<void> _loadDynamicConfig() async {
    // 1. Instantly restore cached onboarding CMS config if available
    try {
      final cachedRaw = await AppStorage.read(key: 'cms_onboarding_config');
      if (cachedRaw != null && cachedRaw.isNotEmpty) {
        final decoded = jsonDecode(cachedRaw);
        if (decoded is Map && mounted) {
          setState(() {
            _config = Map<String, dynamic>.from(ApiService.defaultOnboardingConfig)
              ..addAll(Map<String, dynamic>.from(decoded));
          });
        }
      }
    } catch (_) {}

    // 2. Refresh live from MongoDB CMS via Next.js backend
    try {
      final liveConfig = await _apiService.fetchCmsOnboarding();
      if (mounted) {
        setState(() {
          _config = liveConfig;
          final slidesCount = _slides.length;
          if (_currentPage >= slidesCount && slidesCount > 0) {
            _currentPage = 0;
          }
        });
      }
    } catch (_) {}
  }

  List<Map<String, dynamic>> get _slides {
    final raw = _config['slides'];
    if (raw is List && raw.isNotEmpty) {
      return raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return List<Map<String, dynamic>>.from(
      (ApiService.defaultOnboardingConfig['slides'] as List)
          .map((e) => Map<String, dynamic>.from(e as Map)),
    );
  }

  IconData _resolveSlideIcon(String? iconKey) {
    switch ((iconKey ?? '').toLowerCase()) {
      case 'home_care':
        return Icons.home_work_rounded;
      case 'clinic_rehab':
        return Icons.local_hospital_rounded;
      case 'caretaker':
        return Icons.volunteer_activism_rounded;
      case 'rehab':
        return Icons.accessibility_new_rounded;
      case 'verified':
        return Icons.verified_user_rounded;
      case 'schedule':
        return Icons.schedule_rounded;
      default:
        return Icons.medical_services_rounded;
    }
  }

  Color _resolveSlideColor(String? hex) {
    final cleaned = (hex ?? '').replaceAll('#', '').trim();
    if (cleaned.length == 6) {
      final parsed = int.tryParse('FF$cleaned', radix: 16);
      if (parsed != null) return Color(parsed);
    } else if (cleaned.length == 8) {
      final parsed = int.tryParse(cleaned, radix: 16);
      if (parsed != null) return Color(parsed);
    }
    return const Color(0xFF0F766E);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const brandTeal = Color(0xFF0F766E);
    const darkSlate = Color(0xFF0F172A);

    final brandShortCode = (_config['brandShortCode'] ?? 'QP').toString();
    final brandName = (_config['brandName'] ?? 'QuickPhysio24.com').toString();
    final ratingBadge = (_config['ratingBadge'] ?? '4.9 (350+ Cases)').toString().replaceAll('★', '').trim();
    final experienceBadge = (_config['experienceBadge'] ?? '16+ Yrs Experience').toString();
    final clinicSubtitle = (_config['clinicSubtitle'] ?? 'Synergy Global Hospital, Bariatu, Ranchi').toString();
    final showPromoPill = _config['showPromoPill'] != false;
    final promoPillText = (_config['promoPillText'] ?? 'Flat 25% OFF on 5-Session Rehab Packages')
        .toString()
        .replaceAll('🏷️', '')
        .trim();
    final headline = (_config['headline'] ?? 'Expert Physiotherapy\n& Home Doctor Care').toString();
    final subtitle = (_config['subtitle'] ??
            'Painless mobility, stroke paralysis recovery, and certified 24/7 caretakers at your doorstep in Ranchi.')
        .toString();
    final doctorInitials = (_config['doctorInitials'] ?? 'DR').toString();
    final doctorNames = (_config['doctorNames'] ?? 'Dr. Rajnish Bariyar & Dr. Priyanka Bariyar').toString();
    final doctorCredentials =
        (_config['doctorCredentials'] ?? 'BPT, MIAP, JSCPT • 16+ Years Clinical Excellence').toString();
    final primaryCtaText = (_config['primaryCtaText'] ?? 'Get Started / शुरू करें').toString();
    final secondaryCtaText = (_config['secondaryCtaText'] ?? 'I already have an account').toString();
    final slides = _slides;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Brand Logo & Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                        decoration: BoxDecoration(
                          color: brandTeal,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x330F766E),
                              blurRadius: 6,
                              offset: Offset(0, 2),
                            )
                          ],
                        ),
                        child: Text(
                          brandShortCode,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        brandName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: darkSlate,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    style: TextButton.styleFrom(
                      foregroundColor: brandTeal,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    ),
                    child: const Text(
                      'Skip',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

            // Main Scrollable Area
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 6.0),
                child: Column(
                  children: [
                    // Medical Hero Card with Floating Glassmorphic Badges (Dynamic CMS)
                    Container(
                      width: double.infinity,
                      constraints: const BoxConstraints(minHeight: 220),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFF094D47),
                            Color(0xFF0F766E),
                            Color(0xFF059669),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x330F766E),
                            blurRadius: 20,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Top Frosted Glass Badges Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xE6FFFFFF),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: const Color(0x66FFFFFF)),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 4,
                                      offset: Offset(0, 1),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFD97706)),
                                    const SizedBox(width: 4),
                                    Text(
                                      ratingBadge,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xE6FFFFFF),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: const Color(0x66FFFFFF)),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 4,
                                      offset: Offset(0, 1),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.verified_rounded, size: 13, color: Color(0xFF059669)),
                                    const SizedBox(width: 4),
                                    Text(
                                      experienceBadge,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Center Graphic
                          Column(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: const Color(0x26FFFFFF),
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: const Color(0x4DFFFFFF)),
                                ),
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.health_and_safety_rounded,
                                  color: Colors.white,
                                  size: 32,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                brandName,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                clinicSubtitle,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFFCCFBF1),
                                ),
                              ),
                            ],
                          ),

                          if (showPromoPill && promoPillText.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFDE68A),
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.local_offer_rounded, size: 13, color: Color(0xFF92400E)),
                                  const SizedBox(width: 6),
                                  Flexible(
                                    child: Text(
                                      promoPillText,
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF78350F),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Title & Description (Dynamic CMS)
                    Text(
                      headline,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: darkSlate,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Swipeable Feature Highlights Card Carousel (Dynamic CMS)
                    SizedBox(
                      height: 104,
                      child: PageView.builder(
                        controller: _pageController,
                        itemCount: slides.length,
                        onPageChanged: (idx) => setState(() => _currentPage = idx),
                        itemBuilder: (context, index) {
                          final slide = slides[index];
                          final Color iconCol = _resolveSlideColor(slide['colorHex']?.toString());
                          final IconData iconData = _resolveSlideIcon(slide['iconKey']?.toString());

                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x08000000),
                                  blurRadius: 6,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 42,
                                  height: 42,
                                  decoration: BoxDecoration(
                                    color: iconCol.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  alignment: Alignment.center,
                                  child: Icon(iconData, color: iconCol, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        (slide['title'] ?? '').toString(),
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: darkSlate,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        (slide['desc'] ?? '').toString(),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: Color(0xFF64748B),
                                          height: 1.3,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
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
                    const SizedBox(height: 10),

                    // Dots Indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(slides.length, (index) {
                        final isSel = _currentPage == index;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: isSel ? 20 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: isSel ? brandTeal : const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 14),

                    // Doctor Credential Bar (Dynamic CMS)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDFA),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFCCFBF1)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: brandTeal,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              doctorInitials,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  doctorNames,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: darkSlate,
                                  ),
                                ),
                                Text(
                                  doctorCredentials,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: brandTeal,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),

            // Bottom Action CTA Buttons
            Container(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton(
                    onPressed: () => context.go('/login?mode=new'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: brandTeal,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          primaryCtaText,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextButton(
                    onPressed: () => context.go('/login?mode=returning'),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF64748B),
                      padding: const EdgeInsets.symmetric(vertical: 6),
                    ),
                    child: Text(
                      secondaryCtaText,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
