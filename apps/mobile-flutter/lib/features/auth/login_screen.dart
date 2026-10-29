import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _mobileController = TextEditingController();
  final _apiService = ApiService();
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final mobile = _mobileController.text.trim();
    if (mobile.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit mobile number')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final fullNumber = mobile.startsWith('+') ? mobile : '+91$mobile';

    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: fullNumber,
        timeout: const Duration(seconds: 60),
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Instant auto-retrieval / auto-verification on Android
          try {
            final userCred = await FirebaseAuth.instance.signInWithCredential(credential);
            final idToken = await userCred.user?.getIdToken();

            final response = await _apiService.post('/auth/otp/verify', data: {
              'mobile': mobile,
              'otp': credential.smsCode ?? 'auto_verified',
              'idToken': idToken,
            });

            if (response.statusCode == 200 && mounted) {
              final data = response.data;
              await _storage.write(key: 'accessToken', value: data['accessToken']);
              await _storage.write(key: 'refreshToken', value: data['refreshToken']);
              await _storage.write(key: 'patientId', value: data['patient']?['id'] ?? 'patient_$mobile');
              await _storage.write(key: 'userMobile', value: mobile);

              if (data['isNewUser'] == true) {
                context.go('/register');
              } else {
                context.go('/home');
              }
            }
          } catch (autoErr) {
            print('[Firebase Auto Verification]: $autoErr');
          }
        },
        verificationFailed: (FirebaseAuthException e) async {
          // If Phone provider is disabled in Firebase or not allowed yet, fallback to backend OTP
          if (e.code == 'operation-not-allowed' || e.code == 'app-not-authorized') {
            try {
              final response = await _apiService.post('/auth/otp/send', data: {
                'mobile': mobile,
              });
              if (response.statusCode == 200 && mounted) {
                setState(() => _isLoading = false);
                context.push('/otp?mobile=$mobile');
                return;
              }
            } catch (_) {}
          }

          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(e.message ?? 'Verification failed (${e.code}). Please try again.'),
                backgroundColor: Colors.red.shade700,
              ),
            );
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          if (mounted) {
            setState(() => _isLoading = false);
            context.push('/otp?mobile=$mobile&verificationId=$verificationId');
          }
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          // Auto retrieval timeout reached
        },
      );
    } catch (e) {
      // Fallback: If Firebase throws (e.g. offline or unconfigured), use backend test route
      try {
        final response = await _apiService.post('/auth/otp/send', data: {
          'mobile': mobile,
        });

        if (response.statusCode == 200 && mounted) {
          context.push('/otp?mobile=$mobile');
        }
      } catch (err) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${e.toString()}')),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  Widget _buildSocialButton(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Icon(icon, color: color, size: 24),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => context.go('/'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              // Brand Icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F766E).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.medical_services_rounded, color: Color(0xFF0F766E), size: 32),
              ),
              const SizedBox(height: 20),

              const Text(
                'Welcome Back! 👋',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Sign in to access your appointments, physiotherapists & care plans.',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 36),

              // Mobile text field matching design system
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F766E).withOpacity(0.04),
                      blurRadius: 15,
                      offset: const Offset(0, 6),
                    )
                  ],
                ),
                child: TextField(
                  controller: _mobileController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    counterText: '',
                    labelText: 'Mobile Number / मोबाइल नंबर',
                    labelStyle: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                    prefixIcon: const Icon(Icons.phone_iphone_rounded, color: Color(0xFF0F766E)),
                    prefixText: '+91 ',
                    prefixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    filled: true,
                    fillColor: Colors.white,
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Sign In Button
              ElevatedButton(
                onPressed: _isLoading ? null : _sendOtp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E), // Deep Teal theme
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 54),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                      )
                    : const Text(
                        'Get OTP / आगे बढ़ें',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
              const SizedBox(height: 36),

              Row(
                children: const [
                  Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'or continue with',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                  ),
                  Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSocialButton(Icons.g_mobiledata_rounded, const Color(0xFFEA4335)),
                  _buildSocialButton(Icons.facebook_rounded, const Color(0xFF1877F2)),
                  _buildSocialButton(Icons.apple_rounded, Colors.black),
                ],
              ),
              const SizedBox(height: 36),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'By signing in you agree to our ',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                  ),
                  GestureDetector(
                    onTap: () {},
                    child: const Text(
                      'Terms & Privacy',
                      style: TextStyle(color: Color(0xFF0F766E), fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  )
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
