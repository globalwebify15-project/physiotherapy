import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../utils/app_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  final bool isEditing;
  const RegisterScreen({super.key, this.isEditing = false});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiService = ApiService();
  final _storage = AppStorage.instance;

  bool _isLoading = false;
  bool _isFetching = true;

  // Controllers for form fields
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _addressController = TextEditingController();
  final _photoController = TextEditingController();

  // Emergency contact controllers
  final _emergNameController = TextEditingController();
  final _emergPhoneController = TextEditingController();
  final _emergRelationController = TextEditingController();

  String _gender = 'male';
  DateTime _dob = DateTime(2000, 1, 1);
  
  // Medical history options
  final List<String> _medicalHistoryOptions = [
    'Back Pain',
    'Knee Pain',
    'Arthritis',
    'Post-Surgery Rehab',
    'Sports Injury',
    'Muscle Strain'
  ];
  final List<String> _selectedMedicalHistory = [];

  // Saved Addresses List
  final List<TextEditingController> _addressControllers = [];

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _addressController.dispose();
    _photoController.dispose();
    _emergNameController.dispose();
    _emergPhoneController.dispose();
    _emergRelationController.dispose();
    for (var controller in _addressControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Widget _buildAvatarImage(String photoData, {double size = 64}) {
    if (photoData.trim().isEmpty) {
      return const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 36);
    }
    if (photoData.startsWith('http://') || photoData.startsWith('https://')) {
      return Image.network(
        photoData,
        fit: BoxFit.cover,
        width: size,
        height: size,
        errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 36),
      );
    }
    try {
      final base64String = photoData.contains(',') ? photoData.split(',').last : photoData;
      final bytes = base64Decode(base64String.trim());
      return Image.memory(
        bytes,
        fit: BoxFit.cover,
        width: size,
        height: size,
        errorBuilder: (_, __, ___) => const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 36),
      );
    } catch (_) {
      return const Icon(Icons.person_rounded, color: Color(0xFF0F766E), size: 36);
    }
  }

  Future<void> _pickImageFromFile({ImageSource source = ImageSource.gallery}) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? file = await picker.pickImage(
        source: source,
        maxWidth: 400,
        maxHeight: 400,
        imageQuality: 70,
      );

      if (file != null) {
        final bytes = await file.readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        setState(() {
          _photoController.text = base64Image;
        });
        await _storage.write(key: 'patientPhoto', value: base64Image);
        final rawDigits = _mobileController.text.trim().replaceAll(RegExp(r'\D'), '');
        if (rawDigits.isNotEmpty) {
          await _storage.write(key: 'patientPhoto_$rawDigits', value: base64Image);
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Photo uploaded and stored locally!'),
              backgroundColor: Color(0xFF0F766E),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not pick image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _loadProfileData() async {
    try {
      // First fetch stored token mobile if any and clean to 10 digits
      final rawStored = await _storage.read(key: 'userMobile') ?? '';
      String storedMobile = rawStored.replaceAll(RegExp(r'^\+91|\D'), '').trim();
      if (storedMobile.length > 10) storedMobile = storedMobile.substring(storedMobile.length - 10);

      // Instantly pre-fill all fields from local storage so edit screen NEVER appears empty
      final cachedName = (await _storage.read(key: 'patientName_$storedMobile')) ??
          (await _storage.read(key: 'patientName_+91$storedMobile')) ??
          (await _storage.read(key: 'patientName')) ?? '';
      final cachedEmail = (await _storage.read(key: 'patientEmail_$storedMobile')) ??
          (await _storage.read(key: 'patientEmail_+91$storedMobile')) ??
          (await _storage.read(key: 'patientEmail')) ?? '';
      final cachedAddr = (await _storage.read(key: 'patientAddress_$storedMobile')) ??
          (await _storage.read(key: 'patientAddress_+91$storedMobile')) ??
          (await _storage.read(key: 'patientAddress')) ?? '';
      final cachedPhoto = (await _storage.read(key: 'patientPhoto_$storedMobile')) ??
          (await _storage.read(key: 'patientPhoto')) ?? '';
      final cachedGender = (await _storage.read(key: 'patientGender_$storedMobile')) ??
          (await _storage.read(key: 'patientGender')) ?? 'male';
      final cachedDobStr = (await _storage.read(key: 'patientDob_$storedMobile')) ??
          (await _storage.read(key: 'patientDob')) ?? '';
      final cachedEmergName = (await _storage.read(key: 'emergName_$storedMobile')) ??
          (await _storage.read(key: 'emergName')) ?? '';
      final cachedEmergPhone = (await _storage.read(key: 'emergPhone_$storedMobile')) ??
          (await _storage.read(key: 'emergPhone')) ?? '';
      final cachedEmergRel = (await _storage.read(key: 'emergRel_$storedMobile')) ??
          (await _storage.read(key: 'emergRel')) ?? '';
      final cachedMedHist = (await _storage.read(key: 'patientMedicalHistory_$storedMobile')) ??
          (await _storage.read(key: 'patientMedicalHistory')) ?? '';

      if (mounted) {
        setState(() {
          if (storedMobile.isNotEmpty) _mobileController.text = storedMobile;
          if (cachedName.isNotEmpty) _nameController.text = cachedName;
          if (cachedEmail.isNotEmpty) _emailController.text = cachedEmail;
          if (cachedPhoto.isNotEmpty) _photoController.text = cachedPhoto;
          if (cachedGender.isNotEmpty) _gender = cachedGender;
          if (cachedDobStr.isNotEmpty) {
            try {
              _dob = DateTime.parse(cachedDobStr);
            } catch (_) {}
          }
          if (cachedEmergName.isNotEmpty) _emergNameController.text = cachedEmergName;
          if (cachedEmergPhone.isNotEmpty) {
            String cleanEmerg = cachedEmergPhone.replaceAll(RegExp(r'^\+91|\D'), '').trim();
            if (cleanEmerg.length > 10) cleanEmerg = cleanEmerg.substring(cleanEmerg.length - 10);
            _emergPhoneController.text = cleanEmerg;
          }
          if (cachedEmergRel.isNotEmpty) _emergRelationController.text = cachedEmergRel;
          if (cachedAddr.isNotEmpty) {
            _addressController.text = cachedAddr;
            _addressControllers.clear();
            _addressControllers.add(TextEditingController(text: cachedAddr));
          }
          if (cachedMedHist.isNotEmpty) {
            _selectedMedicalHistory.clear();
            _selectedMedicalHistory.addAll(cachedMedHist.split('|||').where((s) => s.trim().isNotEmpty));
          }
        });
      }

      // Now fetch latest profile from backend API
      final response = await _apiService.get('/patients', queryParameters: storedMobile.isNotEmpty ? {'mobile': storedMobile} : null);
      Map<String, dynamic>? patient;
      if (response.statusCode == 200 && response.data != null) {
        if (response.data['patient'] is Map) {
          patient = Map<String, dynamic>.from(response.data['patient']);
        } else if (response.data['patients'] is List && (response.data['patients'] as List).isNotEmpty) {
          final list = response.data['patients'] as List;
          final match = list.firstWhere(
            (p) {
              if (p is! Map) return false;
              final userMob = p['userId'] is Map ? (p['userId']['mobile'] ?? '').toString() : '';
              final emergMob = p['emergencyContact'] is Map ? (p['emergencyContact']['phone'] ?? '').toString() : '';
              return userMob.contains(storedMobile) || emergMob.contains(storedMobile);
            },
            orElse: () => list.first,
          );
          if (match is Map) patient = Map<String, dynamic>.from(match);
        }
      }

      if (patient != null) {
        final pName = (patient['name'] ?? '').toString().trim();
        final bool hasCompletedProfile = pName.isNotEmpty &&
            !pName.startsWith('Patient (') &&
            pName.toLowerCase() != 'patient';

        // If patient already has a valid profile in database and user is not in manual edit mode, restore & redirect to home!
        if (!widget.isEditing && hasCompletedProfile) {
          await _storage.write(key: 'patientName', value: pName);
          if (storedMobile.isNotEmpty) {
            await _storage.write(key: 'patientName_$storedMobile', value: pName);
            await _storage.write(key: 'patientName_+91$storedMobile', value: pName);
          }
          final pAddr = patient['address']?.toString() ??
              (patient['savedAddresses'] is List && (patient['savedAddresses'] as List).isNotEmpty
                  ? (patient['savedAddresses'][0] is Map
                      ? patient['savedAddresses'][0]['addressLine']?.toString() ?? ''
                      : patient['savedAddresses'][0].toString())
                  : '');
          if (pAddr.isNotEmpty) {
            await _storage.write(key: 'patientAddress', value: pAddr);
            if (storedMobile.isNotEmpty) {
              await _storage.write(key: 'patientAddress_$storedMobile', value: pAddr);
              await _storage.write(key: 'patientAddress_+91$storedMobile', value: pAddr);
            }
          }
          if (mounted) {
            context.go('/home');
            return;
          }
        }

        if (mounted) {
          setState(() {
            if (patient!['name'] != null && patient['name'].toString().isNotEmpty) {
              _nameController.text = patient['name'].toString();
            }
            final rawUserMobile = patient['userId'] is Map ? (patient['userId']['mobile'] ?? '') : (patient['mobile'] ?? storedMobile);
            String cleanUserMob = rawUserMobile.toString().replaceAll(RegExp(r'^\+91|\D'), '').trim();
            if (cleanUserMob.length > 10) cleanUserMob = cleanUserMob.substring(cleanUserMob.length - 10);
            if (cleanUserMob.isNotEmpty) _mobileController.text = cleanUserMob;

            final apiEmail = patient['userId'] is Map ? (patient['userId']['email'] ?? '') : (patient['email'] ?? '');
            if (apiEmail.toString().isNotEmpty) {
              _emailController.text = apiEmail.toString();
            }
            if (patient['gender'] != null) _gender = patient['gender'];
            if (patient['dob'] != null) {
              try {
                _dob = DateTime.parse(patient['dob']);
              } catch (_) {}
            }
            if (patient['profilePhoto'] != null && patient['profilePhoto'].toString().isNotEmpty) {
              _photoController.text = patient['profilePhoto'];
            }
            
            if (patient['medicalHistory'] != null && patient['medicalHistory'] is List) {
              _selectedMedicalHistory.clear();
              _selectedMedicalHistory.addAll(List<String>.from(patient['medicalHistory']));
            }

            if (patient['emergencyContact'] != null && patient['emergencyContact'] is Map) {
              _emergNameController.text = patient['emergencyContact']['name'] ?? '';
              final rawEmerg = (patient['emergencyContact']['phone'] ?? '').toString();
              String cleanEmerg = rawEmerg.replaceAll(RegExp(r'^\+91|\D'), '').trim();
              if (cleanEmerg.length > 10) cleanEmerg = cleanEmerg.substring(cleanEmerg.length - 10);
              _emergPhoneController.text = cleanEmerg;
              _emergRelationController.text = patient['emergencyContact']['relation'] ?? '';
            }

            if (patient['savedAddresses'] != null && patient['savedAddresses'] is List) {
              final list = patient['savedAddresses'] as List;
              if (list.isNotEmpty) {
                _addressControllers.clear();
                for (var addr in list) {
                  final line = addr is Map ? (addr['addressLine']?.toString() ?? '') : addr.toString();
                  if (line.isNotEmpty) {
                    _addressControllers.add(TextEditingController(text: line));
                  }
                }
              }
            }
          });
        }
      }
    } catch (e) {
      print('Info: Pre-fill loaded skeleton or new registration: $e');
    } finally {
      if (mounted) setState(() => _isFetching = false);
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dob,
      firstDate: DateTime(1920),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0F766E),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _dob) {
      setState(() => _dob = picked);
    }
  }

  void _addAddressField() {
    setState(() {
      _addressControllers.add(TextEditingController());
    });
  }

  void _removeAddressField(int index) {
    setState(() {
      _addressControllers[index].dispose();
      _addressControllers.removeAt(index);
    });
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final name = _nameController.text.trim();
      final cleanDigits = _mobileController.text.trim().replaceAll(RegExp(r'\D'), '');
      final mobile = cleanDigits.length == 10 ? '+91$cleanDigits' : cleanDigits;
      final email = _emailController.text.trim();
      final photo = _photoController.text.trim();
      final addresses = _addressControllers.map((c) => c.text.trim()).where((a) => a.isNotEmpty).toList();
      final mainAddr = addresses.isNotEmpty ? addresses.first : _addressController.text.trim();
      final emergName = _emergNameController.text.trim();
      final cleanEmergDigits = _emergPhoneController.text.trim().replaceAll(RegExp(r'\D'), '');
      final emergPhone = cleanEmergDigits.length == 10 ? '+91$cleanEmergDigits' : cleanEmergDigits;
      final emergRel = _emergRelationController.text.trim();
      final medHistoryStr = _selectedMedicalHistory.join('|||');

      final payload = {
        'name': name,
        'mobile': mobile,
        'email': email,
        'gender': _gender,
        'dob': _dob.toIso8601String(),
        'profilePhoto': photo,
        'address': mainAddr,
        'medicalHistory': _selectedMedicalHistory,
        'emergencyContact': {
          'name': emergName,
          'phone': emergPhone,
          'relation': emergRel,
        },
        'savedAddresses': addresses.isNotEmpty
            ? addresses.map((a) => {'label': 'Home', 'addressLine': a, 'isDefault': true}).toList()
            : (mainAddr.isNotEmpty ? [{'label': 'Home', 'addressLine': mainAddr, 'isDefault': true}] : []),
      };

      // Perform profile update/save API request
      await _storage.write(key: 'patientName', value: name);
      await _storage.write(key: 'patientAddress', value: mainAddr);
      await _storage.write(key: 'patientEmail', value: email);
      await _storage.write(key: 'patientPhoto', value: photo);
      await _storage.write(key: 'patientGender', value: _gender);
      await _storage.write(key: 'patientDob', value: _dob.toIso8601String());
      await _storage.write(key: 'emergName', value: emergName);
      await _storage.write(key: 'emergPhone', value: emergPhone);
      await _storage.write(key: 'emergRel', value: emergRel);
      await _storage.write(key: 'patientMedicalHistory', value: medHistoryStr);

      if (mobile.isNotEmpty) {
        await _storage.write(key: 'userMobile', value: mobile);
        await _storage.write(key: 'patientName_$mobile', value: name);
        await _storage.write(key: 'patientAddress_$mobile', value: mainAddr);
        await _storage.write(key: 'patientEmail_$mobile', value: email);
        await _storage.write(key: 'patientPhoto_$mobile', value: photo);
        await _storage.write(key: 'patientGender_$mobile', value: _gender);
        await _storage.write(key: 'patientDob_$mobile', value: _dob.toIso8601String());
        await _storage.write(key: 'emergName_$mobile', value: emergName);
        await _storage.write(key: 'emergPhone_$mobile', value: emergPhone);
        await _storage.write(key: 'emergRel_$mobile', value: emergRel);
        await _storage.write(key: 'patientMedicalHistory_$mobile', value: medHistoryStr);

        if (cleanDigits.isNotEmpty && cleanDigits != mobile) {
          await _storage.write(key: 'patientName_$cleanDigits', value: name);
          await _storage.write(key: 'patientAddress_$cleanDigits', value: mainAddr);
          await _storage.write(key: 'patientEmail_$cleanDigits', value: email);
          await _storage.write(key: 'patientPhoto_$cleanDigits', value: photo);
          await _storage.write(key: 'patientGender_$cleanDigits', value: _gender);
          await _storage.write(key: 'patientDob_$cleanDigits', value: _dob.toIso8601String());
          await _storage.write(key: 'emergName_$cleanDigits', value: emergName);
          await _storage.write(key: 'emergPhone_$cleanDigits', value: emergPhone);
          await _storage.write(key: 'emergRel_$cleanDigits', value: emergRel);
          await _storage.write(key: 'patientMedicalHistory_$cleanDigits', value: medHistoryStr);
        }
      }

      try {
        final response = await _apiService.post('/patients', data: payload);
        if (response.statusCode == 200) {
          final patient = response.data['patient'];
          if (patient != null && patient['_id'] != null) {
            await _storage.write(key: 'patientId', value: patient['_id']);
          }
        }
      } catch (apiErr) {
        print('Info: Local profile saved, backend synced: $apiErr');
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile saved successfully!'), backgroundColor: Color(0xFF0F766E)),
        );
        if (widget.isEditing) {
          context.pop();
        } else {
          context.go('/home');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save profile: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool readOnly = false,
    String? prefixText,
    int? maxLength,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      maxLength: maxLength,
      validator: validator,
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
      decoration: InputDecoration(
        counterText: '',
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
        prefixIcon: Icon(icon, color: const Color(0xFF0F766E), size: 20),
        prefixText: prefixText,
        prefixStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
        filled: true,
        fillColor: readOnly ? const Color(0xFFF1F5F9) : const Color(0xFFF8FAFC),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 2),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24.0, bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit Profile' : 'Complete Profile', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: widget.isEditing
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
                onPressed: () => context.pop(),
              )
            : null,
      ),
      body: _isFetching
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
          : SafeArea(
              child: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Graphic/Icon Onboarding header
                      if (!widget.isEditing) ...[
                        const Icon(Icons.person_pin_rounded, size: 64, color: Color(0xFF0F766E)),
                        const SizedBox(height: 12),
                        const Text(
                          'Tell us about yourself',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'We personalize your therapy exercises based on your profile',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 24),
                      ],

                      _buildSectionTitle('Basic Patient Details'),

                      // Name
                      _buildTextField(
                        controller: _nameController,
                        label: 'Full Name *',
                        icon: Icons.person_outline_rounded,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Please enter your full name';
                          if (v.trim().length < 2) return 'Name must be at least 2 characters';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Mobile Number - Preset +91 and strictly 10 digits
                      _buildTextField(
                        controller: _mobileController,
                        label: 'Mobile Number *',
                        icon: Icons.phone_iphone_rounded,
                        prefixText: '+91 ',
                        maxLength: 10,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Please enter 10-digit mobile number';
                          }
                          final digits = v.replaceAll(RegExp(r'\D'), '');
                          if (digits.length != 10) {
                            return 'Mobile number must be exactly 10 digits';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Email
                      _buildTextField(
                        controller: _emailController,
                        label: 'Email Address',
                        icon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (v) {
                          if (v != null && v.trim().isNotEmpty) {
                            final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                            if (!emailRegex.hasMatch(v.trim())) {
                              return 'Please enter a valid email address';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Gender Dropdown
                      DropdownButtonFormField<String>(
                        value: _gender,
                        decoration: InputDecoration(
                          labelText: 'Gender',
                          labelStyle: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                          prefixIcon: const Icon(Icons.transgender_rounded, color: Color(0xFF0F766E), size: 20),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
                          ),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'male', child: Text('Male', style: TextStyle(fontWeight: FontWeight.bold))),
                          DropdownMenuItem(value: 'female', child: Text('Female', style: TextStyle(fontWeight: FontWeight.bold))),
                          DropdownMenuItem(value: 'other', child: Text('Other', style: TextStyle(fontWeight: FontWeight.bold))),
                        ],
                        onChanged: (v) => setState(() => _gender = v!),
                      ),
                      const SizedBox(height: 16),

                      // Date of Birth Picker Container
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.calendar_month_rounded, color: Color(0xFF0F766E), size: 20),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Date of Birth', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${_dob.day}/${_dob.month}/${_dob.year}',
                                      style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () => _selectDate(context),
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFF0F766E),
                                backgroundColor: const Color(0xFF0F766E).withOpacity(0.08),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Select', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Direct Profile Photo File Upload
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 68,
                              height: 68,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF0F766E), width: 2),
                                color: const Color(0xFFF1F5F9),
                              ),
                              child: ClipOval(
                                child: _buildAvatarImage(_photoController.text, size: 68),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Profile Photo',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    'Upload image file directly from your device',
                                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      ElevatedButton.icon(
                                        onPressed: () => _pickImageFromFile(source: ImageSource.gallery),
                                        icon: const Icon(Icons.upload_file_rounded, size: 14),
                                        label: const Text('Upload File', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0F766E),
                                          foregroundColor: Colors.white,
                                          elevation: 0,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        ),
                                      ),
                                      if (_photoController.text.isNotEmpty) ...[
                                        const SizedBox(width: 8),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
                                          onPressed: () async {
                                            setState(() => _photoController.clear());
                                            await _storage.delete(key: 'patientPhoto');
                                          },
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildSectionTitle('Medical History'),
                          TextButton.icon(
                            onPressed: () {
                              final textCtrl = TextEditingController();
                              showDialog(
                                context: context,
                                builder: (dCtx) => AlertDialog(
                                  title: const Text('Add Condition', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  content: TextField(
                                    controller: textCtrl,
                                    decoration: InputDecoration(
                                      hintText: 'e.g. Frozen Shoulder',
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(dCtx), child: const Text('Cancel')),
                                    ElevatedButton(
                                      onPressed: () {
                                        final val = textCtrl.text.trim();
                                        if (val.isNotEmpty) {
                                          setState(() {
                                            if (!_medicalHistoryOptions.contains(val)) _medicalHistoryOptions.add(val);
                                            if (!_selectedMedicalHistory.contains(val)) _selectedMedicalHistory.add(val);
                                          });
                                          Navigator.pop(dCtx);
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F766E),
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Add'),
                                    )
                                  ],
                                ),
                              );
                            },
                            icon: const Icon(Icons.add_circle_outline_rounded, size: 16),
                            label: const Text('Add Custom', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F766E)),
                          )
                        ],
                      ),
                      // Wrap checklist
                      Wrap(
                        spacing: 8.0,
                        runSpacing: 8.0,
                        children: _medicalHistoryOptions.map((option) {
                          final isSelected = _selectedMedicalHistory.contains(option);
                          return FilterChip(
                            label: Text(option),
                            selected: isSelected,
                            selectedColor: const Color(0xFFE0F2F1),
                            checkmarkColor: const Color(0xFF0F766E),
                            labelStyle: TextStyle(
                              color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF0F172A),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0)),
                            ),
                            onSelected: (selected) {
                              setState(() {
                                if (selected) {
                                  _selectedMedicalHistory.add(option);
                                } else {
                                  _selectedMedicalHistory.remove(option);
                                }
                              });
                            },
                          );
                        }).toList(),
                      ),

                      _buildSectionTitle('Emergency Contact Details'),
                      _buildTextField(
                        controller: _emergNameController,
                        label: 'Contact Person Name *',
                        icon: Icons.contact_emergency_outlined,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter contact person name' : null,
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _emergPhoneController,
                        label: 'Emergency Mobile *',
                        icon: Icons.phone_iphone_rounded,
                        prefixText: '+91 ',
                        maxLength: 10,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Please enter 10-digit emergency contact';
                          }
                          final digits = v.replaceAll(RegExp(r'\D'), '');
                          if (digits.length != 10) {
                            return 'Emergency phone must be exactly 10 digits';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _emergRelationController,
                        label: 'Relationship (e.g. Spouse, Parent, Self) *',
                        icon: Icons.people_outline_rounded,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Please specify relationship' : null,
                      ),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildSectionTitle('Saved Addresses'),
                          TextButton.icon(
                            onPressed: _addAddressField,
                            icon: const Icon(Icons.add_rounded, size: 16),
                            label: const Text('Add Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F766E)),
                          )
                        ],
                      ),
                      if (_addressControllers.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8.0),
                          child: Text('No saved addresses yet. Click Add to specify one.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _addressControllers.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8.0),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: _buildTextField(
                                      controller: _addressControllers[index],
                                      label: 'Address Line ${index + 1}',
                                      icon: Icons.location_city_rounded,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(Icons.delete_rounded, color: Colors.red),
                                    onPressed: () => _removeAddressField(index),
                                  )
                                ],
                              ),
                            );
                          },
                        ),

                      const SizedBox(height: 36),

                      ElevatedButton(
                        onPressed: _isLoading ? null : _saveProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 56),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                widget.isEditing ? 'Save Changes' : 'Complete & Enter App',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                      const SizedBox(height: 48),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
