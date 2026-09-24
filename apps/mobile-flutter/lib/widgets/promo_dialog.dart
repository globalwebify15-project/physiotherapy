import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PromoDialog extends StatelessWidget {
  const PromoDialog({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => const PromoDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          // Main Card
          Container(
            margin: const EdgeInsets.only(top: 18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  blurRadius: 25,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Graphic Poster
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF042F2E), Color(0xFF0F766E)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            '★ CARETAKER SERVICE ★',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'घर पर विश्वसनीय देखभाल सेवा',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Trusted 24/7 Home Nursing & Elderly Care',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Color(0xFF99F6E4),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'बुजुर्गों और बेडरिडन मरीजों के लिए प्रशिक्षित केयरटेकर द्वारा सुरक्षित और प्यार भरी देखभाल।',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 12,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Feature Checklist
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildCheckItem(
                          title: 'बुजुर्गों की देखभाल (Elderly Care)',
                          subtitle: '2, 12 or 24 hrs dedicated assistance',
                        ),
                        _buildCheckItem(
                          title: 'बेडरिडन मरीज सेवा (Bedridden Care)',
                          subtitle: 'Specialized comfort, posture & hygiene',
                        ),
                        _buildCheckItem(
                          title: 'दवा व दैनिक स्वास्थ्य निगरानी (Medicine Support)',
                          subtitle: 'Timely medication & vital monitoring',
                        ),
                        _buildCheckItem(
                          title: 'चलने-फिरने में सहायता (Mobility Support)',
                          subtitle: 'Walker assistance, light physio & movement',
                        ),
                        _buildCheckItem(
                          title: 'व्यक्तिगत स्वच्छता व आहार (Hygiene & Food)',
                          subtitle: 'Bathing, meal prep & overall personal care',
                        ),
                        const SizedBox(height: 16),

                        // Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  context.push('/booking');
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0F766E),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: const Text(
                                  'Book Appointment',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  context.push('/service_providers');
                                },
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF0F766E),
                                  side: const BorderSide(color: Color(0xFF0F766E), width: 1.5),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: const Text(
                                  'View Providers',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Close Button on Top Right
          Positioned(
            right: 4,
            top: 0,
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.black87,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.close_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckItem({required String title, required String subtitle}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.check_rounded, color: Color(0xFF16A34A), size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
