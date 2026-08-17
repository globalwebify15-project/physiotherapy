import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDestructive ? Colors.red.withOpacity(0.1) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: isDestructive ? Colors.red : const Color(0xFF64748B), size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 14,
          color: isDestructive ? Colors.red : const Color(0xFF0F172A),
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF94A3B8)),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF0F172A)),
            onPressed: () => context.push('/settings'),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24),
            
            // Avatar and Name
            const CircleAvatar(
              radius: 48,
              backgroundImage: NetworkImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'),
            ),
            const SizedBox(height: 16),
            const Text(
              'Rahul Kumar',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            const Text(
              '+91 9334306358',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F766E)),
              child: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            
            // Custom Recovery Chart
            const RecoveryTrendChart(),
            
            const SizedBox(height: 16),
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 12),

            // Profile Options
            _buildProfileOption(
              icon: Icons.calendar_today_rounded,
              title: 'My Appointments',
              onTap: () => context.push('/appointments'),
            ),
            _buildProfileOption(
              icon: Icons.assignment_rounded,
              title: 'My Plans',
              onTap: () => context.push('/exercises'),
            ),
            _buildProfileOption(
              icon: Icons.history_rounded,
              title: 'Medical History',
              onTap: () {},
            ),
            _buildProfileOption(
              icon: Icons.payment_rounded,
              title: 'Payment Methods',
              onTap: () {},
            ),
            _buildProfileOption(
              icon: Icons.help_outline_rounded,
              title: 'Help & Support',
              onTap: () {},
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 12),
            
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
            const SizedBox(height: 40),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 3,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF0F766E),
        unselectedItemColor: const Color(0xFF94A3B8),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'Bookings'),
          BottomNavigationBarItem(icon: Icon(Icons.directions_run_rounded), label: 'Exercises'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
        onTap: (index) {
          if (index == 0) {
            context.go('/home');
          } else if (index == 1) {
            context.push('/appointments');
          } else if (index == 2) {
            context.push('/exercises');
          }
        },
      ),
    );
  }
}

class RecoveryTrendChart extends StatelessWidget {
  const RecoveryTrendChart({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 12,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recovery Analytics',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF43F5E), // Rose red for pain
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('Pain Level', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                  const SizedBox(width: 12),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981), // Emerald for exercises
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('Exercises', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 160,
            width: double.infinity,
            child: CustomPaint(
              painter: _RecoveryChartPainter(),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Mon', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Tue', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Wed', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Thu', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Fri', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Sat', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              Text('Sun', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}

class _RecoveryChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double width = size.width;
    final double height = size.height;

    // Draw background horizontal grid lines (3 lines)
    final gridPaint = Paint()
      ..color = const Color(0xFFF1F5F9)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    for (int i = 0; i <= 3; i++) {
      final y = (height / 3) * i;
      canvas.drawLine(Offset(0, y), Offset(width, y), gridPaint);
    }

    // Weekly mock data points
    // Index: 0 (Mon) to 6 (Sun)
    // Pain level values out of 10: [7, 6, 6, 4, 3, 2, 2]
    // Completed exercise counts out of 5: [2, 3, 2, 4, 5, 4, 5]
    final List<double> painLevels = [7, 6.2, 5.5, 4, 3, 2.5, 1.8];
    final List<double> exerciseCounts = [2, 3, 2, 4, 5, 4, 5];

    final double stepX = width / 6;

    // 1. Draw exercise counts as vertical bars
    final barPaint = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.15)
      ..style = PaintingStyle.fill;
    final barBorderPaint = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final double barWidth = width * 0.05;

    for (int i = 0; i < 7; i++) {
      final x = stepX * i;
      // Map 0-5 to height range 0 to height
      final barHeight = (exerciseCounts[i] / 5) * (height * 0.8);
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(x - (barWidth / 2), height - barHeight, barWidth, barHeight),
        const Radius.circular(4),
      );
      canvas.drawRRect(rect, barPaint);
      canvas.drawRRect(rect, barBorderPaint);
    }

    // 2. Draw pain level as a smooth line chart with gradient fill
    final List<Offset> points = [];
    for (int i = 0; i < 7; i++) {
      final x = stepX * i;
      // Map 0-10 pain to height (where 10 is top, 0 is bottom)
      final y = height - (painLevels[i] / 10) * height;
      points.add(Offset(x, y));
    }

    // Make smooth cubic path for line chart
    final path = Path();
    path.moveTo(points[0].dx, points[0].dy);
    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final controlPointX1 = p0.dx + (p1.dx - p0.dx) / 2;
      final controlPointY1 = p0.dy;
      final controlPointX2 = p0.dx + (p1.dx - p0.dx) / 2;
      final controlPointY2 = p1.dy;
      path.cubicTo(controlPointX1, controlPointY1, controlPointX2, controlPointY2, p1.dx, p1.dy);
    }

    // Gradient path under the line
    final fillPath = Path.from(path);
    fillPath.lineTo(width, height);
    fillPath.lineTo(0, height);
    fillPath.close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFFF43F5E).withOpacity(0.15),
          const Color(0xFFF43F5E).withOpacity(0.0),
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTRB(0, 0, width, height));
    canvas.drawPath(fillPath, fillPaint);

    // Draw the actual path line
    final linePaint = Paint()
      ..color = const Color(0xFFF43F5E)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, linePaint);

    // Draw point circles on the line
    final dotPaint = Paint()
      ..color = const Color(0xFFF43F5E)
      ..style = PaintingStyle.fill;
    final dotOuterPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    for (final pt in points) {
      canvas.drawCircle(pt, 5, dotPaint);
      canvas.drawCircle(pt, 5, dotOuterPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
