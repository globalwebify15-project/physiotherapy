import 'package:flutter/material.dart';

enum PhysioServiceType {
  strokeParalysis,
  parkinsonsAlzheimers,
  facialPalsy,
  vestibular,
  cervicalSpondylosis,
  lumbarSpondylosis,
  kneePainOA,
  tennisElbow,
  frozenShoulder,
  cpChild,
  developmentalDelay,
  autism,
  prenatalPostnatal,
  jointReplacement,
  sportsInjury,
  general
}

class ServiceInfographic extends StatelessWidget {
  final String title;
  final double size;
  final bool isCompact;

  const ServiceInfographic({
    super.key,
    required this.title,
    this.size = 80,
    this.isCompact = false,
  });

  static PhysioServiceType getServiceType(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('stroke') || lower.contains('paralysis')) {
      return PhysioServiceType.strokeParalysis;
    } else if (lower.contains("parkinson") || lower.contains("alzheimer")) {
      return PhysioServiceType.parkinsonsAlzheimers;
    } else if (lower.contains('facial') || lower.contains("bell's") || lower.contains('bells')) {
      return PhysioServiceType.facialPalsy;
    } else if (lower.contains('vestibular') || lower.contains('vertigo') || lower.contains('balance')) {
      return PhysioServiceType.vestibular;
    } else if (lower.contains('cervical') || lower.contains('neck')) {
      return PhysioServiceType.cervicalSpondylosis;
    } else if (lower.contains('lumbar') || lower.contains('back') || lower.contains('sciatica')) {
      return PhysioServiceType.lumbarSpondylosis;
    } else if (lower.contains('oa') || lower.contains('knee pain') || lower.contains('osteoarthritis')) {
      return PhysioServiceType.kneePainOA;
    } else if (lower.contains('tennis') || lower.contains('golfer') || lower.contains('elbow')) {
      return PhysioServiceType.tennisElbow;
    } else if (lower.contains('frozen shoulder') || lower.contains('shoulder')) {
      return PhysioServiceType.frozenShoulder;
    } else if (lower.contains('cp child') || lower.contains('cerebral palsy')) {
      return PhysioServiceType.cpChild;
    } else if (lower.contains('developmental') || lower.contains('delay')) {
      return PhysioServiceType.developmentalDelay;
    } else if (lower.contains('autism') || lower.contains('asd')) {
      return PhysioServiceType.autism;
    } else if (lower.contains('prenatal') || lower.contains('postnatal') || lower.contains('pregnancy')) {
      return PhysioServiceType.prenatalPostnatal;
    } else if (lower.contains('replacement') || lower.contains('arthroplasty') || lower.contains('hip')) {
      return PhysioServiceType.jointReplacement;
    } else if (lower.contains('sports') || lower.contains('athletic') || lower.contains('injury')) {
      return PhysioServiceType.sportsInjury;
    }
    return PhysioServiceType.general;
  }

  @override
  Widget build(BuildContext context) {
    final type = getServiceType(title);

    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _PhysioInfographicPainter(type: type, isCompact: isCompact),
      ),
    );
  }
}

class _PhysioInfographicPainter extends CustomPainter {
  final PhysioServiceType type;
  final bool isCompact;

  _PhysioInfographicPainter({required this.type, required this.isCompact});

  Color _getPrimaryColor(PhysioServiceType t) {
    switch (t) {
      case PhysioServiceType.strokeParalysis:
        return const Color(0xFF0284C7); // Sky blue
      case PhysioServiceType.parkinsonsAlzheimers:
        return const Color(0xFF7C3AED); // Violet
      case PhysioServiceType.facialPalsy:
        return const Color(0xFF0D9488); // Teal
      case PhysioServiceType.vestibular:
        return const Color(0xFF2563EB); // Royal Blue
      case PhysioServiceType.cervicalSpondylosis:
        return const Color(0xFFE11D48); // Rose
      case PhysioServiceType.lumbarSpondylosis:
        return const Color(0xFFD97706); // Amber
      case PhysioServiceType.kneePainOA:
        return const Color(0xFFEA580C); // Orange
      case PhysioServiceType.tennisElbow:
        return const Color(0xFF059669); // Emerald
      case PhysioServiceType.frozenShoulder:
        return const Color(0xFF4F46E5); // Indigo
      case PhysioServiceType.cpChild:
        return const Color(0xFFDB2777); // Pink
      case PhysioServiceType.developmentalDelay:
        return const Color(0xFF8B5CF6); // Purple
      case PhysioServiceType.autism:
        return const Color(0xFF10B981); // Mint
      case PhysioServiceType.prenatalPostnatal:
        return const Color(0xFFF43F5E); // Coral
      case PhysioServiceType.jointReplacement:
        return const Color(0xFF0891B2); // Cyan
      case PhysioServiceType.sportsInjury:
        return const Color(0xFF16A34A); // Green
      case PhysioServiceType.general:
        return const Color(0xFF0F766E); // Deep teal
    }
  }

