import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ExercisesScreen extends StatefulWidget {
  const ExercisesScreen({super.key});

  @override
  State<ExercisesScreen> createState() => _ExercisesScreenState();
}

class _ExercisesScreenState extends State<ExercisesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _exercises = [
    {
      'title': 'Pelvic Tilt',
      'sub': '3 sets x 15 reps',
      'completed': true,
      'steps': [
        'Lie on your back with knees bent and feet flat on the floor.',
        'Flatten your lower back against the floor by tightening your abdominal muscles.',
        'Hold for 5 seconds, then relax.',
        'Repeat 15 times.'
      ],
      'reps': '15',
      'sets': '3',
      'durationSec': 45 // estimated duration
    },
    {
      'title': 'Knee to Chest Stretch',
      'sub': '3 sets x 30 sec',
      'completed': true,
      'steps': [
        'Lie flat on your back with legs straight.',
        'Pull one knee up towards your chest, clasping your hands behind your thigh.',
        'Keep the other leg flat on the floor.',
        'Hold stretch for 30 seconds, then alternate legs.'
      ],
      'reps': '30s',
      'sets': '3',
      'durationSec': 30
    },
    {
      'title': 'Cat Cow Stretch',
      'sub': '3 sets x 15 reps',
      'completed': false,
      'steps': [
        'Start on your hands and knees in a tabletop position.',
        'Inhale, drop your belly towards the floor and look up (Cow).',
        'Exhale, arch your spine and tuck your chin towards your chest (Cat).',
        'Repeat slow and controlled.'
      ],
      'reps': '15',
      'sets': '3',
      'durationSec': 45
    },
    {
      'title': 'Bridge Exercise',
      'sub': '3 sets x 15 reps',
      'completed': false,
      'steps': [
        'Lie on your back with knees bent and feet flat on the floor.',
        'Lift your hips off the floor until your knees, hips, and shoulders form a straight line.',
        'Squeeze your glutes and hold for 2 seconds.',
        'Lower slowly and repeat.'
      ],
      'reps': '15',
      'sets': '3',
      'durationSec': 45
    },
    {
      'title': 'Hamstring Stretch',
      'sub': '3 sets x 30 sec',
      'completed': false,
      'steps': [
        'Lie on your back and loop a towel/strap around the ball of one foot.',
        'Gently pull the strap to raise your leg, keeping your knee slightly straight.',
        'Hold for 30 seconds, then release and repeat with the other leg.'
      ],
      'reps': '30s',
      'sets': '3',
      'durationSec': 30
    }
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  int get _completedCount => _exercises.where((e) => e['completed'] == true).length;

  void _startGuidedWorkout(Map<String, dynamic> exercise) {
    Navigator.pop(context); // Close bottom sheet
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.9),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, anim1, anim2) {
        return GuidedTimerOverlay(
          exercise: exercise,
          onWorkoutFinished: () {
            setState(() {
              exercise['completed'] = true;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Awesome! You completed ${exercise['title']}!'),
                backgroundColor: const Color(0xFF10B981),
              ),
            );
          },
        );
      },
    );
  }

  void _showExerciseDetail(Map<String, dynamic> exercise) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.88,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 12),
                  Center(
                    child: Container(
                      width: 48,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Detail Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            exercise['title'],
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () => Navigator.pop(context),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Large Mock Video Player Widget
                          Container(
                            height: 220,
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // Play Overlay button
                                CircleAvatar(
                                  radius: 36,
                                  backgroundColor: Colors.white.withOpacity(0.9),
                                  child: const Icon(Icons.play_arrow_rounded, size: 40, color: Color(0xFF0F766E)),
                                ),
                                const Positioned(
                                  bottom: 16,
                                  left: 16,
                                  child: Text(
                                    'Demo Video',
                                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                )
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // How to do instructions
                          const Text(
                            'How to do',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 12),
                          ...List.generate(exercise['steps'].length, (index) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10.0),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    margin: const EdgeInsets.only(top: 4),
                                    width: 6,
                                    height: 6,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0F766E),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      exercise['steps'][index],
                                      style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), height: 1.4),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                          const SizedBox(height: 28),

                          // Circular Stats Display Cards
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Column(
                                    children: [
                                      const Text('Reps / Time', style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 6),
                                      Text(exercise['reps'], style: const TextStyle(color: Color(0xFF0F172A), fontSize: 22, fontWeight: FontWeight.w800)),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Column(
                                    children: [
                                      const Text('Sets', style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 6),
                                      Text(exercise['sets'], style: const TextStyle(color: Color(0xFF0F172A), fontSize: 22, fontWeight: FontWeight.w800)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 36),

                          // Prominent start guided workout button
                          ElevatedButton.icon(
                            onPressed: () => _startGuidedWorkout(exercise),
                            icon: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 20),
                            label: const Text('Start Guided Session', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F766E),
                              foregroundColor: Colors.white,
                              minimumSize: const Size(double.infinity, 58),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                          const SizedBox(height: 12),

                          OutlinedButton(
                            onPressed: () {
                              setModalState(() {
                                exercise['completed'] = !exercise['completed'];
                              });
                              setState(() {});
                              Navigator.pop(context);
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: exercise['completed'] ? Colors.red : const Color(0xFF0F766E),
                              minimumSize: const Size(double.infinity, 52),
                              side: BorderSide(color: exercise['completed'] ? Colors.red.shade200 : const Color(0xFFE2E8F0)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: Text(
                              exercise['completed'] ? 'Mark as Incomplete' : 'Mark as Completed',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('My Exercises', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Tabs Row
            TabBar(
              controller: _tabController,
              labelColor: const Color(0xFF0F766E),
              unselectedLabelColor: const Color(0xFF94A3B8),
              indicatorColor: const Color(0xFF0F766E),
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              tabs: const [
                Tab(text: 'Current Plan'),
                Tab(text: 'All Exercises'),
              ],
            ),
            const SizedBox(height: 16),

            // Tab contents
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Current Plan
                  SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Completion status block
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFDCFCE7)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'Day 1 - Lower Back Pain Relief',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF166534)),
                                  ),
                                  SizedBox(height: 4),
                                  Text('Plan assigned by Dr. Anjali', style: TextStyle(fontSize: 12, color: Color(0xFF15803D))),
                                ],
                              ),
                              Text(
                                '$_completedCount / ${_exercises.length} Completed',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF166534)),
                              )
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Exercises List
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _exercises.length,
                          itemBuilder: (context, index) {
                            final ex = _exercises[index];
                            final isCompleted = ex['completed'] == true;

                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 12),
                              color: const Color(0xFFF8FAFC),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: isCompleted ? const Color(0xFFDCFCE7) : const Color(0xFFE2E8F0)),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                leading: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: isCompleted ? const Color(0xFFDCFCE7) : const Color(0xFFE2E8F0),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    Icons.accessibility_new_rounded, 
                                    color: isCompleted ? const Color(0xFF166534) : const Color(0xFF64748B), 
                                    size: 24
                                  ),
                                ),
                                title: Text(
                                  ex['title'],
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold, 
                                    fontSize: 15,
                                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                                    color: isCompleted ? const Color(0xFF94A3B8) : const Color(0xFF0F172A),
                                  ),
                                ),
                                subtitle: Text(
                                  ex['sub'],
                                  style: TextStyle(
                                    fontSize: 12, 
                                    color: isCompleted ? const Color(0xFF94A3B8) : const Color(0xFF64748B)
                                  ),
                                ),
                                trailing: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      ex['completed'] = !ex['completed'];
                                    });
                                  },
                                  child: Icon(
                                    isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                    color: isCompleted ? const Color(0xFF22C55E) : const Color(0xFF94A3B8),
                                    size: 26,
                                  ),
                                ),
                                onTap: () => _showExerciseDetail(ex),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),

                  // Tab 2: All Exercises
                  const Center(
                    child: Text('Search and browse all 50+ therapy exercises.', style: TextStyle(color: Color(0xFF64748B))),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Stateful Guided Timer Overlay that handles countdowns & renders Custom Confetti
class GuidedTimerOverlay extends StatefulWidget {
  final Map<String, dynamic> exercise;
  final VoidCallback onWorkoutFinished;

  const GuidedTimerOverlay({
    super.key,
    required this.exercise,
    required this.onWorkoutFinished,
  });

  @override
  State<GuidedTimerOverlay> createState() => _GuidedTimerOverlayState();
}

class _GuidedTimerOverlayState extends State<GuidedTimerOverlay> with SingleTickerProviderStateMixin {
  late int _timeLeft;
  bool _isPlaying = true;
  Timer? _timer;
  late final int _totalDuration;
  
  // Confetti fields
  final List<_ConfettiParticle> _particles = [];
  bool _isFinished = false;
  late AnimationController _animationController;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _totalDuration = widget.exercise['durationSec'] ?? 30;
    _timeLeft = _totalDuration;
    _startTimer();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..addListener(() {
        if (_isFinished) {
          _updateParticles();
        }
      });
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPlaying) return;
      
      setState(() {
        if (_timeLeft > 1) {
          _timeLeft--;
        } else {
          _timeLeft = 0;
          _timer?.cancel();
          _triggerFinish();
        }
      });
    });
  }

  void _triggerFinish() {
    setState(() {
      _isFinished = true;
    });
    
    // Spawn 100 confetti particles
    for (int i = 0; i < 120; i++) {
      _particles.add(
        _ConfettiParticle(
          x: _random.nextDouble() * 360,
          y: -10.0 - _random.nextDouble() * 150,
          size: 6.0 + _random.nextDouble() * 6,
          color: Colors.primaries[_random.nextInt(Colors.primaries.length)],
          speed: 150.0 + _random.nextDouble() * 200,
          angle: pi / 2 + (_random.nextDouble() - 0.5) * 0.5,
          rotationSpeed: (_random.nextDouble() - 0.5) * 8,
          rotation: _random.nextDouble() * 2 * pi,
        ),
      );
    }
    
    _animationController.forward().then((value) {
      widget.onWorkoutFinished();
      Navigator.pop(context);
    });
  }

  void _updateParticles() {
    setState(() {
      for (final p in _particles) {
        // Gravity physics update
        p.y += p.speed * 0.016; // 60fps step approx
        p.x += sin(p.y * 0.05) * 0.6; // swing back & forth
        p.rotation += p.rotationSpeed * 0.016;
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final progress = _timeLeft / _totalDuration;
    
    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.9),
      body: Stack(
        children: [
          // Screen UI content
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 28),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Text(
                      widget.exercise['title'],
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 48),
                  ],
                ),
                const Spacer(),

                // Stylized visual form display
                Container(
                  height: 180,
                  width: 180,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: _isPlaying && !_isFinished
                        ? const CircularPulseWave()
                        : const Icon(Icons.accessibility_new_rounded, size: 80, color: Color(0xFF0D9488)),
                  ),
                ),
                const SizedBox(height: 60),

                // Timer Circular Progress indicator
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 160,
                      height: 160,
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 10,
                        backgroundColor: Colors.white10,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0D9488)),
                      ),
                    ),
                    Column(
                      children: [
                        Text(
                          '$_timeLeft',
                          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const Text(
                          'seconds left',
                          style: TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.w500),
                        )
                      ],
                    )
                  ],
                ),
                const Spacer(),

                // Playback Control buttons
                if (!_isFinished) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isPlaying = !_isPlaying;
                          });
                        },
                        child: CircleAvatar(
                          radius: 36,
                          backgroundColor: const Color(0xFF0F766E),
                          child: Icon(
                            _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                            size: 36,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _triggerFinish,
                    child: const Text('Skip to Complete', style: TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ] else ...[
                  const Text(
                    'COMPLETED!',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10B981), letterSpacing: 2),
                  )
                ],
                const SizedBox(height: 48),
              ],
            ),
          ),

          // Custom Confetti canvas drawn overlay
          if (_isFinished)
            IgnorePointer(
              child: CustomPaint(
                size: Size.infinite,
                painter: _ConfettiPainter(particles: _particles),
              ),
            ),
        ],
      ),
    );
  }
}

