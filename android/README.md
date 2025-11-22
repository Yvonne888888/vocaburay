# VocabFlow Android Project

The actual Android Studio project files (Gradle, Java/Kotlin activities, XML resources) are generated automatically by Capacitor to keep the codebase clean.

## How to generate the APK project:

1. **Clean up (if you had errors):**
   ```bash
   npm run clean
   ```

2. **Set Android SDK Path (Important!):**
   If you get an error saying "Please provide the path to the Android SDK", run this in your terminal before initializing:
   
   **macOS:**
   ```bash
   export ANDROID_HOME=~/Library/Android/sdk
   ```
   
   **Windows:**
   ```powershell
   $env:ANDROID_HOME = "$HOME\AppData\Local\Android\Sdk"
   ```

3. **Generate Android Folder:**
   ```bash
   npm run android:init
   ```

4. **Open in Android Studio:**
   ```bash
   npm run android:open
   ```

5. **Build APK:**
   - Inside Android Studio, wait for Gradle sync to finish.
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - The APK will be generated in `android/app/build/outputs/apk/debug/`.
