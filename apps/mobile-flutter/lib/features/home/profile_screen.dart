import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/api_service.dart';
import 'recovery_trend_chart.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;
  String _name = 'Patient Profile';
  String _mobile = '';
  String _photoUrl = '';
  List<String> _medicalHistory = [];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final response = await _apiService.get('/patients');
      if (response.statusCode == 200 && response.data['patient'] != null) {
        final patient = response.data['patient'];
        setState(() {
          _name = patient['name'] ?? 'Patient Profile';
          _mobile = patient['userId'] is Map ? (patient['userId']['mobile'] ?? '') : '';
          _photoUrl = patient['profilePhoto'] ?? '';
          if (patient['medicalHistory'] != null) {
            _medicalHistory = List<String>.from(patient['medicalHistory']);
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error fetching patient profile: $e');
    }
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDestructive ? Colors.red.withOpacity(0.1) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: isDestructive ? Colors.red : const Color(0xFF64748B), size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 14,
          color: isDestructive ? Colors.red : const Color(0xFF0F172A),
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF94A3B8)),
      onTap: onTap,
    );
  }

  void _showMedicalHistoryDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Medical History', style: TextStyle(fontWeight: FontWeight.bold)),
          content: _medicalHistory.isEmpty
              ? const Text('No medical history specified.', style: TextStyle(color: Color(0xFF64748B)))
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: _medicalHistory.map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF0F766E), size: 18),
                          const SizedBox(width: 8),
                          Text(item, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                        ],
                      ),
                    );
                  }).toList(),
                ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close', style: TextStyle(color: Color(0xFF0F766E), fontWeight: FontWeight.bold)),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final avatarImage = _photoUrl.isNotEmpty
        ? NetworkImage(_photoUrl)
        : const NetworkImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop') as ImageProvider;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF0F172A)),
            onPressed: () => context.push('/settings'),
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    const SizedBox(height: 24),
                    
                    // Avatar and Name
                    CircleAvatar(
                      radius: 48,
                      backgroundImage: avatarImage,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _name,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _mobile.isNotEmpty ? '+91 $_mobile' : '',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => context.push('/edit_profile').then((_) => _loadProfile()),
                      style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F766E)),
                      child: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 16),
                    
                    // Custom Recovery Chart
                    const RecoveryTrendChart(),
                    
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 12),

                    // Profile Options
                    _buildProfileOption(
                      icon: Icons.calendar_today_rounded,
                      title: 'My Appointments',
                      onTap: () => context.push('/appointments'),
                    ),
                    _buildProfileOption(
                      icon: Icons.assignment_rounded,
                      title: 'My Plans',
                      onTap: () => context.push('/exercises'),
                    ),
                    _buildProfileOption(
                      icon: Icons.history_rounded,
                      title: 'Medical History',
                      onTap: _showMedicalHistoryDialog,
                    ),
                    _buildProfileOption(
                      icon: Icons.logout_rounded,
                      title: 'Log Out',
                      isDestructive: true,
                      onTap: () async {
                        const storage = FlutterSecureStorage();
                        await storage.deleteAll();
                        if (context.mounted) {
                          context.go('/login');
                        }
                      },
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 3,
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
          if (index == 0) {
            context.go('/home');
          } else if (index == 1) {
            context.push('/appointments');
          } else if (index == 2) {
            context.push('/exercises');
          }
        },
      ),
    );
  }
}
