import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PainTrackerScreen extends StatefulWidget {
  const PainTrackerScreen({super.key});

  @override
  State<PainTrackerScreen> createState() => _PainTrackerScreenState();
}

class _PainTrackerScreenState extends State<PainTrackerScreen> {
  int _selectedSeverityIndex = 0;
  final Set<String> _selectedBodyParts = {};
  final _noteController = TextEditingController();

  final List<Map<String, dynamic>> _severities = [
    {'icon': '😊', 'label': 'No Pain', 'color': Colors.green},
    {'icon': '🙂', 'label': 'Mild', 'color': Colors.lightGreen},
    {'icon': '😐', 'label': 'Moderate', 'color': Colors.amber},
    {'icon': '😟', 'label': 'Severe', 'color': Colors.orange},
    {'icon': '😭', 'label': 'Worst', 'color': Colors.red},
  ];

  final List<String> _bodyParts = [
    'Neck', 'Shoulders', 'Upper Back', 'Lower Back',
    'Elbows', 'Wrists', 'Hips', 'Knees', 'Ankles'
  ];

  void _savePainLog() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Pain Log Saved Successfully!')),
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
              const SizedBox(height: 16),

              // Severity Smiley Scale Grid Row (Screen 7 Layout)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(_severities.length, (index) {
                  final s = _severities[index];
                  final isSelected = _selectedSeverityIndex == index;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedSeverityIndex = index);
                    },
                    child: Column(
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected ? s['color'].withOpacity(0.15) : const Color(0xFFF8FAFC),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? s['color'] : const Color(0xFFE2E8F0),
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Text(
                            s['icon'],
                            style: const TextStyle(fontSize: 26),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          s['label'],
                          style: TextStyle(
                            fontSize: 11, 
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF64748B)
                          ),
                        )
                      ],
                    ),
                  );
                }),
              ),
              const SizedBox(height: 32),

              // Pain Area Selection Grid
              const Text('Select Pain Area', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 8),
              const Text('Tap the areas where you feel discomfort or stiffness:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              const SizedBox(height: 16),
              
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _bodyParts.map((part) {
                  final isSelected = _selectedBodyParts.contains(part);
                  return FilterChip(
                    label: Text(part, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                    selected: isSelected,
                    selectedColor: const Color(0xFF0F766E).withOpacity(0.15),
                    checkmarkColor: const Color(0xFF0F766E),
                    labelStyle: TextStyle(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF0F172A)),
                    backgroundColor: const Color(0xFFF8FAFC),
                    onSelected: (val) {
                      setState(() {
                        if (val) {
                          _selectedBodyParts.add(part);
                        } else {
                          _selectedBodyParts.remove(part);
                        }
                      });
                    },
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0)),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),

              // Notes Input Textbox (Screen 7 Layout)
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

              // Save Button (Screen 7 Layout)
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
