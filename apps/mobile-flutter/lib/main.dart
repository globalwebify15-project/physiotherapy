import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/otp_screen.dart';
import 'features/home/home_screen.dart';
import 'features/home/all_services_screen.dart';
import 'features/service_providers/service_providers_screen.dart';
import 'features/offers/offers_screen.dart';
import 'features/booking/booking_screen.dart';
import 'features/appointments/appointments_screen.dart';
import 'features/exercises/exercises_screen.dart';
import 'features/home/profile_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/settings/about_clinic_screen.dart';
import 'features/settings/contact_us_screen.dart';
import 'features/reviews/reviews_screen.dart';
import 'features/settings/theme_provider.dart';
import 'features/auth/register_screen.dart';
import 'services/notification_service.dart';
import 'utils/app_storage.dart';
import 'utils/phone_helper.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await NotificationService().initialize();
  } catch (e) {
    debugPrint('[NOTIFICATION INIT] Initialized with fallback: $e');
  }

  // Pre-load CMS About and Contact settings from storage
  await PhoneHelper.loadFromStorage();

  // Persistent Login Session Check (Persists until manual logout or app uninstall)
  String initialRoute = '/';
  try {
    final userMobile = await AppStorage.read(key: 'userMobile');
    if (userMobile != null && userMobile.trim().isNotEmpty) {
      initialRoute = '/home';
    }
  } catch (e) {
    debugPrint('[SESSION CHECK ERROR]: $e');
  }

  // Crash-proof Error Widget to prevent blank/gray screens
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint('[FLUTTER GLOBAL ERROR]: ${details.exceptionAsString()}');
  };

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Material(
      color: const Color(0xFFF8FAFC),
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCCFBF1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.healing_rounded, color: Color(0xFF0F766E), size: 28),
                ),
                const SizedBox(height: 16),
                const Text(
                  'QuickPhysio24',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F766E)),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Temporarily refreshing view...',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    final nav = rootNavigatorKey.currentState;
                    if (nav != null && nav.canPop()) {
                      nav.pop();
                    }
                  },
                  icon: const Icon(Icons.arrow_back_rounded, size: 16),
                  label: const Text('Back'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F766E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  };

  runApp(
    ProviderScope(
      child: PhysioApp(initialLocation: initialRoute),
    ),
  );
}

class PhysioApp extends ConsumerWidget {
  const PhysioApp({super.key, this.initialLocation = '/'});

  final String initialLocation;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    final GoRouter router = GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: initialLocation,
      redirect: (context, state) async {
        final userMobile = await AppStorage.read(key: 'userMobile');
        final isLoggedIn = userMobile != null && userMobile.trim().isNotEmpty;
        final loc = state.matchedLocation;

        // If user is already authenticated, bypass onboarding and login
        if (isLoggedIn && (loc == '/' || loc == '/login' || loc == '/otp')) {
          return '/home';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const OnboardingScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) {
            final mode = state.uri.queryParameters['mode'];
            return LoginScreen(initialMode: mode);
          },
        ),
        GoRoute(
          path: '/otp',
          builder: (context, state) {
            final mobile = state.uri.queryParameters['mobile'] ?? '';
            final verificationId = state.uri.queryParameters['verificationId'];
            return OtpScreen(mobile: mobile, verificationId: verificationId);
          },
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/all_services',
          builder: (context, state) => const AllServicesScreen(),
        ),
        GoRoute(
          path: '/service_providers',
          builder: (context, state) => const ServiceProvidersScreen(),
        ),
        GoRoute(
          path: '/offers',
          builder: (context, state) => const OffersScreen(),
        ),
        GoRoute(
          path: '/booking',
          builder: (context, state) {
            final extra = state.extra as Map<String, dynamic>?;
            final doctorId = extra?['doctorId'] as String? ?? state.uri.queryParameters['doctorId'];
            final doctorName = extra?['doctorName'] as String? ?? state.uri.queryParameters['doctorName'];
            final serviceId = extra?['serviceId'] as String? ?? state.uri.queryParameters['serviceId'];
            final serviceTitle = extra?['serviceTitle'] as String? ?? state.uri.queryParameters['serviceTitle'];
            final promoCode = extra?['promoCode'] as String? ?? state.uri.queryParameters['promoCode'];
            return BookingScreen(
              initialDoctorId: doctorId,
              initialDoctorName: doctorName,
              initialServiceId: serviceId,
              initialServiceTitle: serviceTitle,
              initialPromoCode: promoCode,
            );
          },
        ),
        GoRoute(
          path: '/appointments',
          builder: (context, state) => const AppointmentsScreen(),
        ),
        GoRoute(
          path: '/exercises',
          builder: (context, state) => const ExercisesScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsScreen(),
        ),
        GoRoute(
          path: '/about_clinic',
          builder: (context, state) => const AboutClinicScreen(),
        ),
        GoRoute(
          path: '/contact_us',
          builder: (context, state) => const ContactUsScreen(),
        ),
        GoRoute(
          path: '/reviews',
          builder: (context, state) => const ReviewsScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(isEditing: false),
        ),
        GoRoute(
          path: '/edit_profile',
          builder: (context, state) => RegisterScreen(
            isEditing: true,
            initialData: state.extra as Map<String, dynamic>?,
          ),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'QuickPhysio24.com',
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      themeMode: themeMode,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Outfit',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E), // Teal Primary Accent
          primary: const Color(0xFF0F766E),
          secondary: const Color(0xFF10B981), // Emerald Accent
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Outfit',
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E),
          primary: const Color(0xFF0F766E),
          secondary: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade800, width: 1),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF1E293B),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }
}
