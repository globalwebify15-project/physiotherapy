import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppBottomNav extends StatelessWidget {
  final int currentIndex;

  const AppBottomNav({
    super.key,
    required this.currentIndex,
  });

  void _onItemTapped(BuildContext context, int index) {
    if (index == currentIndex) return;

    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/appointments');
        break;
      case 2:
        context.go('/offers');
        break;
      case 3:
        context.go('/service_providers');
        break;
      case 4:
        context.go('/settings');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF042F2E),
        gradient: const LinearGradient(
          colors: [Color(0xFF022624), Color(0xFF0A4D45)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                index: 0,
                icon: Icons.home_rounded,
                label: 'Home',
              ),
              _buildNavItem(
                context,
                index: 1,
                icon: Icons.assignment_turned_in_rounded,
                label: 'Appointment',
              ),
              _buildNavItem(
                context,
                index: 2,
                icon: Icons.percent_rounded,
                label: 'Offers',
              ),
              _buildNavItem(
                context,
                index: 3,
                icon: Icons.medical_services_rounded,
                label: 'Specialists',
              ),
              _buildNavItem(
                context,
                index: 4,
                icon: Icons.settings_rounded,
                label: 'Settings',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = currentIndex == index;
    const activeColor = Color(0xFFFBBF24); // Warm Gold highlight for active tab
    const inactiveIconColor = Colors.white; // Crisp White for maximum visibility on dark background
    final inactiveTextColor = Colors.white.withOpacity(0.9);

    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(context, index),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: isSelected ? activeColor : inactiveIconColor,
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? activeColor : inactiveTextColor,
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  letterSpacing: -0.2,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
              if (isSelected) ...[
                const SizedBox(height: 2),
                Container(
                  width: 14,
                  height: 2,
                  decoration: BoxDecoration(
                    color: activeColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                )
              ]
            ],
          ),
        ),
      ),
    );
  }
}
