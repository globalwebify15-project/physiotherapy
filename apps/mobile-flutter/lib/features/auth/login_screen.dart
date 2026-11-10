import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../services/api_service.dart';
import '../../utils/app_storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _mobileController = TextEditingController();
  final _apiService = ApiService();
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
              await AppStorage.write(key: 'accessToken', value: data['accessToken']);
              await AppStorage.write(key: 'refreshToken', value: data['refreshToken']);
              await AppStorage.write(key: 'userMobile', value: mobile);

              final patientData = data['patient'];
              if (patientData is Map) {
                final pId = patientData['id']?.toString() ?? patientData['_id']?.toString();
                if (pId != null) await AppStorage.write(key: 'patientId', value: pId);

                final pName = patientData['name']?.toString() ?? '';
                final pAddr = patientData['address']?.toString() ??
                    (patientData['savedAddresses'] is List && (patientData['savedAddresses'] as List).isNotEmpty
                        ? (patientData['savedAddresses'][0] is Map
                            ? patientData['savedAddresses'][0]['addressLine']?.toString() ?? ''
                            : patientData['savedAddresses'][0].toString())
                        : '');
                final pGender = patientData['gender']?.toString() ?? '';
                final pDob = patientData['dob']?.toString() ?? '';

                if (pName.isNotEmpty && !pName.startsWith('Patient (')) {
                  await AppStorage.write(key: 'patientName', value: pName);
                  await AppStorage.write(key: 'patientName_$mobile', value: pName);
                }
                if (pAddr.isNotEmpty) {
                  await AppStorage.write(key: 'patientAddress', value: pAddr);
                  await AppStorage.write(key: 'patientAddress_$mobile', value: pAddr);
                }
                if (pGender.isNotEmpty) {
                  await AppStorage.write(key: 'patientGender_$mobile', value: pGender);
                }
                if (pDob.isNotEmpty) {
                  await AppStorage.write(key: 'patientDob_$mobile', value: pDob);
                }
              }

              final bool isNewUser = data['isNewUser'] == true;
              if (isNewUser) {
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
          // If Phone provider has billing disabled, not authorized, or any Firebase SMS failure, fallback to backend OTP
          final isBillingOrConfigError = (e.message ?? '').contains('BILLING_NOT_ENABLED') ||
              e.code == 'billing-not-enabled' ||
              e.code == 'operation-not-allowed' ||
              e.code == 'app-not-authorized' ||
              e.code == 'internal-error';

          if (isBillingOrConfigError) {
            try {
              final response = await _apiService.post('/auth/otp/send', data: {
                'mobile': mobile,
              });
              if (response.statusCode == 200 && mounted) {
                setState(() => _isLoading = false);
                final testOtp = response.data?['otp']?.toString() ?? '123456';
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Firebase SMS billing inactive. Verification code: $testOtp'),
                    backgroundColor: const Color(0xFF0F766E),
                    duration: const Duration(seconds: 8),
                  ),
                );
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
          final testOtp = response.data?['otp']?.toString() ?? '123456';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Firebase SMS inactive. Verification code: $testOtp'),
              backgroundColor: const Color(0xFF0F766E),
              duration: const Duration(seconds: 8),
            ),
          );
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

  Future<void> _signInWithGoogle() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        serverClientId: '702688746378-6o2dtfb174qoe6qvfbkbj4jt1jphpv4j.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      );
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled picker
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential userCred = await FirebaseAuth.instance.signInWithCredential(credential);
      final idToken = await userCred.user?.getIdToken();

      await _syncSocialUser(
        idToken: idToken,
        provider: 'google',
        email: userCred.user?.email ?? googleUser.email,
        name: userCred.user?.displayName ?? googleUser.displayName ?? '',
        photoUrl: userCred.user?.photoURL ?? googleUser.photoUrl,
        uid: userCred.user?.uid ?? googleUser.id,
      );
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message ?? 'Google Sign-In failed (${e.code})'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google Sign-In: ${e.toString()}'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    }
  }

  Future<void> _signInWithApple() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      final appleProvider = OAuthProvider('apple.com');
      appleProvider.addScope('email');
      appleProvider.addScope('name');

      final userCred = await FirebaseAuth.instance.signInWithProvider(appleProvider);
      final idToken = await userCred.user?.getIdToken();

      await _syncSocialUser(
        idToken: idToken,
        provider: 'apple',
        email: userCred.user?.email,
        name: userCred.user?.displayName ?? 'Apple User',
        photoUrl: userCred.user?.photoURL,
        uid: userCred.user?.uid,
      );
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message ?? 'Apple Sign-In failed (${e.code})'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Apple Sign-In: ${e.toString()}'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    }
  }

  Future<void> _syncSocialUser({
    required String? idToken,
    required String provider,
    String? email,
    String? name,
    String? photoUrl,
    String? uid,
  }) async {
    try {
      final response = await _apiService.post('/auth/social', data: {
        'idToken': idToken,
        'provider': provider,
        'email': email,
        'name': name,
        'photoUrl': photoUrl,
        'uid': uid,
      });

      if (response.statusCode == 200 && mounted) {
        final data = response.data;
        await AppStorage.write(key: 'accessToken', value: data['accessToken']?.toString());
        await AppStorage.write(key: 'refreshToken', value: data['refreshToken']?.toString());
        if (data['user']?['mobile'] != null) {
          await AppStorage.write(key: 'userMobile', value: data['user']['mobile'].toString());
        }

        final patientData = data['patient'];
        if (patientData is Map) {
          final pId = patientData['id']?.toString() ?? patientData['_id']?.toString();
          if (pId != null) await AppStorage.write(key: 'patientId', value: pId);

          final pName = patientData['name']?.toString() ?? name ?? '';
          if (pName.isNotEmpty && !pName.startsWith('Patient (')) {
            await AppStorage.write(key: 'patientName', value: pName);
          }
        }

        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Signed in successfully! Welcome ${name ?? ''}'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
        context.go('/home');
      } else {
        throw Exception(response.data?['error'] ?? 'Sign in failed');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sign-in failed: ${e.toString()}'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    }
  }

  Widget _buildSocialOptionButton({
    required Widget icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isLoading ? null : onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14),
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
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                icon,
                const SizedBox(width: 8),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
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
                children: [
                  _buildSocialOptionButton(
                    icon: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEA4335).withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'G',
                        style: TextStyle(
                          color: Color(0xFFEA4335),
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    label: 'Google',
                    onTap: _signInWithGoogle,
                  ),
                  const SizedBox(width: 14),
                  _buildSocialOptionButton(
                    icon: const Icon(Icons.apple_rounded, color: Colors.black, size: 22),
                    label: 'Apple',
                    onTap: _signInWithApple,
                  ),
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
