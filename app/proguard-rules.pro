# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/.../Library/Android/sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# Keep data models
-keep class com.example.cryptovault.data.model.** { *; }

# Keep security crypto classes
-keep class androidx.security.crypto.** { *; }
-keep class com.google.crypto.tink.** { *; }
