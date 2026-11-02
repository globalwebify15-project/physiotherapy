import 'package:flutter/material.dart';
import '../../utils/phone_helper.dart';
import '../../services/api_service.dart';

class AboutClinicScreen extends StatefulWidget {
  const AboutClinicScreen({super.key});

  @override
  State<AboutClinicScreen> createState() => _AboutClinicScreenState();
}

class _AboutClinicScreenState extends State<AboutClinicScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCmsData();
  }

  Future<void> _fetchCmsData() async {
    try {
      await Future.wait([
        ApiService().fetchCmsAboutClinic(),
        ApiService().fetchCmsContactDetails(),
      ]);
    } catch (_) {}
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const tealPrimary = Color(0xFF0F766E);
    const slateDark = Color(0xFF0F172A);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: tealPrimary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'About Clinic & Doctors',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: tealPrimary))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero Header Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF042F2E), Color(0xFF0F766E), Color(0xFF065F46)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: tealPrimary.withOpacity(0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.2)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified_rounded, color: Color(0xFF5EEAD4), size: 14),
                              SizedBox(width: 5),
                              Text(
                                'Certified Physiotherapy Center',
                                style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          PhoneHelper.clinicHeadline,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on_rounded, color: Color(0xFF5EEAD4), size: 15),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                'Ashok Nagar, Ranchi, Jharkhand',
                                style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Key Clinical Metrics (16+ Years & 15,000+ Treated)
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF0FDFA),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.history_edu_rounded, color: tealPrimary, size: 22),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                PhoneHelper.clinicalExperience,
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: slateDark),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Clinical Experience',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.people_alt_rounded, color: Color(0xFF059669), size: 22),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                PhoneHelper.treatedPatients,
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: slateDark),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Patients Treated',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Accreditations Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFF99F6E4)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield_outlined, color: tealPrimary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Accreditations & Recognition',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: tealPrimary),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                PhoneHelper.certifications,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF334155), height: 1.4, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Overview & Founder Story
                  const Text(
                    'OVERVIEW & CLINIC SPECIALIZATION',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Text(
                      PhoneHelper.clinicBio,
                      style: const TextStyle(fontSize: 14, color: Color(0xFF334155), height: 1.6, fontWeight: FontWeight.w400),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Mission Statement Card
                  const Text(
                    'OUR CLINICAL MISSION',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: const Border(left: BorderSide(color: tealPrimary, width: 4)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.format_quote_rounded, color: tealPrimary, size: 28),
                        const SizedBox(height: 6),
                        Text(
                          PhoneHelper.missionStatement,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF0F172A),
                            fontWeight: FontWeight.w600,
                            fontStyle: FontStyle.italic,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Senior Doctors & Founders
                  const Text(
                    'LEAD PHYSIOTHERAPISTS',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 12),

                  // Dr. Rajnish Bariyar Card
                  _buildDoctorCard(
                    context: context,
                    name: 'Dr. Rajnish Bariyar',
                    role: 'Founder & Senior Neuro/Spine Physio',
                    experience: '16+ Years Experience',
                    phone: PhoneHelper.drRajnishPhone,
                    badgeColor: tealPrimary,
                    avatarColor: const Color(0xFFF0FDFA),
                    iconColor: tealPrimary,
                  ),

                  const SizedBox(height: 12),

                  // Dr. Priyanka Bariyar Card
                  _buildDoctorCard(
                    context: context,
                    name: 'Dr. Priyanka Bariyar',
                    role: 'Co-Founder & Pediatric/Women\'s Health Specialist',
                    experience: '12+ Years Experience',
                    phone: PhoneHelper.drPriyankaPhone,
                    badgeColor: const Color(0xFFDB2777),
                    avatarColor: const Color(0xFFFDF2F8),
                    iconColor: const Color(0xFFDB2777),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }

  Widget _buildDoctorCard({
    required BuildContext context,
    required String name,
    required String role,
    required String experience,
    required String phone,
    required Color badgeColor,
    required Color avatarColor,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: avatarColor,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.person_rounded, color: iconColor, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 2),
                Text(
                  role,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 4),
                Text(
                  experience,
                  style: TextStyle(fontSize: 11, color: badgeColor, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => PhoneHelper.makePhoneCall(phone, context: context),
            icon: Icon(Icons.phone_in_talk_rounded, color: badgeColor),
            style: IconButton.styleFrom(
              backgroundColor: avatarColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}

