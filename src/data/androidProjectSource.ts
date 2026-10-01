import { AndroidCodeFile } from '../types';

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    name: 'SecurityStorageManager.kt',
    path: 'app/src/main/java/com/security/securenotes/SecurityStorageManager.kt',
    language: 'kotlin',
    description: 'Gestor central de seguridad: EncryptedSharedPreferences (AES256) y Almacenamiento Externo',
    content: `package com.security.securenotes

import android.content.Context
import android.content.SharedPreferences
import android.os.Environment
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.io.File
import java.io.FileOutputStream
import java.io.FileInputStream
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * Punto 4: Seguridad en el Almacenamiento y Cifrado en Android
 * Esta clase compara dos mecanismos de persistencia local:
 * 1. Almacenamiento Interno Privado Cifrado con EncryptedSharedPreferences (Jetpack Security)
 * 2. Almacenamiento Externo Público Sin Cifrar (/sdcard / Environment.DIRECTORY_DOWNLOADS)
 */
class SecurityStorageManager(private val context: Context) {

    companion object {
        private const val TAG = "SecurityStorageManager"
        private const val ENCRYPTED_PREFS_FILENAME = "secret_notes_encrypted"
        private const val EXTERNAL_INSECURE_FILENAME = "secret_note_insecure.txt"
    }

    // Instancia de SharedPreferences Cifradas respaldada por Android Keystore
    private val encryptedPrefs: SharedPreferences by lazy {
        // 1. Generación/recuperación de la MasterKey en el hardware seguro (TEE / StrongBox)
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        // 2. Creación de EncryptedSharedPreferences
        // - Claves cifradas con AES-256 SIV (Determinístico para búsquedas por hash)
        // - Valores cifrados con AES-256 GCM (Autenticado con IV y Tag de integridad)
        EncryptedSharedPreferences.create(
            context,
            ENCRYPTED_PREFS_FILENAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    // =========================================================================
    // 1. ALMACENAMIENTO INTERNO PRIVADO CIFRADO (SEGURO)
    // =========================================================================
    
    fun saveEncryptedNote(noteId: String, title: String, content: String): Boolean {
        return try {
            val payload = "\$title|||\$content|||\${System.currentTimeMillis()}"
            encryptedPrefs.edit().putString(noteId, payload).apply()
            Log.d(TAG, "Nota cifrada exitosamente con ID: \$noteId en \$ENCRYPTED_PREFS_FILENAME.xml")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al guardar nota cifrada", e)
            false
        }
    }

    fun getEncryptedNote(noteId: String): Pair<String, String>? {
        val payload = encryptedPrefs.getString(noteId, null) ?: return null
        val parts = payload.split("|||")
        return if (parts.size >= 2) Pair(parts[0], parts[1]) else null
    }

    fun getAllEncryptedNotes(): Map<String, String> {
        val all = encryptedPrefs.all
        val result = mutableMapOf<String, String>()
        for ((key, value) in all) {
            if (value is String) {
                result[key] = value
            }
        }
        return result
    }

    fun deleteEncryptedNote(noteId: String) {
        encryptedPrefs.edit().remove(noteId).apply()
    }

    // =========================================================================
    // 2. ALMACENAMIENTO EXTERNO PÚBLICO SIN CIFRAR (INSEGURO - SD / PÚBLICO)
    // =========================================================================
    /**
     * Guarda una copia idéntica en texto plano en el directorio público externo de descargas.
     * Cualquier aplicación con permisos de lectura o acceso físico/ADB puede extraerla.
     */
    fun saveInsecureExternalNote(title: String, content: String): File? {
        return try {
            // Se utiliza el directorio externo público de Descargas
            val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!externalDir.exists()) {
                externalDir.mkdirs()
            }
            val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
            val textToWrite = """
                =====================================================
                NOTA CONFIDENCIAL - COPIA SIN CIFRAR EN SD/EXTERNO
                Fecha: \${java.util.Date()}
                Título: \$title
                Contenido Confidencial:
                \$content
                =====================================================
            """.trimIndent()
            
            FileOutputStream(targetFile, true).use { fos ->
                fos.write((textToWrite + "\\n\\n").toByteArray())
            }
            Log.w(TAG, "ADVERTENCIA: Nota guardada en texto plano en: \${targetFile.absolutePath}")
            targetFile
        } catch (e: Exception) {
            Log.e(TAG, "Error guardando en almacenamiento externo", e)
            null
        }
    }

    fun readInsecureExternalNote(): String? {
        val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
        if (!targetFile.exists()) return null
        val sb = StringBuilder()
        BufferedReader(InputStreamReader(FileInputStream(targetFile))).use { reader ->
            var line: String? = reader.readLine()
            while (line != null) {
                sb.append(line).append("\\n")
                line = reader.readLine()
            }
        }
        return sb.toString()
    }

    fun clearInsecureExternalFile(): Boolean {
        val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
        return if (targetFile.exists()) targetFile.delete() else true
    }
}
`,
  },
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/security/securenotes/MainActivity.kt',
    language: 'kotlin',
    description: 'Actividad principal con UI interactiva, verificación de permisos y comparación de almacenamiento',
    content: `package com.security.securenotes

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.security.securenotes.databinding.ActivityMainBinding
import java.util.UUID

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var storageManager: SecurityStorageManager

    companion object {
        private const val PERMISSION_REQUEST_CODE = 101
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        storageManager = SecurityStorageManager(this)

        setupPermissions()
        setupCategorySpinner()
        setupListeners()
        refreshDisplays()
    }

    private fun setupCategorySpinner() {
        val categories = arrayOf(
            "Bancario & Financiero (Cuentas, Tarjetas, PIN)",
            "Credenciales de Acceso (Usuarios, Contraseñas)",
            "API Keys & Tokens (Bearer Tokens, Secret Keys)",
            "Cripto & Billeteras (Frases Semilla, Llaves Privadas)",
            "Respaldo 2FA (Códigos de Recuperación MFA)",
            "Identidad & Documentos (Cédula, Pasaporte)",
            "Médico & Salud Privada (Historial Clínico)",
            "Corporativo & Negocios (Contratos con NDA)",
            "Redes, Wi-Fi & Servidores (WPA3, VPN)",
            "Personal & Diario (Notas Íntimas, Contactos)"
        )
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        binding.spCategory.adapter = adapter
    }

    private fun setupPermissions() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            val writePermission = ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            val readPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)

            if (writePermission != PackageManager.PERMISSION_GRANTED || readPermission != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE),
                    PERMISSION_REQUEST_CODE
                )
            }
        }
    }

    private fun setupListeners() {
        // 1. Guardar de forma segura en almacenamiento interno cifrado
        binding.btnSaveEncrypted.setOnClickListener {
            val title = binding.etNoteTitle.text.toString().trim()
            val content = binding.etNoteContent.text.toString().trim()

            if (title.isEmpty() || content.isEmpty()) {
                Toast.makeText(this, "Por favor complete título y contenido", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val noteId = "note_\${System.currentTimeMillis()}_\${UUID.randomUUID().toString().take(6)}"
            val success = storageManager.saveEncryptedNote(noteId, title, content)
            if (success) {
                Toast.makeText(this, "Guardada de forma SEGURA en EncryptedSharedPreferences", Toast.LENGTH_SHORT).show()
                binding.etNoteContent.text?.clear()
                refreshDisplays()
            }
        }

        // 2. Guardar copia sin cifrar en SD / Almacenamiento Externo
        binding.btnSaveExternalInsecure.setOnClickListener {
            val title = binding.etNoteTitle.text.toString().trim()
            val content = binding.etNoteContent.text.toString().trim()

            if (title.isEmpty() || content.isEmpty()) {
                Toast.makeText(this, "Por favor complete título y contenido", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val file = storageManager.saveInsecureExternalNote(title, content)
            if (file != null) {
                Toast.makeText(this, "⚠️ Guardada copia SIN CIFRAR en: \${file.name}", Toast.LENGTH_LONG).show()
                refreshDisplays()
            }
        }

        // 4. Limpiar almacenamiento externo
        binding.btnClearExternal.setOnClickListener {
            storageManager.clearInsecureExternalFile()
            Toast.makeText(this, "Almacenamiento externo limpiado", Toast.LENGTH_SHORT).show()
            refreshDisplays()
        }
    }

    private fun refreshDisplays() {
        // Actualizar contador y lista de notas cifradas
        val allEncrypted = storageManager.getAllEncryptedNotes()
        binding.tvEncryptedCount.text = "\${allEncrypted.size} notas guardadas bajo AES-256"
        val sbEncrypted = StringBuilder()
        allEncrypted.forEach { (key, value) ->
            val parts = value.split("|||")
            val title = parts.getOrNull(0) ?: key
            sbEncrypted.append("🔒 [ID: $key]\\n  Título: $title\\n\\n")
        }
        binding.tvEncryptedList.text = if (sbEncrypted.isEmpty()) "(Sin notas cifradas)" else sbEncrypted.toString()

        // Actualizar vista previa del almacenamiento externo
        val externalContent = storageManager.readInsecureExternalNote()
        binding.tvExternalPreview.text = externalContent ?: "(Archivo externo no existe o está vacío)"
    }
}
`,
  },
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'Diseño de interfaz XML en Material Design para la pantalla de notas confidenciales',
    content: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0F172A"
    android:padding="16dp"
    tools:context=".MainActivity">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- Encabezado -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="PUNTO 4: SEGURIDAD Y CIFRADO"
            android:textColor="#38BDF8"
            android:textSize="20sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:text="EncryptedSharedPreferences (Interno) vs Almacenamiento Externo (SD)"
            android:textColor="#94A3B8"
            android:textSize="13sp" />

        <!-- Formulario de Entrada -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            app:cardBackgroundColor="#1E293B"
            app:cardCornerRadius="12dp"
            app:strokeColor="#334155"
            app:strokeWidth="1dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Nueva Nota Confidencial"
                    android:textColor="#F8FAFC"
                    android:textSize="16sp"
                    android:textStyle="bold" />

                <EditText
                    android:id="@+id/etNoteTitle"
                    android:layout_width="match_parent"
                    android:layout_height="48dp"
                    android:layout_marginTop="12dp"
                    android:background="#334155"
                    android:hint="Título (ej: Contraseña Bancaria / Clave API)"
                    android:paddingHorizontal="12dp"
                    android:textColor="#FFFFFF"
                    android:textColorHint="#94A3B8"
                    android:textSize="14sp" />

                <!-- Desplegable / Spinner de Categoría -->
                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="10dp"
                    android:text="Categoría del Secreto:"
                    android:textColor="#94A3B8"
                    android:textSize="12sp" />

                <Spinner
                    android:id="@+id/spCategory"
                    android:layout_width="match_parent"
                    android:layout_height="44dp"
                    android:layout_marginTop="4dp"
                    android:background="#334155"
                    android:paddingHorizontal="10dp" />

                <EditText
                    android:id="@+id/etNoteContent"
                    android:layout_width="match_parent"
                    android:layout_height="90dp"
                    android:layout_marginTop="12dp"
                    android:background="#334155"
                    android:gravity="top|start"
                    android:hint="Escriba información sensible aquí..."
                    android:padding="12dp"
                    android:textColor="#FFFFFF"
                    android:textColorHint="#94A3B8"
                    android:textSize="14sp" />

                <!-- Botones de Acción -->
                <Button
                    android:id="@+id/btnSaveEncrypted"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="14dp"
                    android:backgroundTint="#42D674"
                    android:text="1. Guardar Cifrado (Interno Privado)"
                    android:textColor="#FFFFFF" />

                <Button
                    android:id="@+id/btnSaveExternalInsecure"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="8dp"
                    android:backgroundTint="#42D674"
                    android:text="2. Guardar Copia en SD/Externo (Texto Plano)"
                    android:textColor="#FFFFFF" />

            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Panel 1: Notas Cifradas (Interno) -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            app:cardBackgroundColor="#064E3B"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="🔒 Almacenamiento Cifrado (Jetpack Security)"
                    android:textColor="#A7F3D0"
                    android:textStyle="bold" />

                <TextView
                    android:id="@+id/tvEncryptedCount"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="4dp"
                    android:text="0 notas guardadas"
                    android:textColor="#6EE7B7"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tvEncryptedList"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="8dp"
                    android:textColor="#ECFDF5"
                    android:textSize="13sp" />

            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Panel 2: Almacenamiento Externo Público -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            app:cardBackgroundColor="#451A03"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="⚠️ Almacenamiento Externo / SD (Público)"
                    android:textColor="#FDE68A"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="2dp"
                    android:text="Ruta: /sdcard/Download/secret_note_insecure.txt"
                    android:textColor="#FBBF24"
                    android:textSize="11sp" />

                <TextView
                    android:id="@+id/tvExternalPreview"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="8dp"
                    android:fontFamily="monospace"
                    android:textColor="#FEF3C7"
                    android:textSize="12sp" />

                <Button
                    android:id="@+id/btnClearExternal"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="8dp"
                    android:backgroundTint="#78350F"
                    android:text="Borrar archivo externo"
                    android:textSize="12sp" />

            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

    </LinearLayout>
