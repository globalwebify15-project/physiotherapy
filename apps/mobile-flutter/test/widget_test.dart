// This is a basic Flutter widget test.
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/main.dart';

void main() {
  testWidgets('App initialization smoke test', (WidgetTester tester) async {
    // Build our app under ProviderScope and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: PhysioApp(),
      ),
    );

    // Verify that onboarding screen components are present
    expect(find.byType(PhysioApp), findsOneWidget);
  });
}
