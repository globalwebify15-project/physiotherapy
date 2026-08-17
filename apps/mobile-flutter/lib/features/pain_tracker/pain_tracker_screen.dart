import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PainTrackerScreen extends StatefulWidget {
  const PainTrackerScreen({super.key});

  @override
  State<PainTrackerScreen> createState() => _PainTrackerScreenState();
}

class _PainTrackerScreenState extends State<PainTrackerScreen> with SingleTickerProviderStateMixin {
  int _selectedSeverityIndex = 2;
  final Set<String> _selectedBodyParts = {};
  final _noteController = TextEditingController();
  bool _isBackView = true; // Toggle between Front and Back anatomical views

  final List<Map<String, dynamic>> _severities = [
    {'icon': '😊', 'label': 'No Pain', 'color': Colors.green, 'desc': 'Feeling perfect'},
    {'icon': '🙂', 'label': 'Mild', 'color': Colors.lightGreen, 'desc': 'Noticeable but easy to ignore'},
    {'icon': '😐', 'label': 'Moderate', 'color': Colors.amber, 'desc': 'Distracting, affects focus'},
    {'icon': '😟', 'label': 'Severe', 'color': Colors.orange, 'desc': 'Hard to ignore, limits movement'},
    {'icon': '😭', 'label': 'Worst', 'color': Colors.red, 'desc': 'Unbearable pain, needs immediate rest'},
  ];

  // Helper maps of bounding areas for custom paint taps
  // Canvas coordinate system assumed: 200 x 320
  late final Map<String, Rect> _bodyZonesBack = {
    'Neck': const Rect.fromLTWH(85, 52, 30, 20),
    'Shoulders': const Rect.fromLTWH(50, 72, 100, 20),
    'Upper Back': const Rect.fromLTWH(75, 72, 50, 43),
    'Lower Back': const Rect.fromLTWH(75, 115, 50, 45),
    'Elbows': const Rect.fromLTWH(42, 105, 116, 25), // spans both sides for simplicity
    'Wrists': const Rect.fromLTWH(35, 135, 130, 25),
    'Hips': const Rect.fromLTWH(75, 160, 50, 30),
  };

  late final Map<String, Rect> _bodyZonesFront = {
    'Chest': const Rect.fromLTWH(75, 72, 50, 35),
    'Abs': const Rect.fromLTWH(75, 107, 50, 45),
    'Knees': const Rect.fromLTWH(65, 225, 70, 30),
    'Ankles': const Rect.fromLTWH(65, 280, 70, 30),
  };

  void _handleBodyTap(Offset localPos) {
    final zones = _isBackView ? _bodyZonesBack : _bodyZonesFront;
    String? tappedPart;

    // Check specific parts
    if (_isBackView) {
      if (zones['Neck']!.contains(localPos)) {
        tappedPart = 'Neck';
      } else if (zones['Upper Back']!.contains(localPos)) {
        tappedPart = 'Upper Back';
      } else if (zones['Lower Back']!.contains(localPos)) {
        tappedPart = 'Lower Back';
      } else if (zones['Hips']!.contains(localPos)) {
        tappedPart = 'Hips';
      } else if (localPos.dx < 75 && localPos.dy >= 105 && localPos.dy <= 130) {
        tappedPart = 'Elbows';
      } else if (localPos.dx > 125 && localPos.dy >= 105 && localPos.dy <= 130) {
        tappedPart = 'Elbows';
      } else if (localPos.dx < 75 && localPos.dy >= 135 && localPos.dy <= 160) {
        tappedPart = 'Wrists';
      } else if (localPos.dx > 125 && localPos.dy >= 135 && localPos.dy <= 160) {
        tappedPart = 'Wrists';
      } else if (localPos.dx < 100 && localPos.dy >= 72 && localPos.dy <= 92) {
        tappedPart = 'Shoulders';
      } else if (localPos.dx > 100 && localPos.dy >= 72 && localPos.dy <= 92) {
        tappedPart = 'Shoulders';
      }
    } else {
      if (zones['Chest']!.contains(localPos)) {
        tappedPart = 'Chest';
      } else if (zones['Abs']!.contains(localPos)) {
        tappedPart = 'Abs';
      } else if (localPos.dx < 100 && localPos.dy >= 225 && localPos.dy <= 255) {
        tappedPart = 'Knees';
      } else if (localPos.dx > 100 && localPos.dy >= 225 && localPos.dy <= 255) {
        tappedPart = 'Knees';
      } else if (localPos.dx < 100 && localPos.dy >= 280 && localPos.dy <= 310) {
        tappedPart = 'Ankles';
      } else if (localPos.dx > 100 && localPos.dy >= 280 && localPos.dy <= 310) {
        tappedPart = 'Ankles';
      }
    }

    if (tappedPart != null) {
      setState(() {
        if (_selectedBodyParts.contains(tappedPart)) {
          _selectedBodyParts.remove(tappedPart);
        } else {
          _selectedBodyParts.add(tappedPart!);
        }
      });
      // Small trigger vibration
    }
  }

