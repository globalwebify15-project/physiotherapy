import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ConsultOnlineScreen extends StatelessWidget {
  const ConsultOnlineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Simulated Full Screen Video (Therapist avatar / backdrop)
          Positioned.fill(
            child: Container(
              color: const Color(0xFF1E293B),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircleAvatar(
                    radius: 72,
                    backgroundImage: NetworkImage('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop'),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Dr. Anjali Verma',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Connected • 04:35',
                    style: TextStyle(color: Colors.white54, fontSize: 14),
                  ),
                ],
              ),
            ),
          ),

          // User self-view (PIP window)
          Positioned(
            top: 60,
            right: 20,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 110,
                height: 160,
                color: const Color(0xFF0F172A),
                child: const Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(Icons.person_rounded, size: 48, color: Colors.white54),
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: Text(
                        'You',
                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Top back button
          Positioned(
            top: 50,
            left: 16,
            child: CircleAvatar(
              backgroundColor: Colors.black26,
              child: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
                onPressed: () => context.go('/home'),
              ),
            ),
          ),

          // Call controllers overlay (mute, video, chat, hangup)
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.white24,
                  child: IconButton(
                    icon: const Icon(Icons.videocam_rounded, color: Colors.white),
                    onPressed: () {},
                  ),
                ),
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.white24,
                  child: IconButton(
                    icon: const Icon(Icons.mic_rounded, color: Colors.white),
                    onPressed: () {},
                  ),
                ),
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.white24,
                  child: IconButton(
                    icon: const Icon(Icons.chat_bubble_rounded, color: Colors.white),
                    onPressed: () {},
                  ),
                ),
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.red,
                  child: IconButton(
                    icon: const Icon(Icons.call_end_rounded, color: Colors.white),
                    onPressed: () => context.go('/home'),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