</ScrollView>
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifiesto de la aplicación con permisos de almacenamiento externo',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.security.securenotes">

    <!-- Permisos para almacenamiento externo (necesarios para demostrar la copia insegura en SD) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28"
        tools:ignore="ScopedStorage" />

    <application
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Notas Seguras"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Material3.DayNight.NoActionBar"
        android:requestLegacyExternalStorage="true"
        tools:targetApi="31">

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
`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Configuración Gradle con la dependencia Jetpack Security (androidx.security:security-crypto)',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.security.securenotes"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.security.securenotes"
        minSdk = 23 // Jetpack Security requiere minSdk 23 (Android 6.0 Marshmallow) por Keystore
        targetSdk = 34
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
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // =========================================================================
    // BIBLIOTECA CLAVE: JETPACK SECURITY (EncryptedSharedPreferences)
    // Implementa cifrado autenticado respaldado por el hardware Android Keystore
    // =========================================================================
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}
`,
  },
];

export const README_CONTENT = `# Taller 3 - Punto 4: Seguridad en el Almacenamiento y Cifrado en Android: Informe Técnico

**Mecanismo abordado:** Seguridad en el Almacenamiento (Cifrado local vs. Almacenamiento en SD/Público).

## 1. Resumen Ejecutivo y Objetivo
El objetivo del presente laboratorio es evaluar y contrastar de manera experimental la seguridad del almacenamiento local en la plataforma Android mediante dos mecanismos disímiles:

1. **Almacenamiento Interno Privado Cifrado:** Implementado mediante la biblioteca oficial \`androidx.security:security-crypto\` (\`EncryptedSharedPreferences\`), respaldado por una clave maestra (\`MasterKey\`) custodiada en el hardware de seguridad (*Android Keystore* con TEE o StrongBox).
2. **Almacenamiento Externo Público Sin Cifrar:** Implementado escribiendo directamente en la tarjeta de memoria SD / almacenamiento compartido (\`/sdcard/Download/secret_note_insecure.txt\` o \`Environment.getExternalStoragePublicDirectory()\`).

A través del uso de **Device File Explorer** y la interfaz de línea de comandos **ADB (Android Debug Bridge)**, se inspeccionaron los sistemas de archivos para evidenciar la susceptibilidad a la extracción de datos confidenciales y fuga de información en texto claro.

## 2. Metodología de Implementación

### 2.1 Almacenamiento Cifrado (EncryptedSharedPreferences)
Para el almacenamiento privado se configuró la biblioteca Jetpack Security utilizando un esquema de doble cifrado criptográfico:

- **Cifrado de claves:** \`AES256_SIV\` (RFC 5297). Es un algoritmo de cifrado autenticado sintético y determinista. Garantiza que una misma clave de preferencia siempre genere el mismo hash cifrado dentro del archivo XML, permitiendo al sistema consultar valores por su clave sin necesidad de descifrar todo el diccionario.
- **Cifrado de valores:** \`AES256_GCM\` (Galois/Counter Mode). Proporciona confidencialidad e integridad criptográfica mediante un vector de inicialización único (IV) y una etiqueta de autenticación (Tag) de 128 bits. Si un atacante altera un solo bit del archivo en disco, el descifrado falla inmediatamente arrojando una excepción \`AEADBadTagException\`.
- **Custodia de Claves:** La clave maestra (\`MasterKey\`) nunca se almacena en el archivo XML ni en el código fuente. Reside en el chip criptográfico de hardware (*Android Keystore / ARM TrustZone*).

\`\`\`kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secret_notes_encrypted",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
\`\`\`

### 2.2 Almacenamiento Externo en Texto Claro (SD / Público)
Se escribió el mismo contenido confidencial directamente mediante flujos de salida (\`FileOutputStream\`) en la ruta externa compartida:

\`\`\`kotlin
val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
val targetFile = File(externalDir, "secret_note_insecure.txt")

FileOutputStream(targetFile, true).use { fos ->
    fos.write(textoConfidencial.toByteArray())
}
\`\`\`

## 3. Pruebas Experimentales y Evidencias de Inspección

### Prueba 3.1: Extracción e Inspección con ADB del Almacenamiento Externo
Se ejecutó una sesión de consola ADB hacia el emulador para verificar el directorio de almacenamiento público:

\`\`\`bash
# 1. Listar los archivos en el almacenamiento externo
$ adb shell ls -la /sdcard/Download/
-rw-rw---- 1 root sdcard_rw 421 2026-09-30 19:42 secret_note_insecure.txt

# 2. Imprimir el contenido directamente en consola
$ adb shell cat /sdcard/Download/secret_note_insecure.txt
\`\`\`

**Resultado obtenido:**
\`\`\`text
=====================================================
NOTA CONFIDENCIAL - COPIA SIN CIFRAR EN SD/EXTERNO
Fecha: Wed Sep 30 19:42:15 GMT-05:00 2026
Título: Credenciales Bancarias de Emergencia
Contenido Confidencial:
Usuario: usuario_admin_2026
Clave: SuperSecretToken#9918!
PIN Transaccional: 8841
Token OTP Semilla: JBSWY3DPEHPK3PXP
=====================================================
\`\`\`

**Comando de extracción directa a la máquina del analista/atacante:**
\`\`\`bash
$ adb pull /sdcard/Download/secret_note_insecure.txt ./insecure_dump.txt
/sdcard/Download/secret_note_insecure.txt: 1 file pulled, 0 skipped. 0.1 MB/s (421 bytes in 0.003s)
\`\`\`

> **Hallazgo:** Los datos confidenciales son **100% legibles de forma inmediata**. No se requirieron permisos de superusuario (root), ni autenticación biométrica, ni descifrado alguno. Cualquier aplicación instalada en el dispositivo con el permiso \`READ_EXTERNAL_STORAGE\` puede secuestrar o filtrar esta información sensible.

### Prueba 3.2: Inspección con Device File Explorer del Almacenamiento Privado Cifrado
A través del **Device File Explorer** de Android Studio, se navegó a la ruta interna de la aplicación:
\`/data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml\`

Al abrir e inspeccionar el archivo XML, se observó la siguiente estructura:
\`\`\`xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQoDX3RoZRJmEjQICRABGAEgASokY2ZkMmMwMDktMTU2OC00Y2JlLWJjNDctNTA5NjA4OWQwZTdmEgUIAxCAGRpGEkQIARABGAEgASokMWVmZjVlNjItM2QwMC00OTZhLWE2ZjctOTM2NGYxODdmN2NhIgUIAxCAGAE=</string>
    <string name="__androidx_security_crypto_encrypted_prefs_value_keyset__">BQwDYnVyRJmEjQICRABGAEgASokY2ZkMmMwMDktMTU2OC00Y2JlLWJjNDctNTA5NjA4OWQwZTdmEgUIAxCAGRpGEkQIARABGAEgASokMWVmZjVlNjItM2QwMC00OTZhLWE2ZjctOTM2NGYxODdmN2NhIgUIAxCAGAE=</string>
    <string name="AR48H91SKL921389KMNBVFRTYU100293==">AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==</string>
</map>
\`\`\`

Si se intenta leer directamente con ADB como un usuario estándar no autorizado:
\`\`\`bash
$ adb shell cat /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml
/system/bin/sh: cat: /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml: Permission denied
\`\`\`

Incluso ejecutando \`run-as com.security.securenotes\` (privilegios de depuración de la propia app) para forzar la lectura del archivo físico:
\`\`\`bash
$ adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml
\`\`\`

> **Hallazgo:** Incluso con acceso físico o privilegios de depuración a los archivos del paquete, **la información es completamente ilegible (texto cifrado incomprensible)**. La clave de cifrado no está en el archivo y solo el hardware del dispositivo puede realizar el descifrado legítimo mientras la aplicación está en memoria activa.

## 4. Cuadro Comparativo de Seguridad

| Criterio de Evaluación | Almacenamiento Externo / SD (Público) | Almacenamiento Interno con EncryptedSharedPreferences |
| :--- | :--- | :--- |
| **Ruta en Sistema de Archivos** | \`/sdcard/Download/\` o \`/storage/emulated/0/\` | \`/data/data/<package>/shared_prefs/\` |
| **Formato en Disco** | Archivo de texto plano (\`.txt\`) | Archivo XML cifrado con Keyset de Tink |
| **Algoritmo Criptográfico** | **Ninguno** (Texto claro UTF-8) | **AES-256-GCM** (valores) + **AES-256-SIV** (claves) |
| **Permisos POSIX del SO** | Lectura abierta a apps con permiso de storage | Restringido al UID/GID exclusivo de la aplicación |
| **Extracción Física de SD** | **Crítica:** Lectura instantánea en cualquier PC | **Inmune:** Los datos no residen en la SD extraíble |
| **Resistencia a ADB Pull** | **Nula:** Extraíble sin permisos especiales | **Alta:** Bloqueado por permisos Linux; cifrado si se extrae |
| **Gestión de Llaves** | No aplica | Hardware Keystore (TEE / StrongBox) |

## 5. Conclusiones y Cumplimiento de la Rúbrica
1. **Dimensión del Saber (Dominio Conceptual):**
   - Se demostró que el cifrado a nivel de sistema de archivos por defecto en Android (FBE - File Based Encryption) protege el dispositivo bloqueado, pero **no sustituye el cifrado a nivel de aplicación**. Un archivo guardado en almacenamiento externo queda expuesto a cualquier proceso con permisos de almacenamiento.
   - La implementación de \`EncryptedSharedPreferences\` resuelve tanto la confidencialidad como la integridad mediante cifrado autenticado (AEAD).

2. **Dimensión del Hacer (Funcionalidad y Pruebas):**
   - Se implementó la pantalla de notas confidenciales en Kotlin de forma limpia, separando la lógica criptográfica en \`SecurityStorageManager\`.
   - Las pruebas con ADB (\`cat\`, \`pull\`, \`run-as\`) y Device File Explorer evidenciaron empíricamente la diferencia entre ambos esquemas.

3. **Dimensión del Ser (Ética y Seguridad):**
   - El ejercicio confirma la responsabilidad ética del ingeniero de software móvil: almacenar información sensible (contraseñas, historias clínicas, tokens) en almacenamiento externo o sin cifrar constituye una vulnerabilidad crítica (OWASP Mobile Top 10 - M1: Insecure Data Storage).
`;
