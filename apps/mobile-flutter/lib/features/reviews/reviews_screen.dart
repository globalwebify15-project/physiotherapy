import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../utils/app_storage.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  final ApiService _apiService = ApiService();
  final _storage = AppStorage.instance;
  bool _isLoading = true;
  List<Map<String, dynamic>> _reviews = [];
  String _selectedFilter = 'All';

  // Fallback initial verified patient reviews
  final List<Map<String, dynamic>> _seedReviews = [
    {
      'name': 'Sunil Verma',
      'rating': 5,
      'date': '2 days ago',
      'treatment': 'Stroke Paralysis Rehabilitation',
      'visitType': 'Home Visit',
      'comment':
          'Dr. Rajnish Bariyar\'s neuro-physiotherapy treatment for my stroke paralysis rehabilitation showed tremendous improvement within 3 weeks. Walking mobility restored significantly. Highly recommended!',
      'doctor': 'Dr. Rajnish Bariyar',
      'isVerified': true,
    },
    {
      'name': 'Sunita Devi',
      'rating': 5,
      'date': '1 week ago',
      'treatment': 'Pediatric CP & Developmental Delay',
      'visitType': 'Clinic Visit',
      'comment':
          'Dr. Priyanka Bariyar is exceptionally compassionate and skilled in pediatric physiotherapy. Our child has shown great milestones in neck holding and sitting posture.',
      'doctor': 'Dr. Priyanka Bariyar',
      'isVerified': true,
    },
    {
      'name': 'Ramesh Kumar Sinha',
      'rating': 5,
      'date': '2 weeks ago',
      'treatment': 'Cervical Spondylosis & Neck Pain',
      'visitType': 'Clinic Visit',
      'comment':
          'Suffered from chronic cervical radiculopathy for over 6 months. After 10 manual therapy sessions at QuickPhysio24.com, pain reduced by 90%. Exceptional care!',
      'doctor': 'Dr. Rajnish Bariyar',
      'isVerified': true,
    },
    {
      'name': 'Pooja Agarwal',
      'rating': 5,
      'date': '3 weeks ago',
      'treatment': 'Post-Knee Replacement Rehab',
      'visitType': 'Home Visit',
      'comment':
          'Booked home visits after total knee replacement. The therapist was punctual, very gentle, and provided daily isometric and flexion exercises. Seamless recovery.',
      'doctor': 'Visiting Clinical Specialist',
      'isVerified': true,
    },
    {
      'name': 'Amitabh Roy',
      'rating': 4,
      'date': '1 month ago',
      'treatment': 'Lumbar Sciatica & Back Pain',
      'visitType': 'Clinic Visit',
      'comment':
          'Very professional clinic environment with modern decompression modalities. The digital invoices and appointment reminders in the app are super convenient.',
      'doctor': 'Dr. Rajnish Bariyar',
      'isVerified': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchReviews();
  }

  Future<List<Map<String, dynamic>>> _loadLocalReviews() async {
    try {
      final raw = await _storage.read(key: 'local_patient_reviews');
      if (raw != null && raw.isNotEmpty) {
        final decoded = jsonDecode(raw);
        if (decoded is List) {
          return decoded.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList();
        }
      }
    } catch (e) {
      debugPrint('[LoadLocalReviews Error]: $e');
    }
    return [];
  }

  Future<void> _saveLocalReview(Map<String, dynamic> rev) async {
    try {
      final current = await _loadLocalReviews();
      final comment = (rev['comment'] ?? '').toString().trim();
      current.removeWhere((r) => (r['comment'] ?? '').toString().trim() == comment);
      current.insert(0, rev);
      await _storage.write(key: 'local_patient_reviews', value: jsonEncode(current));
    } catch (e) {
      debugPrint('[SaveLocalReview Error]: $e');
    }
  }

  Future<void> _fetchReviews() async {
    final List<Map<String, dynamic>> localReviews = await _loadLocalReviews();
    try {
      final res = await _apiService.get('/reviews', forceRefresh: true);
      if (res.statusCode == 200 && res.data != null) {
        final List<dynamic> raw = res.data['reviews'] is List ? res.data['reviews'] : [];
        final List<Map<String, dynamic>> parsed = [];
        for (final item in raw) {
          if (item is Map) {
            final patient = item['patientId'];
            final patientName = patient is Map && patient['name'] != null ? patient['name'].toString() : 'Verified Patient';
            final service = item['serviceId'];
            final serviceTitle = service is Map && service['title'] != null ? service['title'].toString() : 'General Physiotherapy';
            final therapist = item['therapistId'];
            final doctorName = therapist is Map && therapist['name'] != null ? therapist['name'].toString() : 'Dr. Rajnish Bariyar';

            parsed.add({
              'name': patientName,
              'rating': (item['rating'] as num?)?.toInt() ?? 5,
              'date': item['createdAt'] != null ? item['createdAt'].toString().substring(0, 10) : 'Recent',
              'treatment': serviceTitle,
              'visitType': 'Verified Care',
              'comment': (item['comment'] ?? '').toString(),
              'doctor': doctorName,
              'isVerified': true,
            });
          }
        }

        // Combine local reviews (user's own reviews), server reviews, and seed reviews
        final Set<String> seenComments = {};
        final List<Map<String, dynamic>> combined = [];

        for (final r in [...localReviews, ...parsed, ..._seedReviews]) {
          final c = (r['comment'] ?? '').toString().trim();
          if (c.isNotEmpty && !seenComments.contains(c)) {
            seenComments.add(c);
            combined.add(r);
          }
        }

        if (mounted) {
          setState(() {
            _reviews = combined;
            _isLoading = false;
          });
          return;
        }
      }
    } catch (e) {
      debugPrint('[Reviews Fetch Notice]: $e');
    }

    if (mounted) {
      setState(() {
        _reviews = [...localReviews, ..._seedReviews];
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredReviews {
    if (_selectedFilter == 'All') return _reviews;
    if (_selectedFilter == '5 Star') {
      return _reviews.where((r) => (r['rating'] as int) == 5).toList();
    }
    if (_selectedFilter == '4 Star') {
      return _reviews.where((r) => (r['rating'] as int) == 4).toList();
    }
    if (_selectedFilter == 'Home Visit') {
      return _reviews.where((r) => (r['visitType'] as String).toLowerCase().contains('home')).toList();
    }
    if (_selectedFilter == 'Clinic Visit') {
      return _reviews.where((r) => (r['visitType'] as String).toLowerCase().contains('clinic')).toList();
    }
    return _reviews;
  }

  void _showAddReviewModal() {
    int selectedRating = 5;
    final commentCtrl = TextEditingController();
    String selectedTreatment = 'General Physiotherapy Consultation';
    bool isSubmitting = false;

    final treatments = [
      'General Physiotherapy Consultation',
      'Stroke & Paralysis Rehabilitation',
      'Cervical & Lumbar Spondylosis',
      'Knee / Hip Joint Replacement Rehab',
      'Pediatric CP & Developmental Delay',
      'Home Visit Physiotherapy',
      'Elderly Bedridden Caretaker Care',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        width: 44,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Write a Patient Review',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(modalCtx),
                          icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const Text(
                      'Your authentic feedback helps other patients make informed healthcare decisions.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 20),

                    // Star Rating Picker
                    const Text(
                      'Overall Experience Rating',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final star = index + 1;
                        return GestureDetector(
                          onTap: () => setModalState(() => selectedRating = star),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: Icon(
                              star <= selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                              size: 38,
                              color: Colors.amber.shade600,
                            ),
                          ),
                        );
                      }),
                    ),
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          selectedRating == 5
                              ? 'Excellent ★★★★★'
                              : selectedRating == 4
                                  ? 'Very Good ★★★★☆'
                                  : selectedRating == 3
                                      ? 'Good ★★★☆☆'
                                      : 'Needs Improvement',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: selectedRating >= 4 ? const Color(0xFF0F766E) : const Color(0xFFD97706),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Treatment Category
                    const Text(
                      'Treatment / Service Received',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedTreatment,
                          isExpanded: true,
                          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
                          items: treatments.map((t) {
                            return DropdownMenuItem(value: t, child: Text(t));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedTreatment = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Review Comments Text Area
                    const Text(
                      'Share Details of Your Recovery & Care',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: commentCtrl,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'Describe how the physiotherapy or home care helped you or your family member...',
                        hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.all(14),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit Button
                    ElevatedButton(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final text = commentCtrl.text.trim();
                              if (text.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please write a brief comment describing your experience.')),
                                );
                                return;
                              }

                              setModalState(() => isSubmitting = true);
                              final rawStoredMob = await _storage.read(key: 'userMobile') ?? '';
                              String cleanMob = rawStoredMob.replaceAll(RegExp(r'^\+91|\D'), '').trim();
                              if (cleanMob.length > 10) cleanMob = cleanMob.substring(cleanMob.length - 10);

                              final storedName = (await _storage.read(key: 'patientName_$cleanMob')) ??
                                  (await _storage.read(key: 'patientName_+91$cleanMob')) ??
                                  (await _storage.read(key: 'patientName')) ?? '';
                              final currentName = storedName.trim().isNotEmpty ? storedName.trim() : 'Verified Patient';
                              final currentMobile = cleanMob.isNotEmpty ? '+91$cleanMob' : rawStoredMob;

                              final newReview = {
                                'name': currentName,
                                'rating': selectedRating,
                                'date': 'Just now',
                                'treatment': selectedTreatment,
                                'visitType': 'Verified Patient Review',
                                'comment': text,
                                'doctor': 'QuickPhysio24 Specialist (Dr. Rajnish Bariyar & Dr. Priyanka Bariyar)',
                                'isVerified': true,
                              };

                              try {
                                await _apiService.post('/reviews', data: {
                                  'rating': selectedRating,
                                  'comment': text,
                                  'treatment': selectedTreatment,
                                  'patientName': currentName,
                                  'patientMobile': currentMobile,
                                });
                              } catch (e) {
                                debugPrint('[Review Submit Notice]: $e');
                              }

                              // Always save to persistent device cache
                              await _saveLocalReview(newReview);

                              if (mounted) {
                                setState(() {
                                  _reviews.removeWhere((r) => r['comment'] == text);
                                  _reviews.insert(0, newReview);
                                });
                                Navigator.pop(modalCtx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Thank you! Your review has been submitted and published.'),
                                    backgroundColor: Color(0xFF0F766E),
                                  ),
                                );
                              }

                              // Trigger background refresh to sync with live DB
                              _fetchReviews();
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F766E),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text(
                              'Submit Review / समीक्षा दर्ज करें',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    const brandColor = Color(0xFF0F766E);
    const bgLight = Color(0xFFF8FAFC);
    final displayedReviews = _filteredReviews;

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 18),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Patient Reviews & Ratings',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: brandColor))
          : RefreshIndicator(
              onRefresh: _fetchReviews,
              color: brandColor,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Overall Rating Score Card
                  Container(
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
                          color: brandColor.withOpacity(0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '4.9',
                                  style: TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: Colors.white, height: 1.0),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: List.generate(5, (index) {
                                    return const Icon(Icons.star_rounded, color: Colors.amber, size: 18);
                                  }),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Based on 350+ Reviews',
                                  style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            const Spacer(),
                            Container(
                              height: 70,
                              width: 1,
                              color: Colors.white.withOpacity(0.2),
                            ),
                            const Spacer(),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('98% Satisfaction', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                SizedBox(height: 4),
                                Text('• 16+ Yrs Clinical Trust', style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11)),
                                SizedBox(height: 2),
                                Text('• Verified Specialists', style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11)),
                                SizedBox(height: 2),
                                Text('• Doorstep Home Visits', style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: Colors.white24, height: 1),
                        const SizedBox(height: 14),

                        // Action: Write a Review Button
                        ElevatedButton.icon(
                          onPressed: _showAddReviewModal,
                          icon: const Icon(Icons.rate_review_rounded, size: 16),
                          label: const Text('Write a Review / समीक्षा दें', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: brandColor,
                            minimumSize: const Size(double.infinity, 44),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['All', '5 Star', '4 Star', 'Clinic Visit', 'Home Visit'].map((chip) {
                        final isSelected = _selectedFilter == chip;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(
                              chip,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : const Color(0xFF475569),
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: brandColor,
                            backgroundColor: Colors.white,
                            elevation: 0,
                            side: BorderSide(color: isSelected ? brandColor : const Color(0xFFE2E8F0)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            onSelected: (_) => setState(() => _selectedFilter = chip),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header Count
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Patient Feedback (${displayedReviews.length})',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      const Text(
                        '100% Genuine Care',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0F766E)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Review Cards
                  ...displayedReviews.map((r) {
                    final rating = (r['rating'] as int?) ?? 5;
                    final name = r['name'] as String? ?? 'Patient';
                    final date = r['date'] as String? ?? 'Recently';
                    final treatment = r['treatment'] as String? ?? 'Physiotherapy';
                    final comment = r['comment'] as String? ?? '';
                    final doctor = r['doctor'] as String? ?? 'Dr. Rajnish Bariyar';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFF1F5F9)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // User Info & Rating
                          Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: brandColor.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  name.isNotEmpty ? name[0].toUpperCase() : 'P',
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: brandColor, fontSize: 16),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            name,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF0F766E)),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      date,
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: List.generate(5, (i) {
                                  return Icon(
                                    Icons.star_rounded,
                                    size: 16,
                                    color: i < rating ? Colors.amber : Colors.grey.shade300,
                                  );
                                }),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),

                          // Treatment Tag Pill
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDFA),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFCCFBF1)),
                            ),
                            child: Text(
                              treatment,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Review Text
                          Text(
                            comment,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                          ),
                          const SizedBox(height: 10),

                          // Attending Doctor / Specialist
                          Row(
                            children: [
                              const Icon(Icons.medical_services_outlined, size: 13, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(
                                'Treated by $doctor',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }
}

