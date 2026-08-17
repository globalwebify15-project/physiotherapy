import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../exercises/exercises_provider.dart';
import 'recovery_trend_chart.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;

  // Dynamic Dashboard Data from API and CMS
  String _patientName = 'Rahul';
  List<dynamic> _appointments = [];
  List<dynamic> _services = [];
  
  // CMS Collections
  List<dynamic> _banners = [];
  List<dynamic> _testimonials = [];
  List<dynamic> _faqs = [];
  Map<String, dynamic> _contactDetails = {};

  // Interactive UI State
  final PageController _pageController = PageController();
  int _activePage = 0;
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _fetchDashboardData() async {
    try {
      // 1. Fetch Patient details for name greeting
      try {
        final patientRes = await _apiService.get('/patients');
        if (patientRes.statusCode == 200 && patientRes.data['patient'] != null) {
          _patientName = patientRes.data['patient']['name'] ?? 'Guest';
        }
      } catch (e) {
        print('Info: Could not load dynamic name greeting, using fallback: $e');
      }

      // 2. Fetch Appointments & Services
      final apptsRes = await _apiService.get('/appointments');
      final servicesRes = await _apiService.get('/services');

      // 3. Fetch CMS blocks
      try {
        final bannersRes = await _apiService.get('/cms?key=homepage_banners');
        if (bannersRes.statusCode == 200 && bannersRes.data['content'] != null) {
          _banners = bannersRes.data['content'] as List;
        }
      } catch (e) {
        print('Info: Banners CMS failed, using presets: $e');
      }

      try {
        final testRes = await _apiService.get('/cms?key=testimonials');
        if (testRes.statusCode == 200 && testRes.data['content'] != null) {
          _testimonials = testRes.data['content'] as List;
        }
      } catch (e) {
        print('Info: Testimonials CMS failed: $e');
      }

      try {
        final faqsRes = await _apiService.get('/cms?key=faqs');
        if (faqsRes.statusCode == 200 && faqsRes.data['content'] != null) {
          _faqs = faqsRes.data['content'] as List;
        }
      } catch (e) {
        print('Info: FAQs CMS failed: $e');
      }

      try {
        final contactRes = await _apiService.get('/cms?key=contact_details');
        if (contactRes.statusCode == 200 && contactRes.data['content'] != null) {
          _contactDetails = contactRes.data['content'] as Map<String, dynamic>;
        }
      } catch (e) {
        print('Info: Contact details CMS failed: $e');
      }

      setState(() {
        _appointments = apptsRes.data['appointments'] ?? [];
        _services = servicesRes.data['services'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error fetching dashboard data: $e');
    }
  }

  void _showServiceDetail(dynamic service) {
    final hasImage = service['images'] != null && (service['images'] as List).isNotEmpty;
    final imageUrl = hasImage ? service['images'][0] as String : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300&auto=format&fit=crop';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Image Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.network(
                    imageUrl,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 180,
                      color: const Color(0xFFF1F5F9),
                      child: const Icon(Icons.accessibility_new_rounded, color: Color(0xFF0F766E), size: 48),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Title and Category
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            (service['category'] as String).toUpperCase(),
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F766E), letterSpacing: 1),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            service['title'],
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 12),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'About Treatment',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        service['description'] ?? 'No description available for this service.',
                        style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), height: 1.5),
                      ),
                      const SizedBox(height: 24),

                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Duration', style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF0F766E)),
                                      const SizedBox(width: 4),
                                      Text('${service['duration']} mins', style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.bold)),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Visit Types', style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF0F766E)),
                                      const SizedBox(width: 4),
                                      Text(
                                        (service['clinicVisitAvailable'] == true && service['homeVisitAvailable'] == true)
                                            ? 'Clinic & Home'
                                            : service['clinicVisitAvailable'] == true
                                                ? 'Clinic Only'
                                                : 'Home Visit Only',
                                        style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pricing Options', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 12, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: const [
                                    Icon(Icons.business_rounded, size: 16, color: Color(0xFF3B82F6)),
                                    SizedBox(width: 6),
                                    Text('Clinic Consultation', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E3A8A))),
                                  ],
                                ),
                                Text(
                                  service['clinicVisitAvailable'] == true ? '₹${service['pricingClinic']}' : 'Not Available',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A)),
                                ),
                              ],
                            ),
                            const Divider(height: 20, color: Color(0xFFDBEAFE)),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: const [
                                    Icon(Icons.home_rounded, size: 16, color: Color(0xFF10B981)),
                                    SizedBox(width: 6),
                                    Text('Home Visit Session', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF064E3B))),
                                  ],
                                ),
                                Text(
                                  service['homeVisitAvailable'] == true ? '₹${service['pricingHome']}' : 'Not Available',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF064E3B)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),

                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          context.push('/booking');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 56),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('Book Appointment Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final exercisesList = ref.watch(exercisesProvider);
    final completedCount = exercisesList.where((e) => e.completed).length;
    final totalCount = exercisesList.length;
    final progress = totalCount == 0 ? 0.0 : (completedCount / totalCount);

    final upcomingAppt = _appointments.firstWhere(
      (a) => a['status'] == 'confirmed' || a['status'] == 'assigned' || a['status'] == 'pending',
      orElse: () => null,
    );

    // Extract categories dynamically from services list
    final List<String> categories = ['All'];
    for (var service in _services) {
      final cat = service['category'] as String?;
      if (cat != null && !categories.contains(cat)) {
        categories.add(cat);
      }
    }

    // Filter services dynamically
    final filteredServices = _selectedCategory == 'All'
        ? _services
        : _services.where((s) => s['category'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A)),
            onPressed: () {},
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Color(0xFF0F172A)),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
          : RefreshIndicator(
              onRefresh: _fetchDashboardData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Dynamic greeting name
                    Text(
                      'Hello, $_patientName 👋',
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'How are you feeling today?',
                      style: TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 24),

                    // Top Banner Slider using CMS homepage_banners
                    SizedBox(
                      height: 200,
                      child: PageView(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() => _activePage = index);
                        },
                        children: _banners.isNotEmpty
                            ? _banners.map<Widget>((banner) {
                                var imageUrl = banner['imageUrl'] ?? 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80';
                                if (imageUrl.contains('576765608866') || imageUrl.contains('1576765608866-5b5104814239')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80';
                                }
                                return Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F766E), // Fallback color
                                    borderRadius: BorderRadius.circular(24),
                                    image: DecorationImage(
                                      image: NetworkImage(imageUrl),
                                      fit: BoxFit.cover,
                                      colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.55), BlendMode.darken),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        banner['title'] ?? 'Restore Your Movement',
                                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        banner['subtitle'] ?? 'Expert physiotherapy care at your clinical doorstep.',
                                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: () => context.push(banner['targetRoute'] ?? '/booking'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0F766E),
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          elevation: 0,
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                        ),
                                        child: Text(banner['ctaText'] ?? 'Book Now', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                      )
                                    ],
                                  ),
                                );
                              }).toList()
                            : [
                                // Fallback Preset Slide 1
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF0D9488), Color(0xFF0F766E)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            const Text("Today's Plan", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                            const SizedBox(height: 4),
                                            Text("$completedCount / $totalCount Exercises Completed", style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                            const SizedBox(height: 12),
                                            LinearProgressIndicator(value: progress, backgroundColor: Colors.white24, valueColor: const AlwaysStoppedAnimation(Colors.white)),
                                            const SizedBox(height: 16),
                                            ElevatedButton(
                                              onPressed: () => context.push('/exercises'),
                                              style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF0F766E)),
                                              child: const Text('Continue Plan', style: TextStyle(fontWeight: FontWeight.bold)),
                                            )
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.fitness_center_rounded, size: 72, color: Colors.white24),
                                    ],
                                  ),
                                ),
                              ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Dot Indicators
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_banners.isNotEmpty ? _banners.length : 1, (index) {
                        final isSelected = _activePage == index;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 7,
                          width: isSelected ? 18 : 7,
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 24),

                    // Quick Actions
                    const Text('Quick Actions', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.2,
                      children: [
                        _buildQuickActionCard(
                          icon: Icons.calendar_month_rounded,
                          title: 'Book Session',
                          color: const Color(0xFF3B82F6),
                          onTap: () => context.push('/booking'),
                        ),
                        _buildQuickActionCard(
                          icon: Icons.directions_run_rounded,
                          title: 'My Exercises',
                          color: const Color(0xFF10B981),
                          onTap: () => context.push('/exercises'),
                        ),
                        _buildQuickActionCard(
                          icon: Icons.mood_bad_rounded,
                          title: 'Pain Tracker',
                          color: const Color(0xFFF59E0B),
                          onTap: () => context.push('/pain_tracker'),
                        ),
                        _buildQuickActionCard(
                          icon: Icons.videocam_rounded,
                          title: 'Consult Online',
                          color: const Color(0xFF8B5CF6),
                          onTap: () => context.push('/consult_online'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Categories Filter chips list (Dynamic)
                    const Text('Explore Categories', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 40,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final cat = categories[index];
                          final isSelected = _selectedCategory == cat;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text(cat),
                              selected: isSelected,
                              selectedColor: const Color(0xFF0F766E),
                              disabledColor: Colors.grey.shade100,
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : const Color(0xFF0F172A),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() => _selectedCategory = cat);
                                }
                              },
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Services Listing Grid
                    const Text('Physiotherapy Services', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 12),
                    if (filteredServices.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.0),
                          child: Text('No services found in this category.', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                        ),
                      )
                    else
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredServices.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.75,
                        ),
                        itemBuilder: (context, index) {
                          final service = filteredServices[index];
                          final hasImage = service['images'] != null && (service['images'] as List).isNotEmpty;
                          final imageUrl = hasImage ? service['images'][0] as String : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop';
                          final price = service['clinicVisitAvailable'] == true
                              ? service['pricingClinic']
                              : service['pricingHome'] ?? 0;

                          return GestureDetector(
                            onTap: () => _showServiceDetail(service),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.015),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                    child: Image.network(
                                      imageUrl,
                                      height: 100,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        height: 100,
                                        color: const Color(0xFFF1F5F9),
                                        child: const Icon(Icons.accessibility_new_rounded, color: Color(0xFF0F766E), size: 36),
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(10.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          (service['category'] as String).toUpperCase(),
                                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF0F766E), letterSpacing: 0.8),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          service['title'],
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(Icons.access_time_rounded, size: 11, color: Color(0xFF64748B)),
                                                const SizedBox(width: 2),
                                                Text('${service['duration']} mins', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                                              ],
                                            ),
                                            Text(
                                              '₹$price',
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F766E)),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            if (service['clinicVisitAvailable'] == true)
                                              Container(
                                                margin: const EdgeInsets.only(right: 4),
                                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                                decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4)),
                                                child: const Text('Clinic', style: TextStyle(fontSize: 8, color: Color(0xFF3B82F6), fontWeight: FontWeight.bold)),
                                              ),
                                            if (service['homeVisitAvailable'] == true)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(4)),
                                                child: const Text('Home', style: TextStyle(fontSize: 8, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                                              ),
                                          ],
                                        )
                                      ],
                                    ),
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    const SizedBox(height: 28),

                    // Upcoming Appointment Section
                    const Text('Upcoming Appointment', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 12),
                    if (upcomingAppt != null)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFF1F5F9)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 26,
                              backgroundColor: const Color(0xFFEEF2FF),
                              child: Text(
                                upcomingAppt['therapistId'] is Map && upcomingAppt['therapistId']['name'] != null && (upcomingAppt['therapistId']['name'] as String).isNotEmpty ? upcomingAppt['therapistId']['name'][0] : 'T',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (upcomingAppt['therapistId'] is Map && upcomingAppt['therapistId']['name'] != null) ? upcomingAppt['therapistId']['name'] : 'Auto Assign Therapist',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    (upcomingAppt['serviceId'] is Map && upcomingAppt['serviceId']['title'] != null) ? upcomingAppt['serviceId']['title'] : 'Physiotherapy consultation',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.access_time_filled_rounded, size: 13, color: Color(0xFF0D9488)),
                                      const SizedBox(width: 4),
                                      Text('${upcomingAppt['date']} • ${upcomingAppt['timeSlot']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFF1F5F9)),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              radius: 26,
                              backgroundImage: NetworkImage('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop'),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Dr. Anjali Verma', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A))),
                                  const SizedBox(height: 2),
                                  const Text('Physiotherapist', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: const [
                                      Icon(Icons.access_time_filled_rounded, size: 13, color: Color(0xFF0D9488)),
                                      SizedBox(width: 4),
                                      Text('20 May 2026 • 11:00 AM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    
                    const SizedBox(height: 28),

                    // Testimonials Horizontal Slider Section (CMS Driven)
                    if (_testimonials.isNotEmpty) ...[
                      const Text('What Our Patients Say', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 140,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _testimonials.length,
                          itemBuilder: (context, index) {
                            final test = _testimonials[index];
                            return Container(
                              width: 280,
                              margin: const EdgeInsets.only(right: 12, bottom: 4),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                                boxShadow: [
                                  BoxShadow(color: Colors.black.withOpacity(0.01), blurRadius: 8, offset: const Offset(0, 4))
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(test['name'] ?? 'Anonymous', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                                      Row(
                                        children: List.generate(
                                          (test['rating'] ?? 5) as int,
                                          (index) => const Icon(Icons.star_rounded, size: 14, color: Colors.orange),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(test['designation'] ?? 'Patient', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 8),
                                  Expanded(
                                    child: Text(
                                      test['feedback'] ?? '',
                                      maxLines: 3,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4, fontStyle: FontStyle.italic),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Expandable FAQs Section (CMS Driven)
                    if (_faqs.isNotEmpty) ...[
                      const Text('Frequently Asked Questions', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      const SizedBox(height: 12),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _faqs.length,
                        itemBuilder: (context, index) {
                          final faq = _faqs[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFF1F5F9)),
                            ),
                            child: Theme(
                              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                              child: ExpansionTile(
                                leading: const Icon(Icons.help_center_rounded, color: Color(0xFF0F766E), size: 20),
                                title: Text(faq['question'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 16.0),
                                    child: Text(faq['answer'] ?? '', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Embedded Recovery Analytics Trend Chart
                    const RecoveryTrendChart(),
                    const SizedBox(height: 24),

                    // Clinic Location & Contact details card block (CMS Driven)
                    if (_contactDetails.isNotEmpty) ...[
                      const Text('Clinic Information', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F766E),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFF0F766E).withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 6))
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.local_hospital_rounded, color: Colors.white, size: 20),
                                SizedBox(width: 8),
                                Text('PhysioCare Clinic Hub', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                              ],
                            ),
                            const Divider(height: 24, color: Colors.white24),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.location_on_rounded, color: Colors.white70, size: 16),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _contactDetails['address'] ?? 'Plot 15, Healthcare Hub, Sector 4, New Delhi',
                                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4, fontWeight: FontWeight.w500),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.access_time_filled_rounded, color: Colors.white70, size: 16),
                                const SizedBox(width: 8),
                                Text(_contactDetails['workingHours'] ?? 'Monday - Saturday: 9:00 AM to 7:00 PM', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.phone_rounded, color: Colors.white70, size: 16),
                                const SizedBox(width: 8),
                                Text(_contactDetails['phone'] ?? '+91 98765 43210', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.alternate_email_rounded, color: Colors.white70, size: 16),
                                const SizedBox(width: 8),
                                Text(_contactDetails['email'] ?? 'contact@globalwebify.com', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF0F766E),
        unselectedItemColor: const Color(0xFF94A3B8),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'Bookings'),
          BottomNavigationBarItem(icon: Icon(Icons.directions_run_rounded), label: 'Exercises'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
        onTap: (index) {
          if (index == 1) {
            context.push('/appointments');
          } else if (index == 2) {
            context.push('/exercises');
          } else if (index == 3) {
            context.push('/profile');
          }
        },
      ),
    );
  }
}
