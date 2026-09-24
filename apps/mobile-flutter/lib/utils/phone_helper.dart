import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PhoneHelper {
  // Active Helpline and WhatsApp Numbers for QuickPhysio24.com
  static String helplinePhone = '+919110912544';
  static String secondaryPhone = '+919693233447';
  static String whatsappNumber = '+919693233447';
  static String drRajnishPhone = '+919110912544';
  static String drPriyankaPhone = '+919693233447';

  /// Initiates a direct phone call to the target number
  static Future<void> makePhoneCall(String phoneNumber, {BuildContext? context}) async {
    final cleaned = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleaned');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connecting phone call to $phoneNumber...'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
      }
    }
  }

  /// Opens WhatsApp chat with prefilled message
  static Future<void> openWhatsApp({
    String? phone,
    String message = "Hello QuickPhysio24.com, I need assistance regarding physiotherapy treatment.",
    BuildContext? context,
  }) async {
    final targetNumber = (phone ?? whatsappNumber).replaceAll(RegExp(r'[^0-9]'), '');
    final encodedMessage = Uri.encodeComponent(message);
    final whatsappUrl = Uri.parse('https://wa.me/$targetNumber?text=$encodedMessage');

    try {
      if (await canLaunchUrl(whatsappUrl)) {
        await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(whatsappUrl, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Opening WhatsApp support (+91 $targetNumber)...'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
      }
    }
  }

  /// Shows doctor call options dialog
  static void showDoctorCallModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Direct Doctor Calling & Consultation',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              const Text(
                'Connect directly with our senior physiotherapists via phone call',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF0FDFA),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.phone_rounded, color: Color(0xFF0F766E)),
                ),
                title: const Text(
                  'Dr. Rajnish Bariyar',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                subtitle: const Text(
                  'Founder & Senior Neuro/Spine Physio • 9 AM – 7 PM',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                trailing: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    makePhoneCall(drRajnishPhone, context: context);
                  },
                  icon: const Icon(Icons.call, size: 14),
                  label: const Text('Call Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F766E),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFDF2F8),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.phone_rounded, color: Color(0xFFDB2777)),
                ),
                title: const Text(
                  'Dr. Priyanka Bariyar',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                subtitle: const Text(
                  'Co-Founder & Pediatric/Women\'s Health • 9 AM – 7 PM',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                trailing: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    makePhoneCall(drPriyankaPhone, context: context);
                  },
                  icon: const Icon(Icons.call, size: 14),
                  label: const Text('Call Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDB2777),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    color: Color(0xFFECFDF5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.chat_rounded, color: Color(0xFF059669)),
                ),
                title: const Text(
                  'WhatsApp Help Desk',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                subtitle: const Text(
                  'Instant chat support & quick appointment booking',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                trailing: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    openWhatsApp(context: context);
                  },
                  icon: const Icon(Icons.chat, size: 14),
                  label: const Text('Chat', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
