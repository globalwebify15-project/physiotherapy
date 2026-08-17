import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _voiceGuidance = true;
  bool _beepSounds = true;
  bool _hapticFeedback = true;
  TimeOfDay _reminderTime = const TimeOfDay(hour: 8, minute: 0);

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _reminderTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0F766E), // deep teal
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF0F766E),
              ),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _reminderTime) {
      setState(() {
        _reminderTime = picked;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Exercise reminder scheduled for ${_reminderTime.format(context)}'),
            backgroundColor: const Color(0xFF0F766E),
          ),
        );
      }
    }
  }

  void _clearCache() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear Local Cache', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        content: const Text(
          'This will delete cached exercise videos, images, and session logs. Are you sure you want to proceed?',
          style: TextStyle(color: Color(0xFF64748B), height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showProgressDialog();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: const Text('Clear', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showProgressDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return const Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Center(
            child: Card(
              color: Colors.white,
              shape: CircleBorder(),
              elevation: 4,
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: CircularProgressIndicator(color: Color(0xFF0F766E)),
              ),
            ),
          ),
        );
      },
    );

    // Simulate completion
    Future.delayed(const Duration(seconds: 1, milliseconds: 500), () {
      if (mounted) {
        Navigator.pop(context); // Pop loading spinner
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cache successfully cleared!'),
            backgroundColor: Color(0xFF0F766E),
          ),
        );
      }
    });
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 20.0, top: 24, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Color(0xFF94A3B8),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        value: value,
        onChanged: onChanged,
        activeColor: const Color(0xFF0F766E),
        inactiveTrackColor: const Color(0xFFE2E8F0),
        secondary: CircleAvatar(
          backgroundColor: const Color(0xFFF1F5F9),
          child: Icon(icon, color: const Color(0xFF0F766E), size: 20),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = ref.watch(themeModeProvider) == ThemeMode.dark;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader('Appearance'),
              _buildSwitchTile(
                title: 'Dark Mode',
                subtitle: 'Use a darker visual palette',
                value: isDarkMode,
                icon: Icons.dark_mode_rounded,
                onChanged: (val) {
                  ref.read(themeModeProvider.notifier).state = val ? ThemeMode.dark : ThemeMode.light;
                },
              ),

              _buildSectionHeader('Reminders & Alerts'),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      backgroundColor: Color(0xFFF1F5F9),
                      child: Icon(Icons.alarm_rounded, color: Color(0xFF0F766E), size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Daily Exercise Reminder',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Scheduled for ${_reminderTime.format(context)}',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => _selectTime(context),
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFF0F766E),
                        backgroundColor: const Color(0xFF0F766E).withOpacity(0.08),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      child: const Text('Change', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
              ),

              _buildSectionHeader('Sounds & Haptics'),
              _buildSwitchTile(
                title: 'Voice Guidance',
                subtitle: 'Audio assistant calls out workout reps',
                value: _voiceGuidance,
                icon: Icons.record_voice_over_rounded,
                onChanged: (val) => setState(() => _voiceGuidance = val),
              ),
              _buildSwitchTile(
                title: 'Beep Alerts',
                subtitle: 'Play sound at start and end of sets',
                value: _beepSounds,
                icon: Icons.volume_up_rounded,
                onChanged: (val) => setState(() => _beepSounds = val),
              ),
              _buildSwitchTile(
                title: 'Tactile Haptics',
                subtitle: 'Provide vibration cues during hold times',
                value: _hapticFeedback,
                icon: Icons.vibration_rounded,
                onChanged: (val) => setState(() => _hapticFeedback = val),
              ),

              _buildSectionHeader('Storage'),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      backgroundColor: Color(0xFFFDF2F2),
                      child: Icon(Icons.delete_sweep_rounded, color: Colors.red, size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Clear Cached Data',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Used space: 142.4 MB',
                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _clearCache,
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.red.shade700,
                        backgroundColor: Colors.red.shade50,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      child: const Text('Clear', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}
