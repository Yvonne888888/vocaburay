# VocabFlow Android Setup (JDK 17)

## Troubleshooting Build Errors

If you encounter `DependencyHandler.module` or `Class file major version 65` errors, it is because of a mismatch between Gradle and your Java version.

**The Fix:**

We have included a script that automatically configures the project for **JDK 17 + Gradle 8.2.1** (The stable combination).

1.  **Close Android Studio.**
2.  Run the reset command in your terminal:
    ```bash
    npm run android:init
    ```
3.  Wait for the script to finish (it will say "✅ Android Reset Complete!").
4.  Open Android Studio:
    ```bash
    npm run android:open
    ```
5.  Let Gradle Sync. DO NOT update the Gradle Plugin if prompted by a popup.

## Manual Verification

In Android Studio:
*   **Settings > Build, Execution, Deployment > Build Tools > Gradle**
*   Ensure **Gradle JDK** is set to `jbr-17` or your local JDK 17.
