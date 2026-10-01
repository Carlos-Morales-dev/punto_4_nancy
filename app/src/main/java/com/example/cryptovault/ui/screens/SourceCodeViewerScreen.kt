package com.example.cryptovault.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.ui.theme.*

data class CodeFileItem(
    val name: String,
    val path: String,
    val language: String,
    val content: String
)

@Composable
fun SourceCodeViewerScreen(modifier: Modifier = Modifier) {
    val clipboardManager = LocalClipboardManager.current
    var selectedFileIndex by remember { mutableIntStateOf(0) }

    val codeFiles = listOf(
        CodeFileItem(
            name = "SecurityStorageManager.kt",
            path = "app/src/main/java/com/example/cryptovault/data/crypto/SecurityStorageManager.kt",
            language = "Kotlin",
            content = """
            package com.example.cryptovault.data.crypto

            import android.content.Context
            import android.content.SharedPreferences
            import androidx.security.crypto.EncryptedSharedPreferences
            import androidx.security.crypto.MasterKey

            class SecurityStorageManager(private val context: Context) {
                companion object {
                    const val PREFS_FILE = "secret_notes_encrypted"
                }

                private val encryptedPrefs: SharedPreferences by lazy {
                    // 1. Clave Maestra en Hardware TEE / StrongBox
                    val masterKey = MasterKey.Builder(context)
                        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                        .build()

                    // 2. EncryptedSharedPreferences (AES-256 SIV + GCM)
                    EncryptedSharedPreferences.create(
                        context,
                        PREFS_FILE,
                        masterKey,
                        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                    )
                }

                fun saveEncryptedNote(id: String, payload: String) {
                    encryptedPrefs.edit().putString(id, payload).apply()
                }

                fun getEncryptedNote(id: String): String? {
                    return encryptedPrefs.getString(id, null)
                }
            }
            """.trimIndent()
        ),
        CodeFileItem(
            name = "MainActivity.kt",
            path = "app/src/main/java/com/example/cryptovault/MainActivity.kt",
            language = "Kotlin",
            content = """
            package com.example.cryptovault

            import android.os.Bundle
            import androidx.activity.ComponentActivity
            import androidx.activity.compose.setContent
            import androidx.activity.enableEdgeToEdge
            import androidx.lifecycle.viewmodel.compose.viewModel
            import com.example.cryptovault.ui.theme.AndroidSecurityTheme
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
            """.trimIndent()
        ),
        CodeFileItem(
            name = "AndroidManifest.xml",
            path = "app/src/main/AndroidManifest.xml",
            language = "XML",
            content = """
            <?xml version="1.0" encoding="utf-8"?>
            <manifest xmlns:android="http://schemas.android.com/apk/res/android">
                <uses-permission android:name="android.permission.INTERNET" />
                <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
                <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

                <application
                    android:allowBackup="false"
                    android:dataExtractionRules="@xml/data_extraction_rules"
                    android:fullBackupContent="@xml/backup_rules"
                    android:icon="@mipmap/ic_launcher"
                    android:label="@string/app_name"
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
            """.trimIndent()
        ),
        CodeFileItem(
            name = "build.gradle.kts",
            path = "app/build.gradle.kts",
            language = "Gradle (Kotlin DSL)",
            content = """
            dependencies {
                implementation(libs.androidx.core.ktx)
                implementation(libs.androidx.security.crypto) // Jetpack Security
                implementation(libs.androidx.activity.compose)
                implementation(platform(libs.androidx.compose.bom))
                implementation(libs.androidx.material3)
                implementation(libs.androidx.lifecycle.viewmodel.compose)
            }
            """.trimIndent()
        )
    )

    val currentFile = codeFiles[selectedFileIndex]

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Code, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Código Fuente Android", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text(currentFile.path, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
                IconButton(
                    onClick = { clipboardManager.setText(AnnotatedString(currentFile.content)) }
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copiar", tint = LimeAccent)
                }
            }

            // File selection tabs
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(codeFiles.indices.toList()) { index ->
                    FilterChip(
                        selected = selectedFileIndex == index,
                        onClick = { selectedFileIndex = index },
                        label = { Text(codeFiles[index].name, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GreenLight,
                            selectedLabelColor = DarkBackground
                        )
                    )
                }
            }

            // Code Display Container
            Surface(
                color = DarkSurface,
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DarkCard)),
                modifier = Modifier.fillMaxWidth().weight(1f)
            ) {
                LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp)) {
                    item {
                        Text(
                            currentFile.content,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            lineHeight = 16.sp,
                            color = TextPrimary
                        )
                    }
                }
            }
        }
    }
}
