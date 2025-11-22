# VocabFlow Android Project

The actual Android Studio project files (Gradle, Java/Kotlin activities, XML resources) are generated automatically by Capacitor to keep the codebase clean.

## How to generate the APK project:

1. **Clean up (if you had errors):**
   ```bash
   npm run clean
   ```

2. **Generate Android Folder:**
   ```bash
   npm run android:init
   ```

3. **Open in Android Studio:**
   ```bash
   npm run android:open
   ```

4. **Build APK:**
   - inside Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - The APK will be generated in `android/app/build/outputs/apk/debug/`.