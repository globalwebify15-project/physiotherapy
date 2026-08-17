import 'package:flutter_riverpod/flutter_riverpod.dart';

class ExerciseItem {
  final String title;
  final String sub;
  final bool completed;
  final List<String> steps;
  final String reps;
  final String sets;
  final int durationSec;

  ExerciseItem({
    required this.title,
    required this.sub,
    required this.completed,
    required this.steps,
    required this.reps,
    required this.sets,
    required this.durationSec,
  });

  ExerciseItem copyWith({
    String? title,
    String? sub,
    bool? completed,
    List<String>? steps,
    String? reps,
    String? sets,
    int? durationSec,
  }) {
    return ExerciseItem(
      title: title ?? this.title,
      sub: sub ?? this.sub,
      completed: completed ?? this.completed,
      steps: steps ?? this.steps,
      reps: reps ?? this.reps,
      sets: sets ?? this.sets,
      durationSec: durationSec ?? this.durationSec,
    );
  }
}

class ExercisesNotifier extends StateNotifier<List<ExerciseItem>> {
  ExercisesNotifier() : super(_defaultExercises);

  static final List<ExerciseItem> _defaultExercises = [
    ExerciseItem(
      title: 'Pelvic Tilt',
      sub: '3 sets x 15 reps',
      completed: true,
      steps: [
        'Lie on your back with knees bent and feet flat on the floor.',
        'Flatten your lower back against the floor by tightening your abdominal muscles.',
        'Hold for 5 seconds, then relax.',
        'Repeat 15 times.'
      ],
      reps: '15',
      sets: '3',
      durationSec: 45,
    ),
    ExerciseItem(
      title: 'Knee to Chest Stretch',
      sub: '3 sets x 30 sec',
      completed: true,
      steps: [
        'Lie flat on your back with legs straight.',
        'Pull one knee up towards your chest, clasping your hands behind your thigh.',
        'Keep the other leg flat on the floor.',
        'Hold stretch for 30 seconds, then alternate legs.'
      ],
      reps: '30s',
      sets: '3',
      durationSec: 30,
    ),
    ExerciseItem(
      title: 'Cat Cow Stretch',
      sub: '3 sets x 15 reps',
      completed: false,
      steps: [
        'Start on your hands and knees in a tabletop position.',
        'Inhale, drop your belly towards the floor and look up (Cow).',
        'Exhale, arch your spine and tuck your chin towards your chest (Cat).',
        'Repeat slow and controlled.'
      ],
      reps: '15',
      sets: '3',
      durationSec: 45,
    ),
    ExerciseItem(
      title: 'Bridge Exercise',
      sub: '3 sets x 15 reps',
      completed: false,
      steps: [
        'Lie on your back with knees bent and feet flat on the floor.',
        'Lift your hips off the floor until your knees, hips, and shoulders form a straight line.',
        'Squeeze your glutes and hold for 2 seconds.',
        'Lower slowly and repeat.'
      ],
      reps: '15',
      sets: '3',
      durationSec: 45,
    ),
    ExerciseItem(
      title: 'Hamstring Stretch',
      sub: '3 sets x 30 sec',
      completed: false,
      steps: [
        'Lie on your back and loop a towel/strap around the ball of one foot.',
        'Gently pull the strap to raise your leg, keeping your knee slightly straight.',
        'Hold for 30 seconds, then release and repeat with the other leg.'
      ],
      reps: '30s',
      sets: '3',
      durationSec: 30,
    )
  ];

  void toggleCompleted(String title) {
    state = [
      for (final ex in state)
        if (ex.title == title) ex.copyWith(completed: !ex.completed) else ex
    ];
  }

  void markCompleted(String title, bool completed) {
    state = [
      for (final ex in state)
        if (ex.title == title) ex.copyWith(completed: completed) else ex
    ];
  }
}

final exercisesProvider = StateNotifierProvider<ExercisesNotifier, List<ExerciseItem>>((ref) {
  return ExercisesNotifier();
});
