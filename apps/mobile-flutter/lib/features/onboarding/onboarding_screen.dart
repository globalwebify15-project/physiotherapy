import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/service_infographic.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'badge': '★ PHYSIOTHERAPY & HOME DOCTOR ★',
      'title': 'Expert Physiotherapy\n& Home Care',
      'subtitle': 'Consult top-rated physiotherapists & home doctors at your doorstep or clinic.',
      'offer': 'Flat 25% OFF on 5-Session Rehab Packages',
      'serviceType': 'Physiotherapy',
      'accentColor': Color(0xFF0F766E),
    },
    {
      'badge': '★ 24/7 CARETAKER SERVICE ★',
      'title': 'Reliable Home Nursing\n& Senior Care',
      'subtitle': 'Trained & compassionate caretakers for elderly and bedridden patient support.',
      'offer': '2, 12 & 24 Hours Shifts • Verified Specialists',
      'serviceType': 'Elderly care 2/12/24 hrs',
      'accentColor': Color(0xFFD97706),
    },
    {
      'badge': '★ PEDIATRIC & NEURO REHAB ★',
      'title': 'Advanced Neuro & Pediatric\nPhysiotherapy Care',
      'subtitle': 'Specialized rehabilitation by Dr. Rajnish Bariyar & Dr. Priyanka Bariyar.',
      'offer': 'Comprehensive 15+ Clinical Protocols',
      'serviceType': 'CP Child',
      'accentColor': Color(0xFF0F766E),
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Logo & Skip
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F766E),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.healing_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'QuickPhysio24.com',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF0F766E),
                    ),
                    child: const Text('Skip', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ],
              ),
            ),

            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (int page) {
                  setState(() => _currentPage = page);
                },
                itemCount: _slides.length,
                itemBuilder: (context, index) {
                  final slide = _slides[index];

                  return SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Creative Graphic Banner
                        Container(
                          width: double.infinity,
                          height: 240,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF042F2E), Color(0xFF0F766E)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(32),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0F766E).withOpacity(0.25),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              )
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF59E0B),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  slide['badge'] as String,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 14),
                              Center(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: ServiceInfographic(
                                    title: slide['serviceType'] as String,
                                    size: 90,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Offer Tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.local_offer_rounded, color: Color(0xFFD97706), size: 15),
                              const SizedBox(width: 6),
                              Text(
                                slide['offer'] as String,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF92400E),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Title
                        Text(
                          slide['title'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Subtitle
                        Text(
                          slide['subtitle'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF64748B),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Dot Indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _slides.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  height: 8,
                  width: _currentPage == index ? 24 : 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Navigation Buttons matching theme
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton(
                    onPressed: () => context.go('/login'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E), // Deep Teal theme
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Get Started',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF0F766E),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text(
                      'I already have an account',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}
