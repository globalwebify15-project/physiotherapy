import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/api_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/app_bottom_nav.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _storage = const FlutterSecureStorage();
  final _apiService = ApiService();
  final _picker = ImagePicker();
  bool _isLoading = true;

  // Patient Profile Fields
  String _name = 'Amarjeet Pandey';
  String _mobile = '9334306358';
  String _email = 'amarjeet@globalwebify.com';
  String _photoUrl = '';
  String _gender = 'male';
  String _dob = '1995-06-15T00:00:00.000Z';
  String _address = 'Ashok Nagar, Ranchi, Jharkhand';
  String _emergencyContact = 'Pooja Pandey (+91 91109 12544)';
  List<String> _medicalHistory = ['Post-Surgery Rehab', 'Routine Physiotherapy Checkup'];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  /// Calculates dynamic profile completion percentage strictly based on filled fields
  int _calculateProfileCompletion() {
    int score = 0;
    if (_name.trim().isNotEmpty && _name != 'Patient') score += 15;
    if (_mobile.trim().isNotEmpty) score += 15;
    if (_email.trim().isNotEmpty && _email.contains('@')) score += 15;
    if (_photoUrl.trim().isNotEmpty) score += 15;
    if (_address.trim().isNotEmpty) score += 15;
    if (_emergencyContact.trim().isNotEmpty) score += 10;
    if (_medicalHistory.isNotEmpty) score += 15;
    return score.clamp(0, 100);
  }

  Widget _buildInitialsAvatar() {
    final parts = _name.trim().split(' ').where((e) => e.isNotEmpty).toList();
    String initials = 'AP';
    if (parts.length >= 2) {
      initials = '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (parts.isNotEmpty && parts[0].isNotEmpty) {
      initials = parts[0][0].toUpperCase();
    }
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: Colors.white,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildAvatarImage(String photoData, {double size = 96}) {
    if (photoData.isEmpty) {
      return _buildInitialsAvatar();
    }
    if (photoData.startsWith('data:image')) {
      try {
        final base64String = photoData.split(',').last;
        final bytes = base64Decode(base64String);
        return Image.memory(
          bytes,
          fit: BoxFit.cover,
          width: size,
          height: size,
          errorBuilder: (_, __, ___) => _buildInitialsAvatar(),
        );
      } catch (_) {
        return _buildInitialsAvatar();
      }
    }
    if (photoData.startsWith('http://') || photoData.startsWith('https://')) {
      return Image.network(
        photoData,
        fit: BoxFit.cover,
        width: size,
        height: size,
        errorBuilder: (_, __, ___) => _buildInitialsAvatar(),
      );
    }
    return _buildInitialsAvatar();
  }

  Future<void> _loadProfile() async {
    // 1. Load from storage
    final cachedName = await _storage.read(key: 'patientName');
    final cachedMobile = await _storage.read(key: 'userMobile') ?? await _storage.read(key: 'patientMobile');
    final cachedPhoto = await _storage.read(key: 'patientPhoto');
    final cachedEmail = await _storage.read(key: 'patientEmail');
    final cachedAddress = await _storage.read(key: 'patientAddress');
    final historyRaw = await _storage.read(key: 'patientMedicalHistory');

    if (mounted) {
      setState(() {
        if (cachedName != null && cachedName.isNotEmpty) _name = cachedName;
        if (cachedMobile != null && cachedMobile.isNotEmpty) _mobile = cachedMobile;
        if (cachedPhoto != null) _photoUrl = cachedPhoto;
        if (cachedEmail != null && cachedEmail.isNotEmpty) _email = cachedEmail;
        if (cachedAddress != null && cachedAddress.isNotEmpty) _address = cachedAddress;
        if (historyRaw != null && historyRaw.isNotEmpty) {
          _medicalHistory = historyRaw.split('|||').where((e) => e.isNotEmpty).toList();
        }
      });
    }

    // 2. Refresh from backend API
    try {
      final response = await _apiService.get('/patients');
      if (response.statusCode == 200 && response.data['patient'] != null) {
        final patient = response.data['patient'];
        final fetchedName = patient['name'];
        final fetchedMobile = patient['userId'] is Map ? (patient['userId']['mobile'] ?? '') : '';
        final fetchedEmail = patient['userId'] is Map ? (patient['userId']['email'] ?? '') : '';
        final photo = patient['profilePhoto'] ?? '';
        final addr = patient['address'] ?? '';
        final gender = patient['gender'] ?? 'male';
        final dob = patient['dob'] ?? '';

        if (fetchedName != null) await _storage.write(key: 'patientName', value: fetchedName);
        if (fetchedMobile.isNotEmpty) await _storage.write(key: 'userMobile', value: fetchedMobile);
        if (photo.isNotEmpty) await _storage.write(key: 'patientPhoto', value: photo);

        if (patient['emergencyContact'] is Map) {
          final ecName = patient['emergencyContact']['name'] ?? '';
          final ecPhone = patient['emergencyContact']['phone'] ?? '';
          if (ecName.isNotEmpty) _emergencyContact = '$ecName ($ecPhone)';
        }

        if (mounted) {
          setState(() {
            if (fetchedName != null && fetchedName.isNotEmpty) _name = fetchedName;
            if (fetchedMobile.isNotEmpty) _mobile = fetchedMobile;
            if (fetchedEmail.isNotEmpty) _email = fetchedEmail;
            if (photo.isNotEmpty) _photoUrl = photo;
            if (addr.isNotEmpty) _address = addr;
            _gender = gender;
            _dob = dob;
            if (patient['medicalHistory'] != null) {
              _medicalHistory = List<String>.from(patient['medicalHistory']);
            }
            _isLoading = false;
          });
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  /// Pick image file directly from local device gallery/camera and store locally
  Future<void> _pickAndSavePhoto({ImageSource source = ImageSource.gallery}) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 600,
        maxHeight: 600,
        imageQuality: 85,
      );

      if (file != null) {
        final bytes = await file.readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';

        setState(() {
          _photoUrl = base64Image;
        });

        await _storage.write(key: 'patientPhoto', value: base64Image);
        try {
          await _apiService.post('/patients', data: {
            'name': _name,
            'profilePhoto': base64Image,
          });
        } catch (_) {}

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile photo uploaded and stored locally!'),
              backgroundColor: Color(0xFF0F766E),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not upload image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Direct File Upload Action Sheet
  void _showPhotoUploadModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
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
              const SizedBox(height: 18),
              const Text(
                'Upload Profile Photo',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              const Text(
                'Select an image from your device to save locally',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),

              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F766E).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: Color(0xFF0F766E)),
                ),
                title: const Text('Choose from Gallery / Files', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: const Text('Pick any PNG, JPG or WEBP image', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                onTap: () {
                  Navigator.pop(modalCtx);
                  _pickAndSavePhoto(source: ImageSource.gallery);
                },
              ),
              const SizedBox(height: 10),

              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD97706).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: Color(0xFFD97706)),
                ),
                title: const Text('Take a New Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: const Text('Use camera to capture profile picture', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                onTap: () {
                  Navigator.pop(modalCtx);
                  _pickAndSavePhoto(source: ImageSource.camera);
                },
              ),

              if (_photoUrl.isNotEmpty) ...[
                const SizedBox(height: 10),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.red.shade100),
                  ),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                  ),
                  title: const Text('Remove Current Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.red)),
                  onTap: () async {
                    Navigator.pop(modalCtx);
                    setState(() {
                      _photoUrl = '';
                    });
                    await _storage.delete(key: 'patientPhoto');
                    try {
                      await _apiService.post('/patients', data: {'profilePhoto': ''});
                    } catch (_) {}
                  },
                ),
              ],
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  /// Dynamic Medical History Modal with Add / Delete
  void _showDynamicMedicalHistoryModal() {
    final newConditionController = TextEditingController();
    final List<String> quickSuggestions = [
      'Cervical Spondylosis',
      'Lumbar Disc Herniation',
      'Frozen Shoulder',
      'Knee Osteoarthritis',
      'Post-Stroke Rehabilitation',
      'Sciatica Nerve Pain',
      'Sports Ligament Injury',
      'Tennis Elbow Strain',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.82,
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Medical History & Conditions',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${_medicalHistory.length} Recorded Conditions',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF0F766E), fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(modalCtx),
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                      )
                    ],
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),

                  // Add new condition input
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: newConditionController,
                          decoration: InputDecoration(
                            hintText: 'Enter condition (e.g. Back Pain)',
                            hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () async {
                          final text = newConditionController.text.trim();
                          if (text.isNotEmpty && !_medicalHistory.contains(text)) {
                            setModalState(() {
                              _medicalHistory.add(text);
                            });
                            setState(() {});
                            newConditionController.clear();
                            await _persistMedicalHistory();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold)),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Quick Suggestion Chips
                  const Text('Quick Suggestions:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 6),
                  SizedBox(
                    height: 36,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: quickSuggestions.map((suggestion) {
                        final isAlreadyAdded = _medicalHistory.contains(suggestion);
                        return Padding(
                          padding: const EdgeInsets.only(right: 6.0),
                          child: ActionChip(
                            label: Text(
                              suggestion,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isAlreadyAdded ? const Color(0xFF94A3B8) : const Color(0xFF0F766E),
                              ),
                            ),
                            backgroundColor: isAlreadyAdded ? const Color(0xFFF1F5F9) : const Color(0xFFF0FDFA),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                              side: BorderSide(color: isAlreadyAdded ? const Color(0xFFE2E8F0) : const Color(0xFFCCFBF1)),
                            ),
                            onPressed: isAlreadyAdded
                                ? null
                                : () async {
                                    setModalState(() {
                                      _medicalHistory.add(suggestion);
                                    });
                                    setState(() {});
                                    await _persistMedicalHistory();
                                  },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Active Conditions List
                  Expanded(
                    child: _medicalHistory.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.medical_information_outlined, size: 48, color: Color(0xFFCBD5E1)),
                                SizedBox(height: 8),
                                Text(
                                  'No medical history conditions recorded.',
                                  style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: _medicalHistory.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final item = _medicalHistory[index];
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.check_circle_rounded, color: Color(0xFF0F766E), size: 20),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        item,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                                      onPressed: () async {
                                        setModalState(() {
                                          _medicalHistory.removeAt(index);
                                        });
                                        setState(() {});
                                        await _persistMedicalHistory();
                                      },
                                    )
                                  ],
                                ),
                              );
                            },
                          ),
                  ),

                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(modalCtx),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _persistMedicalHistory() async {
    await _storage.write(key: 'patientMedicalHistory', value: _medicalHistory.join('|||'));
    try {
      await _apiService.post('/patients', data: {
        'name': _name,
        'medicalHistory': _medicalHistory,
      });
    } catch (_) {}
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDestructive ? Colors.red.withOpacity(0.1) : const Color(0xFF0F766E).withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            color: isDestructive ? Colors.red : const Color(0xFF0F766E),
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: isDestructive ? Colors.red : const Color(0xFF0F172A),
          ),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)))
            : null,
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF94A3B8)),
        onTap: onTap,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final completionPct = _calculateProfileCompletion();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // 1. Header with App Name and Settings shortcut
          AppHeader(
            title: 'My Profile',
            showBack: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
                onPressed: () => context.push('/settings'),
              ),
            ],
          ),

          // 2. Profile Details & Dynamic Metrics
          Expanded(
            child: _isLoading && _name == 'Patient'
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                : RefreshIndicator(
                    onRefresh: _loadProfile,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        children: [
                          const SizedBox(height: 18),

                          // Profile Photo & Name Card
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: const Color(0xFFF1F5F9)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.02),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: Column(
                              children: [
                                GestureDetector(
                                  onTap: _showPhotoUploadModal,
                                  child: Stack(
                                    alignment: Alignment.bottomRight,
                                    children: [
                                      Container(
                                        width: 96,
                                        height: 96,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          gradient: const LinearGradient(
                                            colors: [Color(0xFF0F766E), Color(0xFF042F2E)],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(0xFF0F766E).withOpacity(0.25),
                                              blurRadius: 14,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                          border: Border.all(color: const Color(0xFFF59E0B), width: 2.5),
                                        ),
                                        child: ClipOval(
                                          child: _buildAvatarImage(_photoUrl, size: 96),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.all(7),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF0F766E),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.white, width: 2),
                                        ),
                                        child: const Icon(Icons.camera_alt_rounded, size: 14, color: Colors.white),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _name,
                                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  _mobile.isNotEmpty ? '+91 $_mobile' : '+91 93343 06358',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                ),
                                const SizedBox(height: 14),

                                // Upload Photo & Edit Profile action row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    OutlinedButton.icon(
                                      onPressed: _showPhotoUploadModal,
                                      icon: const Icon(Icons.photo_camera_outlined, size: 15),
                                      label: const Text('Upload Photo'),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFF0F766E),
                                        side: const BorderSide(color: Color(0xFF0F766E)),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    ElevatedButton.icon(
                                      onPressed: () => context.push('/edit_profile').then((_) => _loadProfile()),
                                      icon: const Icon(Icons.edit_note_rounded, size: 16),
                                      label: const Text('Edit Info'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F766E),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Dynamic Profile Completion Card (Calculated dynamically, Active Care Plan removed)
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.02),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                )
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0F766E).withOpacity(0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.verified_user_rounded, color: Color(0xFF0F766E), size: 20),
                                        ),
                                        const SizedBox(width: 10),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '$completionPct% Profile Completed',
                                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                            ),
                                            Text(
                                              completionPct == 100 ? 'Fully Verified Patient' : 'Complete details to get 100% verified',
                                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: completionPct == 100 ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                          color: completionPct == 100 ? const Color(0xFF6EE7B7) : const Color(0xFFFDE68A),
                                        ),
                                      ),
                                      child: Text(
                                        completionPct == 100 ? 'Verified' : 'In Progress',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: completionPct == 100 ? const Color(0xFF059669) : const Color(0xFFD97706),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(6),
                                  child: LinearProgressIndicator(
                                    value: completionPct / 100.0,
                                    backgroundColor: const Color(0xFFF1F5F9),
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      completionPct == 100 ? const Color(0xFF10B981) : const Color(0xFF0F766E),
                                    ),
                                    minHeight: 8,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Profile Menu Options
                          _buildProfileOption(
                            icon: Icons.calendar_month_rounded,
                            title: 'My Bookings & Appointments',
                            subtitle: 'View upcoming & past scheduled visits',
                            onTap: () => context.push('/appointments'),
                          ),
                          _buildProfileOption(
                            icon: Icons.medical_services_rounded,
                            title: 'All Clinical Services',
                            subtitle: 'Explore 16+ specialized physio treatments',
                            onTap: () => context.push('/all_services'),
                          ),
                          _buildProfileOption(
                            icon: Icons.percent_rounded,
                            title: 'Offers & Special Packages',
                            subtitle: 'Discounted home care & rehab plans',
                            onTap: () => context.push('/offers'),
                          ),
                          _buildProfileOption(
                            icon: Icons.history_rounded,
                            title: 'Medical History',
                            subtitle: '${_medicalHistory.length} conditions tracked • Click to manage',
                            onTap: _showDynamicMedicalHistoryModal,
                          ),
                          _buildProfileOption(
                            icon: Icons.settings_rounded,
                            title: 'App Settings',
                            subtitle: 'Preferences, audio cues & cache control',
                            onTap: () => context.push('/settings').then((_) => _loadProfile()),
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
                          const SizedBox(height: 48),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 4),
    );
  }
}
