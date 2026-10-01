import JSZip from 'jszip';

export async function exportAndroidStudioProject(): Promise<void> {
  const zip = new JSZip();

  // 1. Settings & Root Gradle
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AndroidSecurityVault"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  );

  // 2. Gradle Wrapper
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  zip.file(
    'gradle/libs.versions.toml',
    `[versions]
agp = "8.7.0"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"
securityCrypto = "1.1.0-alpha06"
navigationCompose = "2.8.4"
materialIconsExtended = "1.7.5"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIconsExtended" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "com.android.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`
  );

  // 3. App Module Gradle & Proguard
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.cryptovault"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.cryptovault"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core-ktx)
    implementation(libs.androidx.lifecycle-runtime-ktx)
    implementation(libs.androidx.lifecycle-viewmodel-compose)
    implementation(libs.androidx.activity-compose)
    implementation(platform(libs.androidx.compose-bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui-graphics)
    implementation(libs.androidx.ui-tooling-preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material-icons-extended)
    implementation(libs.androidx.security-crypto)
    implementation(libs.androidx.navigation-compose)
}
`
  );

  zip.file(
    'app/proguard-rules.pro',
    `-keep class com.example.cryptovault.data.model.** { *; }
-keep class androidx.security.crypto.** { *; }
-keep class com.google.crypto.tink.** { *; }
`
  );

  // 4. Manifest
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <application
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AndroidSecurityVault">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // 5. Kotlin Sources
  zip.file(
    'app/src/main/java/com/example/cryptovault/MainActivity.kt',
    `package com.example.cryptovault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.cryptovault.ui.screens.*
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.NavTab
import com.example.cryptovault.viewmodel.SecurityViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidSecurityTheme {
                val viewModel: SecurityViewModel = viewModel()
                SecurityApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityApp(
    viewModel: SecurityViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    BackHandler(enabled = uiState.activeTab != NavTab.VAULT) {
        viewModel.setTab(NavTab.VAULT)
    }

    LaunchedEffect(uiState.toastMessage) {
        uiState.toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearToast()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = DarkGreen,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = GreenLight,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "Punto 4: Seguridad & Cifrado",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = LimeAccent
                                ) {
                                    Text(
                                        "AES-256",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = DarkBackground,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                "EncryptedSharedPreferences vs Almacenamiento Externo",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = DarkSurface,
                tonalElevation = 4.dp
            ) {
                val items = listOf(
                    Triple(NavTab.VAULT, Icons.Default.PhoneAndroid, "Bóveda"),
                    Triple(NavTab.EXPLORER, Icons.Default.FolderOpen, "Explorer"),
                    Triple(NavTab.ADB, Icons.Default.Terminal, "ADB"),
                    Triple(NavTab.ARCHITECTURE, Icons.Default.AccountTree, "Cripto"),
                    Triple(NavTab.CODE, Icons.Default.Code, "Código"),
                    Triple(NavTab.STEPS, Icons.Default.FormatListNumbered, "Guía")
                )

                items.forEach { (tab, icon, label) ->
                    val isSelected = uiState.activeTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.setTab(tab) },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DarkBackground,
                            selectedTextColor = GreenLight,
                            indicatorColor = GreenLight,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        )
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (uiState.activeTab) {
                NavTab.VAULT -> VaultScreen(uiState = uiState, viewModel = viewModel)
                NavTab.EXPLORER -> DeviceFileExplorerScreen(uiState = uiState)
                NavTab.ADB -> AdbTerminalScreen(uiState = uiState, viewModel = viewModel)
                NavTab.ARCHITECTURE -> CryptoArchitectureScreen()
                NavTab.CODE -> SourceCodeViewerScreen()
                NavTab.REPORT -> ReadmeReportScreen()
                NavTab.STEPS -> StepsWizardScreen(uiState = uiState, viewModel = viewModel)
            }
        }
    }
}
`
  );

  // SecurityStorageManager
  zip.file(
    'app/src/main/java/com/example/cryptovault/data/crypto/SecurityStorageManager.kt',
    `package com.example.cryptovault.data.crypto

import android.content.Context
import android.content.SharedPreferences
import android.os.Environment
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.cryptovault.data.model.ConfidentialNote
import com.example.cryptovault.data.model.SecretCategory
import java.io.File
import java.io.FileOutputStream