  Color _getBgColor(PhysioServiceType t) {
    switch (t) {
      case PhysioServiceType.strokeParalysis:
        return const Color(0xFFE0F2FE);
      case PhysioServiceType.parkinsonsAlzheimers:
        return const Color(0xFFEDE9FE);
      case PhysioServiceType.facialPalsy:
        return const Color(0xFFCCFBF1);
      case PhysioServiceType.vestibular:
        return const Color(0xFFDBEAFE);
      case PhysioServiceType.cervicalSpondylosis:
        return const Color(0xFFFFE4E6);
      case PhysioServiceType.lumbarSpondylosis:
        return const Color(0xFFFEF3C7);
      case PhysioServiceType.kneePainOA:
        return const Color(0xFFFFEDD5);
      case PhysioServiceType.tennisElbow:
        return const Color(0xFFD1FAE5);
      case PhysioServiceType.frozenShoulder:
        return const Color(0xFFE0E7FF);
      case PhysioServiceType.cpChild:
        return const Color(0xFFFCE7F3);
      case PhysioServiceType.developmentalDelay:
        return const Color(0xFFF3E8FF);
      case PhysioServiceType.autism:
        return const Color(0xFFD1FAE5);
      case PhysioServiceType.prenatalPostnatal:
        return const Color(0xFFFFE4E6);
      case PhysioServiceType.jointReplacement:
        return const Color(0xFFCFFAFE);
      case PhysioServiceType.sportsInjury:
        return const Color(0xFFDCFCE7);
      case PhysioServiceType.general:
        return const Color(0xFFCCFBF1);
    }
  }

  IconData _getIcon(PhysioServiceType t) {
    switch (t) {
      case PhysioServiceType.strokeParalysis:
        return Icons.accessibility_new_rounded;
      case PhysioServiceType.parkinsonsAlzheimers:
        return Icons.psychology_rounded;
      case PhysioServiceType.facialPalsy:
        return Icons.face_retouching_natural_rounded;
      case PhysioServiceType.vestibular:
        return Icons.explore_rounded;
      case PhysioServiceType.cervicalSpondylosis:
        return Icons.align_vertical_center_rounded;
      case PhysioServiceType.lumbarSpondylosis:
        return Icons.self_improvement_rounded;
      case PhysioServiceType.kneePainOA:
        return Icons.directions_walk_rounded;
      case PhysioServiceType.tennisElbow:
        return Icons.sports_tennis_rounded;
      case PhysioServiceType.frozenShoulder:
        return Icons.motion_photos_on_rounded;
      case PhysioServiceType.cpChild:
        return Icons.child_care_rounded;
      case PhysioServiceType.developmentalDelay:
        return Icons.trending_up_rounded;
      case PhysioServiceType.autism:
        return Icons.extension_rounded;
      case PhysioServiceType.prenatalPostnatal:
        return Icons.pregnant_woman_rounded;
      case PhysioServiceType.jointReplacement:
        return Icons.healing_rounded;
      case PhysioServiceType.sportsInjury:
        return Icons.directions_run_rounded;
      case PhysioServiceType.general:
        return Icons.medical_services_rounded;
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h / 2);

    final bgPaint = Paint()
      ..color = _getBgColor(type)
      ..style = PaintingStyle.fill;

    // Draw background rounded capsule
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(center.dx, center.dy), width: w * 0.94, height: h * 0.94),
        Radius.circular(w * 0.22),
      ),
      bgPaint,
    );

    // Subtle inner glow border
    final borderPaint = Paint()
      ..color = _getPrimaryColor(type).withOpacity(0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(center.dx, center.dy), width: w * 0.94, height: h * 0.94),
        Radius.circular(w * 0.22),
      ),
      borderPaint,
    );

    // Render decorative medical wave or emblem
    final accentPaint = Paint()
      ..color = _getPrimaryColor(type).withOpacity(0.12)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(center.dx, center.dy + h * 0.05), w * 0.32, accentPaint);

    // Draw Material Icon in high quality
    final icon = _getIcon(type);
    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
      text: TextSpan(
        text: String.fromCharCode(icon.codePoint),
        style: TextStyle(
          fontSize: isCompact ? w * 0.46 : w * 0.48,
          fontFamily: icon.fontFamily,
          package: icon.fontPackage,
          color: _getPrimaryColor(type),
        ),
      ),
    );

    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(center.dx - textPainter.width / 2, center.dy - textPainter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant _PhysioInfographicPainter oldDelegate) {
    return oldDelegate.type != type || oldDelegate.isCompact != isCompact;
  }
}
