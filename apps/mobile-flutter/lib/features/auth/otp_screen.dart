import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/api_service.dart';

class OtpScreen extends StatefulWidget {
  final String mobile;
  const OtpScreen({super.key, required this.mobile});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  final _apiService = ApiService();
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the 6-digit verification code')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await _apiService.post('/auth/otp/verify', data: {
        'mobile': widget.mobile,
        'otp': otp,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        await _storage.write(key: 'accessToken', value: data['accessToken']);
        await _storage.write(key: 'refreshToken', value: data['refreshToken']);
        await _storage.write(key: 'patientId', value: data['patient']['id']);
        await _storage.write(key: 'userMobile', value: widget.mobile);

        if (mounted) {
          if (data['isNewUser'] == true) {
            context.go('/register');
          } else {
            context.go('/home');
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid code: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
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
          onPressed: () => context.go('/login'),
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
                child: const Icon(Icons.lock_outline_rounded, color: Color(0xFF0F766E), size: 32),
              ),
              const SizedBox(height: 20),

              const Text(
                'Verify OTP 🔒',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'We sent a 6-digit verification code to +91 ${widget.mobile}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 36),

              // OTP text field matching login field size & style
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
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    letterSpacing: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F766E),
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: '• • • • • •',
                    hintStyle: const TextStyle(
                      letterSpacing: 12,
                      color: Color(0xFFCBD5E1),
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    labelText: '6-Digit Verification Code',
                    labelStyle: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0,
                    ),
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

              // Verify Button matching login button
              ElevatedButton(
                onPressed: _isLoading ? null : _verifyOtp,
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
                        'Verify & Proceed / सत्यापित करें',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
              const SizedBox(height: 28),

              Center(
                child: TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Verification code resent to +91 ${widget.mobile}'),
                        backgroundColor: const Color(0xFF0F766E),
                      ),
                    );
                  },
                  style: TextButton.styleFrom(foregroundColor: const Color(0xFF64748B)),
                  child: RichText(
                    text: const TextSpan(
                      text: "Didn't receive code? ",
                      style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w500, fontSize: 13),
                      children: [
                        TextSpan(
                          text: "Resend Code",
                          style: TextStyle(color: Color(0xFF0F766E), fontWeight: FontWeight.bold, fontSize: 13),
                        )
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
