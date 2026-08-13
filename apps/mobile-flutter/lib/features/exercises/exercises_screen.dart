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
      'sets': '3'
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
      'sets': '3'
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
      'sets': '3'
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
      'sets': '3'
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
      'sets': '3'
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
                          // Large Mock Video Player Widget (Screen 6 Layout)
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

                          ElevatedButton(
                            onPressed: () {
                              setModalState(() {
                                exercise['completed'] = !exercise['completed'];
                              });
                              // update outer state
                              setState(() {});
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: exercise['completed'] ? const Color(0xFF64748B) : const Color(0xFF0F766E),
                              foregroundColor: Colors.white,
                              minimumSize: const Size(double.infinity, 56),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: Text(
                              exercise['completed'] ? 'Mark as Incomplete' : 'Mark as Completed',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
                        // Completion status block (Screen 5 Layout)
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

                  // Tab 2: All Exercises (Simulated Placeholder)
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
