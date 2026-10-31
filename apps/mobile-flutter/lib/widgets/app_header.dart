import 'package:flutter/material.dart';
import 'notifications_sheet.dart';
import 'package:go_router/go_router.dart';

class AppHeader extends StatelessWidget {
  final bool isDashboard;
  final String? userName;
  final String? locationAddress;
  final String? title;
  final bool showBack;
  final VoidCallback? onBack;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;
  final List<Widget>? actions;

  const AppHeader({
    super.key,
    this.isDashboard = false,
    this.userName,
    this.locationAddress,
    this.title,
    this.showBack = true,
    this.onBack,
    this.onSearchTap,
    this.onNotificationTap,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF042F2E),
        gradient: LinearGradient(
          colors: [Color(0xFF022624), Color(0xFF0F766E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          child: isDashboard ? _buildDashboardHeader(context) : _buildInnerHeader(context),
        ),
      ),
    );
  }

  Widget _buildDashboardHeader(BuildContext context) {
    return Row(
      children: [
        // User Profile Avatar
        GestureDetector(
          onTap: () => context.push('/profile'),
          child: Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.18),
              border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
            ),
            child: const Icon(
              Icons.person_rounded,
              color: Colors.white,
              size: 26,
            ),
          ),
        ),
        const SizedBox(width: 12),

        // Name & Location Info
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Hello ${userName ?? 'Patient'}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(
                    Icons.location_on_rounded,
                    color: Color(0xFF34D399),
                    size: 13,
                  ),
                  const SizedBox(width: 3),
                  Expanded(
                    child: Text(
                      locationAddress ?? 'Near, Ashok Nagar Rd No 1, opposite O...',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Search Icon
        IconButton(
          onPressed: onSearchTap ?? () => context.push('/all_services'),
          icon: const Icon(
            Icons.search_rounded,
            color: Colors.white,
            size: 24,
          ),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 38, minHeight: 38),
        ),

        // Notification Bell
        IconButton(
          onPressed: onNotificationTap ?? () => showNotificationsSheet(context),
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: Colors.white,
            size: 24,
          ),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 38, minHeight: 38),
        ),
      ],
    );
  }

  Widget _buildInnerHeader(BuildContext context) {
    return Row(
      children: [
        if (showBack)
          IconButton(
            onPressed: onBack ?? () => context.pop(),
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: Colors.white,
              size: 20,
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 38, minHeight: 38),
          ),
        Expanded(
          child: Text(
            title ?? '',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.2,
            ),
          ),
        ),
        if (actions != null) ...actions!,
      ],
    );
  }
}
