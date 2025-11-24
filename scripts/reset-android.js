
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Android Project Reset (JDK 17 Compatible)...');

// 1. Clean existing android folder
const androidPath = path.join(__dirname, '..', 'android');
if (fs.existsSync(androidPath)) {
    console.log('🗑️  Removing old android directory...');
    fs.rmSync(androidPath, { recursive: true, force: true });
}

// 2. Build the web app
console.log('📦 Building React App...');
execSync('npm run build', { stdio: 'inherit' });

// 3. Add Android Platform
console.log('🤖 Adding Android platform...');
execSync('npx cap add android', { stdio: 'inherit' });

// 4. FORCE FIX: Downgrade Gradle Wrapper to 8.2.1 (Stable for JDK 17)
console.log('🔧 Forcing Gradle Wrapper to 8.2.1...');
const wrapperPath = path.join(androidPath, 'gradle', 'wrapper', 'gradle-wrapper.properties');
if (fs.existsSync(wrapperPath)) {
    let content = fs.readFileSync(wrapperPath, 'utf-8');
    // Replace distributionUrl with 8.2.1
    content = content.replace(
        /distributionUrl=.*$/, 
        'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2.1-bin.zip'
    );
    fs.writeFileSync(wrapperPath, content);
}

// 5. FORCE FIX: Update Root Build Gradle to use compatible AGP
console.log('🔧 Updating Root build.gradle...');
const rootBuildGradle = path.join(androidPath, 'build.gradle');
if (fs.existsSync(rootBuildGradle)) {
    let content = fs.readFileSync(rootBuildGradle, 'utf-8');
    // Ensure we are using a compatible Android Gradle Plugin version (8.2.1 matches Gradle 8.2.1)
    content = content.replace(/classpath 'com.android.tools.build:gradle:[^']+'/, "classpath 'com.android.tools.build:gradle:8.2.1'");
    fs.writeFileSync(rootBuildGradle, content);
}

// 6. FORCE FIX: Enforce Java 17 in App Build Gradle
console.log('🔧 Enforcing Java 17 in app/build.gradle...');
const appBuildGradle = path.join(androidPath, 'app', 'build.gradle');
if (fs.existsSync(appBuildGradle)) {
    let content = fs.readFileSync(appBuildGradle, 'utf-8');
    
    // Replace compileOptions
    const compileOptionsParams = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
    `;
    
    // Regex to replace existing compileOptions block
    content = content.replace(/compileOptions\s*{[^}]*}/, compileOptionsParams);
    
    // Ensure kotlinOptions exists if it wasn't there, or replaced if it was inside the regex above (it usually isn't in default cap templates, but safe to append/fix)
    if (!content.includes('kotlinOptions')) {
        content = content.replace('compileOptions', compileOptionsParams + '\n//'); // Hacky insertion point or just rewrite
    }

    // Better replacement strategy: standard Capacitor template replacement
    content = content.replace(/sourceCompatibility JavaVersion.VERSION_1_8/g, 'sourceCompatibility JavaVersion.VERSION_17');
    content = content.replace(/targetCompatibility JavaVersion.VERSION_1_8/g, 'targetCompatibility JavaVersion.VERSION_17');
    content = content.replace(/sourceCompatibility JavaVersion.VERSION_11/g, 'sourceCompatibility JavaVersion.VERSION_17');
    content = content.replace(/targetCompatibility JavaVersion.VERSION_11/g, 'targetCompatibility JavaVersion.VERSION_17');

    fs.writeFileSync(appBuildGradle, content);
}

console.log('✅ Android Reset Complete!');
console.log('👉 Now run: npm run android:open');
