import 'package:flutter/material.dart';
import '../../utils/phone_helper.dart';
import '../../services/api_service.dart';

class ContactUsScreen extends StatefulWidget {
  const ContactUsScreen({super.key});

  @override
  State<ContactUsScreen> createState() => _ContactUsScreenState();
}

class _ContactUsScreenState extends State<ContactUsScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchContactDetails();
  }

  Future<void> _fetchContactDetails() async {
    try {
      await ApiService().fetchCmsContactDetails();
    } catch (_) {}
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const tealPrimary = Color(0xFF0F766E);
    const emeraldAccent = Color(0xFF059669);
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
          'Contact & Help Desk',
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
                  // Working Hours Badge
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFBBF7D0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.access_time_rounded, color: emeraldAccent, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'CLINIC CONSULTATION HOURS',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: emeraldAccent, letterSpacing: 0.8),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                PhoneHelper.workingHours,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: slateDark),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Physical Clinic Address Card
                  const Text(
                    'CLINIC LOCATION',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDFA),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.location_on_rounded, color: tealPrimary, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    "Dr. Bariyar's Physiotherapy Center",
                                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: slateDark),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    PhoneHelper.physicalAddress,
                                    style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => PhoneHelper.openMapAddress(context: context),
                            icon: const Icon(Icons.directions_rounded, size: 18),
                            label: const Text('Get Directions on Google Maps'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: tealPrimary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Phone & Instant Messaging Support Channels
                  const Text(
                    'CALLING & WHATSAPP SUPPORT',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 10),

                  // Helpline Tile
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.phone_in_talk_rounded,
                    iconColor: tealPrimary,
                    bgColor: const Color(0xFFF0FDFA),
                    title: 'Helpline Phone',
                    value: PhoneHelper.helplinePhone,
                    buttonText: 'Call',
                    onAction: () => PhoneHelper.makePhoneCall(PhoneHelper.helplinePhone, context: context),
                  ),

                  const SizedBox(height: 10),

                  // WhatsApp Tile
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.chat_rounded,
                    iconColor: emeraldAccent,
                    bgColor: const Color(0xFFECFDF5),
                    title: 'WhatsApp Help Desk',
                    value: PhoneHelper.whatsappNumber,
                    buttonText: 'Chat',
                    onAction: () => PhoneHelper.openWhatsApp(context: context),
                  ),

                  const SizedBox(height: 10),

                  // Dr. Rajnish Direct Calling Line
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.person_rounded,
                    iconColor: tealPrimary,
                    bgColor: const Color(0xFFF0FDFA),
                    title: 'Dr. Rajnish Direct Calling Line',
                    value: PhoneHelper.drRajnishPhone,
                    buttonText: 'Call',
                    onAction: () => PhoneHelper.makePhoneCall(PhoneHelper.drRajnishPhone, context: context),
                  ),

                  const SizedBox(height: 10),

                  // Dr. Priyanka Direct Calling Line
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.person_rounded,
                    iconColor: const Color(0xFFDB2777),
                    bgColor: const Color(0xFFFDF2F8),
                    title: 'Dr. Priyanka Direct Calling Line',
                    value: PhoneHelper.drPriyankaPhone,
                    buttonText: 'Call',
                    onAction: () => PhoneHelper.makePhoneCall(PhoneHelper.drPriyankaPhone, context: context),
                  ),

                  const SizedBox(height: 24),

                  // Email & Online Portal
                  const Text(
                    'ONLINE & INQUIRY CHANNELS',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 10),

                  // Clinic Email Tile
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.email_rounded,
                    iconColor: const Color(0xFF0284C7),
                    bgColor: const Color(0xFFF0F9FF),
                    title: 'Clinic Official Email',
                    value: PhoneHelper.clinicEmail,
                    buttonText: 'Email',
                    onAction: () => PhoneHelper.openEmail(context: context),
                  ),

                  const SizedBox(height: 10),

                  // Official Website Tile
                  _buildContactActionTile(
                    context: context,
                    icon: Icons.language_rounded,
                    iconColor: const Color(0xFF7C3AED),
                    bgColor: const Color(0xFFF5F3FF),
                    title: 'Official Website',
                    value: PhoneHelper.websiteUrl,
                    buttonText: 'Visit',
                    onAction: () => PhoneHelper.openWebsite(context: context),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }

  Widget _buildContactActionTile({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String value,
    required String buttonText,
    required VoidCallback onAction,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onAction,
            style: ElevatedButton.styleFrom(
              backgroundColor: iconColor,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(buttonText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

