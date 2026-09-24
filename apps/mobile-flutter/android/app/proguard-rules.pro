# Flutter Proguard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Suppress Play Core warnings
-dontwarn com.google.android.play.core.**

# Razorpay
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** { *; }
-optimizations !code/simplification/arithmetic
-keepclasseswithmembers class * {
    public void onPaymentSuccess(java.lang.String, com.razorpay.PaymentData);
    public void onPaymentError(int, java.lang.String, com.razorpay.PaymentData);
}

# Flutter Secure Storage
-keep class com.it_nomads.fluttersecurestorage.** { *; }
-dontwarn com.it_nomads.fluttersecurestorage.**
