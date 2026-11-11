import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api_service.dart';
import '../../utils/app_storage.dart';

class LoginScreen extends StatefulWidget {
  final String? initialMode;
  const LoginScreen({super.key, this.initialMode});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _mobileController = TextEditingController();
  final _apiService = ApiService();
  bool _isLoading = false;
  late String _authMode; // 'new', 'returning', or 'unified'

  @override
  void initState() {
    super.initState();
    if (widget.initialMode == 'new' || widget.initialMode == 'returning') {
      _authMode = widget.initialMode!;
    } else {
      _authMode = 'unified';
    }
  }

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
    final bool isNewMode = _authMode == 'new';
    final bool isReturningMode = _authMode == 'returning';

    final IconData headerIcon = isNewMode
        ? Icons.person_add_alt_1_rounded
        : isReturningMode
            ? Icons.verified_user_rounded
            : Icons.medical_services_rounded;

    final String badgeLabel = isNewMode
        ? 'NEW PATIENT REGISTRATION'
        : isReturningMode
            ? 'RETURNING PATIENT SIGN IN'
            : 'PATIENT PORTAL';

    final String titleText = isNewMode
        ? 'Start Your Care Journey'
        : isReturningMode
            ? 'Welcome Back'
            : 'Welcome to QuickPhysio24';

    final String subtitleText = isNewMode
        ? 'Create your patient profile to book doorstep home visits or clinic physiotherapy consultations.'
        : isReturningMode
            ? 'Sign in to access your booked appointments, assigned physiotherapists & recovery plans.'
            : 'Enter your mobile number or continue with Google or Apple to sign in or create your patient account.';

    final String ctaLabel = isNewMode
        ? 'Continue & Get OTP / आगे बढ़ें'
        : isReturningMode
            ? 'Sign In with OTP / लॉगिन करें'
            : 'Get OTP / आगे बढ़ें';

    final IconData ctaIcon = isReturningMode ? Icons.login_rounded : Icons.arrow_forward_rounded;

    final String benefitText = isNewMode
        ? 'First-time patient? Complete your quick profile setup right after verification.'
        : isReturningMode
            ? 'Your past appointments, prescriptions & care plans sync automatically.'
            : 'New patients register seamlessly; returning patients resume right where they left off.';

    final IconData benefitIcon = isNewMode
        ? Icons.assignment_turned_in_outlined
        : isReturningMode
            ? Icons.sync_rounded
            : Icons.shield_outlined;

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
              const SizedBox(height: 8),
              // Professional Brand Icon + Mode Pill
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F766E).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(headerIcon, color: const Color(0xFF0F766E), size: 30),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isNewMode
                          ? const Color(0xFFECFDF5)
                          : isReturningMode
                              ? const Color(0xFFF0FDFA)
                              : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isNewMode || isReturningMode
                            ? const Color(0xFF99F6E4)
                            : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isNewMode
                              ? Icons.fiber_new_rounded
                              : isReturningMode
                                  ? Icons.history_rounded
                                  : Icons.health_and_safety_outlined,
                          size: 14,
                          color: const Color(0xFF0F766E),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          badgeLabel,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F766E),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              Text(
                titleText,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitleText,
                style: const TextStyle(
                  fontSize: 13.5,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              // New Patient vs Returning Patient Mode Selector
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0).withOpacity(0.55),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _authMode = 'new'),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isNewMode ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(11),
                            boxShadow: isNewMode
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.person_add_outlined,
                                size: 15,
                                color: isNewMode ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'New Patient',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: isNewMode ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _authMode = 'returning'),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isReturningMode ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(11),
                            boxShadow: isReturningMode
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.verified_user_outlined,
                                size: 15,
                                color: isReturningMode ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Existing Patient',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: isReturningMode ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

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
              const SizedBox(height: 20),

              // Sign In / Continue Button
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
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            ctaLabel,
                            style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          Icon(ctaIcon, size: 19),
                        ],
                      ),
              ),
              const SizedBox(height: 12),

              // Helpful Context Strip for New vs Returning User
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCCFBF1)),
                ),
                child: Row(
                  children: [
                    Icon(benefitIcon, size: 16, color: const Color(0xFF0F766E)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        benefitText,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFF134E4A),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

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
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        backgroundColor: Colors.white,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        builder: (ctx) => Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Legal & Compliance Policies',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'QuickPhysio24.com • Synergy Global Hospital, Ranchi',
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 16),
                              ListTile(
                                leading: const Icon(Icons.description_outlined, color: Color(0xFF0F766E)),
                                title: const Text('Terms & Conditions', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                                onTap: () => launchUrl(
                                  Uri.parse('https://physiotherapy-backend-nextjs.vercel.app/terms'),
                                  mode: LaunchMode.externalApplication,
                                ),
                              ),
                              ListTile(
                                leading: const Icon(Icons.privacy_tip_outlined, color: Color(0xFF0F766E)),
                                title: const Text('Privacy Policy', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                                onTap: () => launchUrl(
                                  Uri.parse('https://physiotherapy-backend-nextjs.vercel.app/privacy'),
                                  mode: LaunchMode.externalApplication,
                                ),
                              ),
                              ListTile(
                                leading: const Icon(Icons.assignment_return_outlined, color: Color(0xFF0F766E)),
                                title: const Text('7-Day Refund & Cancellation Policy', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                                onTap: () => launchUrl(
                                  Uri.parse('https://physiotherapy-backend-nextjs.vercel.app/refund-policy'),
                                  mode: LaunchMode.externalApplication,
                                ),
                              ),
                              const SizedBox(height: 8),
                            ],
                          ),
                        ),
                      );
                    },
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
