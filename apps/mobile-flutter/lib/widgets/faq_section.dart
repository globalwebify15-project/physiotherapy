import 'package:flutter/material.dart';

class FaqSection extends StatelessWidget {
  const FaqSection({super.key});

  final List<Map<String, String>> _faqs = const [
    {
      'question': 'What are the clinic timings and working hours?',
      'hindi': 'क्लिनिक का समय क्या है?',
      'answer': 'Our clinic is open daily from 9:00 AM to 7:00 PM (Clinic Hours: 9:00 AM – 7:00 PM). Both clinic consultations and home visits are available during these hours.',
    },
    {
      'question': 'Who are the chief doctors and physiotherapists?',
      'hindi': 'क्लिनिक के मुख्य डॉक्टर कौन हैं?',
      'answer': "Dr. Rajnish Bariyar (BPT, MIAP, JSCPT - Founder & Chief Physiotherapist, Joint Secretary IAP Jharkhand Branch) and Dr. Priyanka Bariyar (BPT, MIAP, JSCPT - Co-Founder & Director).",
    },
    {
      'question': 'What specialized treatments are offered?',
      'hindi': 'यहाँ कौन से विशेष उपचार उपलब्ध हैं?',
      'answer': 'We specialize in Stroke / Paralysis Rehab, Parkinson\'s & Alzheimer\'s, Facial / Bell\'s Palsy, Vestibular Dysfunction, Cervical & Lumbar Spondylosis, Knee OA, CP Child, Autism, Developmental Delay, Prenatal & Postnatal, Joint Replacement Rehab, and Sports Injury Management.',
    },
    {
      'question': 'How does Home Physiotherapy visit work?',
      'hindi': 'घर पर फिजियोथेरेपी कैसे काम करती है?',
      'answer': 'Our expert physiotherapist visits your home with clinical assessment and therapy equipment for paralysis, stroke, post-operative, and pediatric patients.',
    },
    {
      'question': 'How can I book or reschedule an appointment?',
      'hindi': 'अपॉइंटमेंट कैसे बुक या बदलें?',
      'answer': 'You can book directly via the app booking screen by choosing your service, preferred doctor, and time slot, or call the clinic at +91 98765 43210.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F766E).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.help_center_rounded, color: Color(0xFF0F766E), size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'Frequently Asked Questions',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _faqs.length,
          itemBuilder: (context, index) {
            final faq = _faqs[index];

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
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
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE6F4F1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Q${index + 1}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F766E),
                      ),
                    ),
                  ),
                  title: Text(
                    faq['question']!,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  subtitle: Text(
                    faq['hindi']!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          faq['answer']!,
                          style: const TextStyle(
                            color: Color(0xFF334155),
                            fontSize: 12,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
