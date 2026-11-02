import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/promo_dialog.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _coupons = [];

  final List<Color> _palette = const [
    Color(0xFF0F766E), // Teal
    Color(0xFFD97706), // Amber
    Color(0xFF2563EB), // Blue
    Color(0xFF7C3AED), // Purple
    Color(0xFFEA580C), // Orange
    Color(0xFF059669), // Emerald
  ];

  @override
  void initState() {
    super.initState();
    _loadOffers();
  }

  Future<void> _loadOffers() async {
    setState(() => _isLoading = true);
    final offers = await _apiService.fetchCmsOffers();
    if (mounted) {
      setState(() {
        _coupons = offers;
        _isLoading = false;
      });
    }
  }

  void _copyCoupon(BuildContext context, String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Coupon code "$code" copied! Apply it on checkout.',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0F766E),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _applyCouponInBooking(String code) {
    context.push(
      '/booking',
      extra: {'promoCode': code},
    );
  }

  Color _getColorForIndex(int index) {
    return _palette[index % _palette.length];
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
            child: RefreshIndicator(
              onRefresh: _loadOffers,
              color: const Color(0xFF0F766E),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
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

                    // 2. Discount Coupons Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Available Discount Coupons',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        if (_isLoading)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F766E)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (_coupons.isEmpty && !_isLoading)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.local_offer_outlined, size: 36, color: Color(0xFF94A3B8)),
                            SizedBox(height: 8),
                            Text(
                              'No active coupons right now',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Check back later for new clinic offers & vouchers.',
                              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                            ),
                          ],
                        ),
                      ),

                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _coupons.length,
                      itemBuilder: (context, index) {
                        final coupon = _coupons[index];
                        final Color cardColor = _getColorForIndex(index);
                        final String code = (coupon['code'] ?? '').toString();
                        final String discountStr = (coupon['discount'] ?? '${coupon['discountValue'] ?? 0}% OFF').toString();
                        final String title = (coupon['title'] ?? '').toString();
                        final String desc = (coupon['desc'] ?? '').toString();
                        final String validTill = (coupon['validTill'] ?? 'Limited period').toString();
                        final String tag = (coupon['tag'] ?? 'POPULAR').toString();
                        final num minAmount = num.tryParse(coupon['minAmount']?.toString() ?? '0') ?? 0;

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
                                      tag,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: cardColor,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    discountStr,
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
                                title,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              if (desc.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(
                                  desc,
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                                ),
                              ],
                              const SizedBox(height: 12),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              const SizedBox(height: 10),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        validTill,
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                      ),
                                      if (minAmount > 0)
                                        Text(
                                          'Min. booking ₹$minAmount',
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                        ),
                                    ],
                                  ),

                                  Row(
                                    children: [
                                      // Copy code button
                                      InkWell(
                                        onTap: () => _copyCoupon(context, code),
                                        borderRadius: BorderRadius.circular(8),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF8FAFC),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFFCBD5E1)),
                                          ),
                                          child: Row(
                                            children: [
                                              Text(
                                                code,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w800,
                                                  color: Color(0xFF0F172A),
                                                  letterSpacing: 0.8,
                                                ),
                                              ),
                                              const SizedBox(width: 4),
                                              const Icon(Icons.copy_rounded, size: 13, color: Color(0xFF0F766E)),
                                            ],
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),

                                      // Apply in booking button
                                      ElevatedButton(
                                        onPressed: () => _applyCouponInBooking(code),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0F766E),
                                          foregroundColor: Colors.white,
                                          elevation: 0,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          minimumSize: Size.zero,
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: const Text(
                                          'Apply',
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
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
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 2),
    );
  }
}
