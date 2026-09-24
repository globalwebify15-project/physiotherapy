import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/promo_dialog.dart';

class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  final List<Map<String, dynamic>> _coupons = const [
    {
      'code': 'PHYSIO25',
      'discount': '25% OFF',
      'title': 'Physiotherapy Rehab Package',
      'desc': 'Get 25% discount on booking 5 or more rehabilitation sessions.',
      'validTill': 'Valid till 30 Sep 2026',
      'tag': 'POPULAR',
      'color': Color(0xFF0F766E),
    },
    {
      'code': 'CAREHOME30',
      'discount': '30% OFF',
      'title': '24/7 Elderly & Caretaker Plan',
      'desc': 'Special discount on monthly home nursing and bedridden patient care.',
      'validTill': 'Valid till 15 Oct 2026',
      'tag': 'EXCLUSIVE',
      'color': Color(0xFFD97706),
    },
    {
      'code': 'FIRSTFREE',
      'discount': 'FREE ASSESSMENT',
      'title': 'Initial Physio Consultation',
      'desc': 'Book your first mobility & posture checkup completely free of cost.',
      'validTill': 'For New Users Only',
      'tag': 'LIMITED',
      'color': Color(0xFF2563EB),
    },
    {
      'code': 'NEURO20',
      'discount': '20% OFF',
      'title': 'Neuro & Pediatric Rehab Special',
      'desc': 'Special discounted package for Stroke, CP Child & Parkinson sessions.',
      'validTill': 'Valid till 30 Nov 2026',
      'tag': 'CLINIC CARE',
      'color': Color(0xFF7C3AED),
    },
  ];

  void _copyCoupon(BuildContext context, String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 8),
            Text('Coupon code "$code" copied to clipboard!'),
          ],
        ),
        backgroundColor: const Color(0xFF0F766E),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // Dark curved header
          const AppHeader(
            title: 'Offers & Promotions',
            showBack: false,
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Featured Caretaker Promo Poster Banner
                  GestureDetector(
                    onTap: () => PromoDialog.show(context),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF042F2E), Color(0xFF0F766E)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F766E).withOpacity(0.25),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF59E0B),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'SPECIAL SERVICE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 16),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Caretaker & Home Nursing Service',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'घर पर विश्वसनीय देखभाल सेवा (24/7 Elderly & Patient Care)',
                            style: TextStyle(fontSize: 12, color: Color(0xFF99F6E4)),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              ElevatedButton(
                                onPressed: () => PromoDialog.show(context),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFF59E0B),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                ),
                                child: const Text('View Highlights', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                              const SizedBox(width: 12),
                              OutlinedButton(
                                onPressed: () => context.push('/booking'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white70),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                ),
                                child: const Text('Book Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. Discount Coupons Section
                  const Text(
                    'Available Discount Coupons',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 12),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _coupons.length,
                    itemBuilder: (context, index) {
                      final coupon = _coupons[index];
                      final Color cardColor = coupon['color'] as Color;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: cardColor.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    coupon['tag'] as String,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: cardColor,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                Text(
                                  coupon['discount'] as String,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                    color: cardColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              coupon['title'] as String,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              coupon['desc'] as String,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                            ),
                            const SizedBox(height: 12),
                            const Divider(height: 1, color: Color(0xFFF1F5F9)),
                            const SizedBox(height: 10),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  coupon['validTill'] as String,
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                ),
                                InkWell(
                                  onTap: () => _copyCoupon(context, coupon['code'] as String),
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: const Color(0xFFCBD5E1), style: BorderStyle.solid),
                                    ),
                                    child: Row(
                                      children: [
                                        Text(
                                          coupon['code'] as String,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w800,
                                            color: Color(0xFF0F172A),
                                            letterSpacing: 0.8,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        const Icon(Icons.copy_rounded, size: 14, color: Color(0xFF0F766E)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 2),
    );
  }
}
