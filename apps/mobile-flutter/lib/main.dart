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
import 'features/pain_tracker/pain_tracker_screen.dart';
import 'features/home/profile_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/settings/theme_provider.dart';
import 'features/auth/register_screen.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService().initialize();

  runApp(
    const ProviderScope(
      child: PhysioApp(),
    ),
  );
}

class PhysioApp extends ConsumerWidget {
  const PhysioApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    final GoRouter router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const OnboardingScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/otp',
          builder: (context, state) {
            final mobile = state.uri.queryParameters['mobile'] ?? '';
            return OtpScreen(mobile: mobile);
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
            return BookingScreen(
              initialDoctorId: doctorId,
              initialDoctorName: doctorName,
              initialServiceId: serviceId,
              initialServiceTitle: serviceTitle,
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
          path: '/pain_tracker',
          builder: (context, state) => const PainTrackerScreen(),
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
          path: '/register',
          builder: (context, state) => const RegisterScreen(isEditing: false),
        ),
        GoRoute(
          path: '/edit_profile',
          builder: (context, state) => const RegisterScreen(isEditing: true),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'QuickPhysio24.com',
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