// A simple wave pulse widget shown during active work
class CircularPulseWave extends StatefulWidget {
  const CircularPulseWave({super.key});

  @override
  State<CircularPulseWave> createState() => _CircularPulseWaveState();
}

class _CircularPulseWaveState extends State<CircularPulseWave> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 80 + (80 * _controller.value),
              height: 80 + (80 * _controller.value),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF0D9488).withOpacity(0.2 * (1 - _controller.value)),
              ),
            ),
            const Icon(Icons.directions_run_rounded, size: 64, color: Color(0xFF0D9488)),
          ],
        );
      },
    );
  }
}

// Particle representation
class _ConfettiParticle {
  double x;
  double y;
  double size;
  Color color;
  double speed;
  double angle;
  double rotationSpeed;
  double rotation;

  _ConfettiParticle({
    required this.x,
    required this.y,
    required this.size,
    required this.color,
    required this.speed,
    required this.angle,
    required this.rotationSpeed,
    required this.rotation,
  });
}

// Confetti painter
class _ConfettiPainter extends CustomPainter {
  final List<_ConfettiParticle> particles;

  _ConfettiPainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final paint = Paint()
        ..color = p.color
        ..style = PaintingStyle.fill;
        
      canvas.save();
      canvas.translate(p.x, p.y);
      canvas.rotate(p.rotation);
      
      // Draw rectangular confetti piece
      canvas.drawRect(
        Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size * 0.6),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
