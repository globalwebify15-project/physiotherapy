import 'dart:math';
import 'package:flutter/material.dart';

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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Recovery Analytics',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
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
                  const SizedBox(width: 16),
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