  void _savePainLog() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Pain Log Saved Successfully!'),
        backgroundColor: Color(0xFF0F766E),
      ),
    );
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Pain Tracker', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Text('How is your pain now?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 12),
              
              // Animated Severity smiley cards
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _severities.length,
                  itemBuilder: (context, index) {
                    final s = _severities[index];
                    final isSelected = _selectedSeverityIndex == index;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedSeverityIndex = index),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 96,
                        margin: const EdgeInsets.only(right: 12, top: 4, bottom: 4),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected ? s['color'].withOpacity(0.08) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? s['color'] : const Color(0xFFE2E8F0),
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected
                              ? [BoxShadow(color: s['color'].withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 4))]
                              : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(s['icon'], style: const TextStyle(fontSize: 28)),
                            const SizedBox(height: 6),
                            Text(
                              s['label'],
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                color: isSelected ? s['color'] : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _severities[_selectedSeverityIndex]['desc'],
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontStyle: FontStyle.italic),
              ),
              const SizedBox(height: 32),

              // Interactive 2D Body Map
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Interactive Body Map', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      SizedBox(height: 4),
                      Text('Tap regions directly to log pain', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    ],
                  ),
                  
                  // Front/Back View Switcher Tab Button
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _isBackView = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: !_isBackView ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                              boxShadow: !_isBackView
                                  ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]
                                  : null,
                            ),
                            child: Text(
                              'Front',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: !_isBackView ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() => _isBackView = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: _isBackView ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                              boxShadow: _isBackView
                                  ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]
                                  : null,
                            ),
                            child: Text(
                              'Back',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _isBackView ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              Center(
                child: Container(
                  height: 320,
                  width: 200,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: GestureDetector(
                    onTapDown: (details) => _handleBodyTap(details.localPosition),
                    child: CustomPaint(
                      size: const Size(200, 320),
                      painter: _BodyMapPainter(
                        selectedParts: _selectedBodyParts,
                        isBackView: _isBackView,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Chips summary representing selections
              if (_selectedBodyParts.isNotEmpty) ...[
                const Text(
                  'Selected Areas:',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _selectedBodyParts.map((part) {
                    return Chip(
                      label: Text(part, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F766E))),
                      backgroundColor: const Color(0xFF0F766E).withOpacity(0.08),
                      deleteIcon: const Icon(Icons.close_rounded, size: 14, color: Color(0xFF0F766E)),
                      onDeleted: () {
                        setState(() => _selectedBodyParts.remove(part));
                      },
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(color: Color(0xFF0F766E), width: 0.5),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
              ],

              // Notes Input Textbox
              const Text('Add Note (Optional)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 12),
              TextField(
                controller: _noteController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Write how you feel or what triggered the pain...',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFF0F766E), width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Save Button
              ElevatedButton(
                onPressed: _savePainLog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E), // Premium dark teal
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Save Log', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _BodyMapPainter extends CustomPainter {
  final Set<String> selectedParts;
  final bool isBackView;

  _BodyMapPainter({
    required this.selectedParts,
    required this.isBackView,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    final paintOutline = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    final paintBase = Paint()
      ..color = const Color(0xFFF1F5F9)
      ..style = PaintingStyle.fill;

    final highlightPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(0.18) // Red highlight
      ..style = PaintingStyle.fill;

    final highlightStroke = Paint()
      ..color = const Color(0xFFEF4444)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Helper functions to draw body segments
    // Abstract stylized human figure:
    // Head: Circle center (100, 35) radius 18
    final headCenter = Offset(w / 2, 35);
    canvas.drawCircle(headCenter, 18, paintBase);
    canvas.drawCircle(headCenter, 18, paintOutline);

    // Neck: Connect head to shoulders (rect 92, 53 to 108, 72)
    final neckPath = Path()
      ..moveTo(91, 52)
      ..lineTo(109, 52)
      ..lineTo(109, 72)
      ..lineTo(91, 72)
      ..close();
    canvas.drawPath(neckPath, paintBase);
    canvas.drawPath(neckPath, paintOutline);

    if (isBackView && selectedParts.contains('Neck')) {
      canvas.drawPath(neckPath, highlightPaint);
      canvas.drawPath(neckPath, highlightStroke);
    }

    // Torso: rect (75, 72 to 125, 160)
    final torsoPath = Path()
      ..moveTo(75, 72)
      ..lineTo(125, 72)
      ..lineTo(121, 160)
      ..lineTo(79, 160)
      ..close();
    canvas.drawPath(torsoPath, paintBase);
    canvas.drawPath(torsoPath, paintOutline);

    // Render Torso components
    if (isBackView) {
      // Upper Back: top half of torso
      final upperBackPath = Path()
        ..moveTo(75, 72)
        ..lineTo(125, 72)
        ..lineTo(123, 115)
        ..lineTo(77, 115)
        ..close();
      if (selectedParts.contains('Upper Back')) {
        canvas.drawPath(upperBackPath, highlightPaint);
        canvas.drawPath(upperBackPath, highlightStroke);
      }

      // Lower Back: bottom half of torso
      final lowerBackPath = Path()
        ..moveTo(77, 115)
        ..lineTo(123, 115)
        ..lineTo(121, 160)
        ..lineTo(79, 160)
        ..close();
      if (selectedParts.contains('Lower Back')) {
        canvas.drawPath(lowerBackPath, highlightPaint);
        canvas.drawPath(lowerBackPath, highlightStroke);
      }
    } else {
      // Front View Torso splits into Chest and Abs
      final chestPath = Path()
        ..moveTo(75, 72)
        ..lineTo(125, 72)
        ..lineTo(123, 107)
        ..lineTo(77, 107)
        ..close();
      if (selectedParts.contains('Chest')) {
        canvas.drawPath(chestPath, highlightPaint);
        canvas.drawPath(chestPath, highlightStroke);
      }

      final absPath = Path()
        ..moveTo(77, 107)
        ..lineTo(123, 107)
        ..lineTo(121, 160)
        ..lineTo(79, 160)
        ..close();
      if (selectedParts.contains('Abs')) {
        canvas.drawPath(absPath, highlightPaint);
        canvas.drawPath(absPath, highlightStroke);
      }
    }

    // Shoulders: Capsules at top-corners
    final leftShoulderCenter = Offset(62, 75);
    final rightShoulderCenter = Offset(138, 75);
    canvas.drawCircle(leftShoulderCenter, 8, paintBase);
    canvas.drawCircle(leftShoulderCenter, 8, paintOutline);
    canvas.drawCircle(rightShoulderCenter, 8, paintBase);
    canvas.drawCircle(rightShoulderCenter, 8, paintOutline);

    if (isBackView && selectedParts.contains('Shoulders')) {
      canvas.drawCircle(leftShoulderCenter, 8, highlightPaint);
      canvas.drawCircle(leftShoulderCenter, 8, highlightStroke);
      canvas.drawCircle(rightShoulderCenter, 8, highlightPaint);
      canvas.drawCircle(rightShoulderCenter, 8, highlightStroke);
    }

    // Left Arm: (62, 83) to (48, 150)
    final leftArmPath = Path()
      ..moveTo(55, 80)
      ..lineTo(42, 140)
      ..lineTo(54, 140)
      ..lineTo(68, 83)
      ..close();
    canvas.drawPath(leftArmPath, paintBase);
    canvas.drawPath(leftArmPath, paintOutline);

    // Right Arm: (138, 83) to (152, 150)
    final rightArmPath = Path()
      ..moveTo(145, 80)
      ..lineTo(158, 140)
      ..lineTo(146, 140)
      ..lineTo(132, 83)
      ..close();
    canvas.drawPath(rightArmPath, paintBase);
    canvas.drawPath(rightArmPath, paintOutline);

    // Elbows check
    if (isBackView && selectedParts.contains('Elbows')) {
      // Left Elbow circle around (48, 115)
      canvas.drawCircle(const Offset(48, 115), 9, highlightPaint);
      canvas.drawCircle(const Offset(48, 115), 9, highlightStroke);
      // Right Elbow circle around (152, 115)
      canvas.drawCircle(const Offset(152, 115), 9, highlightPaint);
      canvas.drawCircle(const Offset(152, 115), 9, highlightStroke);
    }

    // Wrists check
    if (isBackView && selectedParts.contains('Wrists')) {
      canvas.drawCircle(const Offset(45, 142), 8, highlightPaint);
      canvas.drawCircle(const Offset(45, 142), 8, highlightStroke);
      canvas.drawCircle(const Offset(155, 142), 8, highlightPaint);
      canvas.drawCircle(const Offset(155, 142), 8, highlightStroke);
    }

    // Hips / Pelvis: (79, 160) to (121, 160) to legs
    final hipsPath = Path()
      ..moveTo(79, 160)
      ..lineTo(121, 160)
      ..lineTo(123, 190)
      ..lineTo(77, 190)
      ..close();
    canvas.drawPath(hipsPath, paintBase);
    canvas.drawPath(hipsPath, paintOutline);

    if (isBackView && selectedParts.contains('Hips')) {
      canvas.drawPath(hipsPath, highlightPaint);
      canvas.drawPath(hipsPath, highlightStroke);
    }

    // Left Leg: (77, 190) to (73, 305)
    final leftLegPath = Path()
      ..moveTo(77, 190)
      ..lineTo(73, 245)
      ..lineTo(73, 305)
      ..lineTo(92, 305)
      ..lineTo(97, 245)
      ..lineTo(100, 190)
      ..close();
    canvas.drawPath(leftLegPath, paintBase);
    canvas.drawPath(leftLegPath, paintOutline);

    // Right Leg: (123, 190) to (127, 305)
    final rightLegPath = Path()
      ..moveTo(123, 190)
      ..lineTo(127, 245)
      ..lineTo(127, 305)
      ..lineTo(108, 305)
      ..lineTo(103, 245)
      ..lineTo(100, 190)
      ..close();
    canvas.drawPath(rightLegPath, paintBase);
    canvas.drawPath(rightLegPath, paintOutline);

    // Knees
    if (!isBackView && selectedParts.contains('Knees')) {
      // Left Knee circle around (83, 245)
      canvas.drawCircle(const Offset(83, 245), 11, highlightPaint);
      canvas.drawCircle(const Offset(83, 245), 11, highlightStroke);
      // Right Knee circle around (117, 245)
      canvas.drawCircle(const Offset(117, 245), 11, highlightPaint);
      canvas.drawCircle(const Offset(117, 245), 11, highlightStroke);
    }

    // Ankles
    if (!isBackView && selectedParts.contains('Ankles')) {
      canvas.drawCircle(const Offset(83, 298), 9, highlightPaint);
      canvas.drawCircle(const Offset(83, 298), 9, highlightStroke);
      canvas.drawCircle(const Offset(117, 298), 9, highlightPaint);
      canvas.drawCircle(const Offset(117, 298), 9, highlightStroke);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
