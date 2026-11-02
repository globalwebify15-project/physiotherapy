import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PhoneHelper {
  // Live Active Contact & Helpline details for QuickPhysio24
  static String helplinePhone = '+91 91109 12544';
  static String secondaryPhone = '+91 96932 33447';
  static String whatsappNumber = '+91 96932 33447';
  static String drRajnishPhone = '+91 91109 12544';
  static String drPriyankaPhone = '+91 96932 33447';
  static String clinicEmail = 'contact@QuickPhysio24.com';
  static String websiteUrl = 'https://QuickPhysio24.com';
  static String workingHours = '9:00 AM – 7:00 PM (Monday – Sunday)';
  static String physicalAddress = 'Near, Ashok Nagar Rd No 1, opposite Overhead Water Tank, Ashok Nagar, Ranchi, Jharkhand 834002';

  // Live Active About Clinic details from CMS
  static String clinicHeadline = "Dr. Bariyar's Physiotherapy & Rehabilitation Center";
  static String clinicBio = "Leading physiotherapy & neuro-rehabilitation clinic in Ranchi, Jharkhand specializing in Stroke paralysis, Cervical & Lumbar Spondylosis, Joint replacements, Pediatric CP rehabilitation, and Sports Injury recovery.";
  static String clinicalExperience = "16+ Years";
  static String treatedPatients = "15,000+";
  static String certifications = "MIAP Certified, JSCPT Registered, Government Recognized Center";
  static String missionStatement = "Delivering compassionate, evidence-based physiotherapy to restore painless mobility and independent living for every patient.";

  /// Updates contact and helpline details dynamically from Admin CMS
  static void updateFromCms(Map<String, dynamic> cms) {
    if (cms['phone'] != null && cms['phone'].toString().trim().isNotEmpty) {
      helplinePhone = cms['phone'].toString().trim();
    }
    if (cms['whatsapp'] != null && cms['whatsapp'].toString().trim().isNotEmpty) {
      whatsappNumber = cms['whatsapp'].toString().trim();
      secondaryPhone = cms['whatsapp'].toString().trim();
    }
    if (cms['drRajnishPhone'] != null && cms['drRajnishPhone'].toString().trim().isNotEmpty) {
      drRajnishPhone = cms['drRajnishPhone'].toString().trim();
    }
    if (cms['drPriyankaPhone'] != null && cms['drPriyankaPhone'].toString().trim().isNotEmpty) {
      drPriyankaPhone = cms['drPriyankaPhone'].toString().trim();
    }
    if (cms['email'] != null && cms['email'].toString().trim().isNotEmpty) {
      clinicEmail = cms['email'].toString().trim();
    }
    if (cms['address'] != null && cms['address'].toString().trim().isNotEmpty) {
      physicalAddress = cms['address'].toString().trim();
    }
    if (cms['website'] != null && cms['website'].toString().trim().isNotEmpty) {
      websiteUrl = cms['website'].toString().trim();
    }
    if (cms['workingHours'] != null && cms['workingHours'].toString().trim().isNotEmpty) {
      workingHours = cms['workingHours'].toString().trim();
    }
  }

  /// Updates about clinic information dynamically from Admin CMS
  static void updateAboutFromCms(Map<String, dynamic> cms) {
    if (cms['clinicHeadline'] != null && cms['clinicHeadline'].toString().trim().isNotEmpty) {
      clinicHeadline = cms['clinicHeadline'].toString().trim();
    }
    if (cms['clinicBio'] != null && cms['clinicBio'].toString().trim().isNotEmpty) {
      clinicBio = cms['clinicBio'].toString().trim();
    }
    if (cms['yearsExperience'] != null && cms['yearsExperience'].toString().trim().isNotEmpty) {
      clinicalExperience = cms['yearsExperience'].toString().trim();
    }
    if (cms['patientsTreated'] != null && cms['patientsTreated'].toString().trim().isNotEmpty) {
      treatedPatients = cms['patientsTreated'].toString().trim();
    }
    if (cms['accreditations'] != null && cms['accreditations'].toString().trim().isNotEmpty) {
      certifications = cms['accreditations'].toString().trim();
    }
    if (cms['missionStatement'] != null && cms['missionStatement'].toString().trim().isNotEmpty) {
      missionStatement = cms['missionStatement'].toString().trim();
    }
  }

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

  /// Opens device email client
  static Future<void> openEmail({String? email, BuildContext? context}) async {
    final targetEmail = email ?? clinicEmail;
    final uri = Uri.parse('mailto:$targetEmail?subject=Physiotherapy%20Consultation%20Enquiry');

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
            content: Text('Composing email to $targetEmail...'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
      }
    }
  }

  /// Opens website in external browser
  static Future<void> openWebsite({String? url, BuildContext? context}) async {
    final targetUrl = url ?? websiteUrl;
    final uri = Uri.parse(targetUrl.startsWith('http') ? targetUrl : 'https://$targetUrl');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Opening $targetUrl...'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
      }
    }
  }

  /// Opens Google Maps with clinic physical address
  static Future<void> openMapAddress({String? address, BuildContext? context}) async {
    final targetAddress = address ?? physicalAddress;
    final encoded = Uri.encodeComponent(targetAddress);
    final mapUri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$encoded');

    try {
      if (await canLaunchUrl(mapUri)) {
        await launchUrl(mapUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(mapUri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Opening Google Maps navigation...'),
            backgroundColor: const Color(0xFF0F766E),
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
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(22),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44,
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
              const SizedBox(height: 18),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
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
                subtitle: Text(
                  'Founder & Senior Neuro/Spine Physio • $workingHours',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
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
              const SizedBox(height: 12),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
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
                subtitle: Text(
                  'Co-Founder & Pediatric/Women\'s Health • $workingHours',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
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
              const SizedBox(height: 12),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
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
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }
}