class SecurityStorageManager(private val context: Context) {

    companion object {
        private const val TAG = "SecurityStorageManager"
        const val ENCRYPTED_PREFS_FILENAME = "secret_notes_encrypted"
        const val EXTERNAL_INSECURE_FILENAME = "secret_note_insecure.txt"
    }

    private val encryptedPrefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                ENCRYPTED_PREFS_FILENAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            Log.e(TAG, "Fallback to standard SharedPreferences", e)
            context.getSharedPreferences(ENCRYPTED_PREFS_FILENAME, Context.MODE_PRIVATE)
        }
    }

    fun saveEncryptedNote(note: ConfidentialNote): Boolean {
        return try {
            val payload = "\${note.title}|||\${note.content}|||\${note.category.id}|||\${note.timestamp}"
            encryptedPrefs.edit().putString(note.id, payload).apply()
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getAllEncryptedNotes(): List<ConfidentialNote> {
        val notes = mutableListOf<ConfidentialNote>()
        try {
            val all = encryptedPrefs.all
            for ((key, value) in all) {
                if (key.startsWith("__androidx_security_crypto")) continue
                if (value is String) {
                    val parts = value.split("|||")
                    if (parts.size >= 4) {
                        notes.add(
                            ConfidentialNote(
                                id = key,
                                title = parts[0],
                                content = parts[1],
                                category = SecretCategory.fromId(parts[2]),
                                timestamp = parts[3],
                                isEncryptedStored = true,
                                isExternalStored = false,
                                encryptedKeyCipher = CryptoSimulator.generateEncryptedKey(key),
                                encryptedValueCipher = CryptoSimulator.generateEncryptedValue("\${parts[0]}|||\${parts[1]}"),
                                rawExternalContent = ""
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching notes", e)
        }
        return notes
    }

    fun deleteEncryptedNote(noteId: String) {
        encryptedPrefs.edit().remove(noteId).apply()
    }

    fun saveInsecureExternalNote(note: ConfidentialNote): File? {
        return try {
            val targetDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!targetDir.exists()) targetDir.mkdirs()
            val targetFile = File(targetDir, EXTERNAL_INSECURE_FILENAME)
            val newEntry = "\\n[REGISTRO INSEGURO SIN CIFRAR]\\nID: \${note.id}\\nFECHA: \${note.timestamp}\\nTÍTULO: \${note.title}\\nCONTENIDO: \${note.content}\\n-----------------------------------\\n"
            FileOutputStream(targetFile, true).use { stream ->
                stream.write(newEntry.toByteArray())
            }
            targetFile
        } catch (e: Exception) {
            null
        }
    }

    fun clearInsecureExternalFile(): Boolean {
        return try {
            val targetDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val targetFile = File(targetDir, EXTERNAL_INSECURE_FILENAME)
            if (targetFile.exists()) targetFile.delete() else true
        } catch (e: Exception) {
            false
        }
    }
}
`
  );

  // Models & Simulator
  zip.file(
    'app/src/main/java/com/example/cryptovault/data/model/ConfidentialNote.kt',
    `package com.example.cryptovault.data.model

data class ConfidentialNote(
    val id: String,
    val title: String,
    val content: String,
    val category: SecretCategory,
    val timestamp: String,
    val isEncryptedStored: Boolean,
    val isExternalStored: Boolean,
    val encryptedKeyCipher: String,
    val encryptedValueCipher: String,
    val rawExternalContent: String
)
`
  );

  zip.file(
    'app/src/main/java/com/example/cryptovault/data/model/SecretCategory.kt',
    `package com.example.cryptovault.data.model

import androidx.compose.ui.graphics.Color

enum class SecretCategory(
    val id: String,
    val label: String,
    val badgeBgColor: Color,
    val badgeTextColor: Color
) {
    BANCARIO("bancario", "Bancario & Financiero (PINs, Tarjetas)", Color(0xFF064E3B), Color(0xFF6EE7B7)),
    CREDENCIALES("credenciales", "Credenciales de Acceso (Usuario & Clave)", Color(0xFF1E3A8A), Color(0xFF93C5FD)),
    API_TOKENS("api_tokens", "API Keys & Tokens (AWS, Firebase, Cloud)", Color(0xFF78350F), Color(0xFFFCD34D)),
    CRIPTO_WALLETS("cripto_wallets", "Cripto & Wallets (Seed Phrase, Claves)", Color(0xFF581C87), Color(0xFFD8B4FE)),
    DOBLE_FACTOR("doble_factor", "Respaldo 2FA & OTP (Códigos de Respaldo)", Color(0xFF164E63), Color(0xFF67E8F9)),
    IDENTIDAD("identidad", "Identidad & Documentos (Cédula, Pasaporte)", Color(0xFF312E81), Color(0xFFA5B4FC)),
    MEDICO("medico", "Médico & Salud (Historial, Medicación)", Color(0xFF881337), Color(0xFFFDA4AF)),
    EMPRESA("empresa", "Corporativo & Negocios (Servidores, VPN)", Color(0xFF1E293B), Color(0xFFCBD5E1)),
    WIFI_REDES("wifi_redes", "Redes & Wi-Fi (Claves WPA3, Routers)", Color(0xFF134E4A), Color(0xFF5EEAD4)),
    PERSONAL("personal", "Personal & Privado (Notas confidenciales)", Color(0xFF27272A), Color(0xFFD4D4D8));

    companion object {
        fun fromId(id: String): SecretCategory = entries.find { it.id.equals(id, ignoreCase = true) } ?: PERSONAL
    }
}
`
  );

  zip.file(
    'app/src/main/java/com/example/cryptovault/data/crypto/CryptoSimulator.kt',
    `package com.example.cryptovault.data.crypto

import com.example.cryptovault.data.model.ConfidentialNote
import java.nio.charset.StandardCharsets
import kotlin.math.abs

object CryptoSimulator {
    fun fakeBase64(str: String, salt: String = "enc"): String {
        var hash = 0
        for (ch in str) hash = (hash shl 5) - hash + ch.code
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        var result = "AR" + abs(hash).toString(36).uppercase()
        for (i in 0 until 28) {
            val saltChar = salt[i % salt.length].code
            val idx = abs((hash * 31 + i * 17 + saltChar) % chars.length)
            result += chars[idx]
        }
        return "$result=="
    }
    fun generateEncryptedKey(rawKey: String): String = fakeBase64(rawKey, "siv_key_determinism")
    fun generateEncryptedValue(rawValue: String): String = fakeBase64(rawValue, "gcm_authenticated_payload")
    fun generateHexDump(text: String): String {
        val bytes = text.toByteArray(StandardCharsets.UTF_8)
        val lines = mutableListOf<String>()
        val chunkSize = 16
        val limit = minOf(bytes.size, 256)
        var i = 0
        while (i < limit) {
            val offset = "%08x".format(i)
            val chunk = bytes.sliceArray(i until minOf(i + chunkSize, limit))
            val hexParts = mutableListOf<String>()
            for (j in 0 until chunkSize) {
                if (j < chunk.size) hexParts.add("%02x".format(chunk[j])) else hexParts.add("  ")
            }
            val hex1 = hexParts.subList(0, 8).joinToString(" ")
            val hex2 = hexParts.subList(8, 16).joinToString(" ")
            val ascii = StringBuilder()
            for (byte in chunk) {
                val b = byte.toInt()
                ascii.append(if (b in 32..126) b.toChar() else '.')
            }
            lines.add("$offset  $hex1  $hex2  |$ascii|")
            i += chunkSize
        }
        return lines.joinToString("\\n")
    }
    fun generateEncryptedPrefsXml(notes: List<ConfidentialNote>): String {
        val sb = StringBuilder("<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\\n<map>\\n")
        sb.append("    <string name=\\"__androidx_security_crypto_encrypted_prefs_key_keyset__\\">AQo...MasterKeyRef...AA=</string>\\n")
        sb.append("    <string name=\\"__androidx_security_crypto_encrypted_prefs_value_keyset__\\">BQw...KeysetPayload...AQ==</string>\\n")
        notes.filter { it.isEncryptedStored }.forEach {
            sb.append("    <string name=\\"\${it.encryptedKeyCipher}\\">\${it.encryptedValueCipher}</string>\\n")
        }
        sb.append("</map>")
        return sb.toString()
    }
    fun generateExternalFileContent(notes: List<ConfidentialNote>): String {
        val sb = StringBuilder("=== ARCHIVO EXTERNO INSEGURO (/sdcard/Download) ===\\n")
        notes.filter { it.isExternalStored }.forEachIndexed { idx, n ->
            sb.append("[NOTA #\${idx + 1}] ID: \${n.id}\\nFECHA: \${n.timestamp}\\nTÍTULO: \${n.title}\\nCONTENIDO: \${n.content}\\n-------------------------------\\n")
        }
        return sb.toString()
    }
}
`
  );

  // ViewModel
  zip.file(
    'app/src/main/java/com/example/cryptovault/viewmodel/SecurityViewModel.kt',
    `package com.example.cryptovault.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.example.cryptovault.data.crypto.CryptoSimulator
import com.example.cryptovault.data.crypto.SecurityStorageManager
import com.example.cryptovault.data.model.ConfidentialNote
import com.example.cryptovault.data.model.SecretCategory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class NavTab(val title: String) {
    VAULT("Bóveda"),
    EXPLORER("Explorer"),
    ADB("ADB Terminal"),
    ARCHITECTURE("Arquitectura"),
    CODE("Código"),
    REPORT("Informe"),
    STEPS("Guía")
}

data class TerminalLog(val id: String, val type: LogType, val text: String, val timestamp: String)
enum class LogType { INPUT, OUTPUT, ERROR, SUCCESS, INFO }

data class SecurityUiState(
    val activeTab: NavTab = NavTab.VAULT,
    val notes: List<ConfidentialNote> = emptyList(),
    val selectedNoteId: String? = null,
    val listFilter: String = "all",
    val terminalLogs: List<TerminalLog> = emptyList(),
    val currentStep: Int = 1,
    val toastMessage: String? = null
)

class SecurityViewModel(application: Application) : AndroidViewModel(application) {
    private val storageManager = SecurityStorageManager(application)
    private val _uiState = MutableStateFlow(SecurityUiState())
    val uiState: StateFlow<SecurityUiState> = _uiState.asStateFlow()

    init {
        val initialNotes = listOf(
            ConfidentialNote("note_849201", "PIN Bancario", "PIN: 8841", SecretCategory.BANCARIO, "19:42", true, true, "AR92J3KLM4091A8SK0192JDJAKL901==", "AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==", "PIN: 8841"),
            ConfidentialNote("note_512844", "API Key AWS", "AKIAIOSF9918-SECRET", SecretCategory.API_TOKENS, "19:44", true, false, "AR83HD9201LKS0928374HJAKSLMNZ9==", "AQ83Kd821ksl81923kjsdkla7182903jskldja81923==", "")
        )
        _uiState.update { it.copy(notes = initialNotes, terminalLogs = listOf(TerminalLog("init", LogType.INFO, "ADB Conectado a emulador: emulator-5554", "19:40"))) }
    }

    fun setTab(tab: NavTab) = _uiState.update { it.copy(activeTab = tab) }
    fun setFilter(filter: String) = _uiState.update { it.copy(listFilter = filter) }
    fun selectNote(id: String) = _uiState.update { it.copy(selectedNoteId = id) }
    fun setStep(step: Int) = _uiState.update { it.copy(currentStep = step.coerceIn(1, 5)) }
    fun clearToast() = _uiState.update { it.copy(toastMessage = null) }

    fun addNote(title: String, content: String, category: SecretCategory, isEncrypted: Boolean): Boolean {
        if (title.length < 3 || content.length < 3) return false
        val id = "note_\${System.currentTimeMillis().toString().takeLast(6)}"
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val note = ConfidentialNote(id, title, content, category, time, isEncrypted, !isEncrypted, CryptoSimulator.generateEncryptedKey(id), CryptoSimulator.generateEncryptedValue("$title|||$content"), if (!isEncrypted) content else "")
        if (isEncrypted) storageManager.saveEncryptedNote(note) else storageManager.saveInsecureExternalNote(note)
        _uiState.update { it.copy(notes = listOf(note) + it.notes, toastMessage = if (isEncrypted) "Guardado con AES-256 (Keystore)" else "Guardado en texto plano en SD") }
        return true
    }

    fun deleteNote(id: String) {
        storageManager.deleteEncryptedNote(id)
        _uiState.update { it.copy(notes = it.notes.filterNot { n -> n.id == id }) }
    }

    fun clearExternalStorage() {
        storageManager.clearInsecureExternalFile()
        _uiState.update { it.copy(notes = it.notes.map { n -> n.copy(isExternalStored = false) }, toastMessage = "Archivo externo eliminado") }
    }

    fun executeAdbCommand(cmd: String) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val inLog = TerminalLog("cmd_\${System.currentTimeMillis()}", LogType.INPUT, "$ cmd", time)
        val outLog = when {
            cmd.contains("ls") -> TerminalLog("out_\${System.currentTimeMillis()}", LogType.OUTPUT, "secret_note_insecure.txt (Permisos everybody -rw-rw----)", time)
            cmd.contains("cat") && cmd.contains("insecure") -> TerminalLog("out_\${System.currentTimeMillis()}", LogType.ERROR, "TEXTO PLANO VULNERABLE:\\n" + CryptoSimulator.generateExternalFileContent(_uiState.value.notes), time)
            cmd.contains("run-as") -> TerminalLog("out_\${System.currentTimeMillis()}", LogType.SUCCESS, "XML Cifrado:\\n" + CryptoSimulator.generateEncryptedPrefsXml(_uiState.value.notes), time)
            else -> TerminalLog("out_\${System.currentTimeMillis()}", LogType.OUTPUT, "Comando ejecutado con éxito.", time)
        }
        _uiState.update { it.copy(terminalLogs = it.terminalLogs + listOf(inLog, outLog)) }
    }
}
`
  );

  // 6. Resources
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">Android Security &amp; Cifrado - Punto 4</string>
    <string name="title_vault">Bóveda de Notas Confidenciales</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>
    <color name="primary">#15803D</color>
    <color name="background">#0F172A</color>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <style name="Theme.AndroidSecurityVault" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#0F172A</item>
        <item name="android:navigationBarColor">#0F172A</item>
    </style>
</resources>
`
  );

  zip.file(
    'app/src/main/res/xml/data_extraction_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup><exclude domain="sharedpref" path="secret_notes_encrypted.xml"/></cloud-backup>
    <device-transfer><exclude domain="sharedpref" path="secret_notes_encrypted.xml"/></device-transfer>
</data-extraction-rules>
`
  );

  zip.file(
    'app/src/main/res/xml/backup_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <exclude domain="sharedpref" path="secret_notes_encrypted.xml"/>
</full-backup-content>
`
  );

  zip.file(
    'app/src/main/res/drawable/ic_launcher_background.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#153422" android:pathData="M0,0h108v108h-108z" />
</vector>
`
  );

  zip.file(
    'app/src/main/res/drawable/ic_launcher_foreground.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group android:scaleX="0.65" android:scaleY="0.65" android:translateX="18.9" android:translateY="18.9">
        <path android:fillColor="#42D674" android:pathData="M54,12 L86,24 C86,64 54,92 54,92 C54,92 22,64 22,24 Z" />
        <path android:fillColor="#153422" android:pathData="M54,20 L80,30 C80,62 54,84 54,84 C54,84 28,62 28,30 Z" />
    </group>
</vector>
`
  );

  zip.file(
    'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  );

  zip.file(
    'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  );

  // Instrucciones de apertura en Android Studio
  zip.file(
    'INSTRUCCIONES_ANDROID_STUDIO.md',
    `# 🚀 Cómo Abrir y Ejecutar este Proyecto en Android Studio

1. **Descomprime** este archivo .ZIP en una carpeta de tu preferencia (ej: \`C:\\Proyectos\\AndroidSecurityVault\` o \`~/AndroidSecurityVault\`).
2. Abre **Android Studio** (Koala, Ladybug, Iguana o superior).
3. Haz clic en **Open** (o **File -> Open...**) y selecciona la carpeta descomprimida.
4. Espera que termine el **Gradle Sync** automático (utiliza Gradle 8.9 y Android Gradle Plugin 8.7).
5. Selecciona tu emulador o dispositivo físico en la barra superior.
6. Haz clic en el botón verde **Run 'app'** (o presiona \`Shift + F10\`).

¡Listo! La aplicación ejecutará directamente la Bóveda de Cifrado con \`EncryptedSharedPreferences\` nativo y hardware Keystore.
`
  );

  // Generar y descargar el Blob
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AndroidSecurityVault_AndroidStudio_Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
