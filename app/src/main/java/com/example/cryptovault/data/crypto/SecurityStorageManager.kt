package com.example.cryptovault.data.crypto

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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Taller 3 - Punto 4: Seguridad y Cifrado en Android
 *
 * Implementación de producción para comparar dos mecanismos de persistencia local:
 * 1. Almacenamiento Interno Privado Cifrado con EncryptedSharedPreferences (Jetpack Security)
 *    respaldado por la MasterKey en Android Keystore (hardware TEE/StrongBox).
 * 2. Almacenamiento Externo Público Sin Cifrar en texto plano (/sdcard/Download)
 *    vulnerable a exfiltración forense por ADB y otras aplicaciones con permisos de lectura.
 */
class SecurityStorageManager(private val context: Context) {

    companion object {
        private const val TAG = "SecurityStorageManager"
        const val ENCRYPTED_PREFS_FILENAME = "secret_notes_encrypted"
        const val EXTERNAL_INSECURE_FILENAME = "secret_note_insecure.txt"
    }

    // Instancia de SharedPreferences Cifradas respaldada por Android Keystore
    private val encryptedPrefs: SharedPreferences by lazy {
        try {
            // 1. Generación/recuperación de la MasterKey en el hardware seguro (TEE / StrongBox)
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            // 2. Creación de EncryptedSharedPreferences
            // - Claves cifradas con AES-256 SIV (Determinístico para permitir búsquedas directas)
            // - Valores cifrados con AES-256 GCM (Autenticado con IV y Tag de integridad)
            EncryptedSharedPreferences.create(
                context,
                ENCRYPTED_PREFS_FILENAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing EncryptedSharedPreferences, falling back to standard sandbox prefs", e)
            context.getSharedPreferences(ENCRYPTED_PREFS_FILENAME, Context.MODE_PRIVATE)
        }
    }

    // =========================================================================
    // 1. ALMACENAMIENTO INTERNO PRIVADO CIFRADO (SEGURO)
    // =========================================================================

    fun saveEncryptedNote(note: ConfidentialNote): Boolean {
        return try {
            val payload = "${note.title}|||${note.content}|||${note.category.id}|||${note.timestamp}"
            encryptedPrefs.edit().putString(note.id, payload).apply()
            Log.d(TAG, "Nota cifrada exitosamente con ID: ${note.id}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al guardar nota cifrada", e)
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
                        val title = parts[0]
                        val content = parts[1]
                        val category = SecretCategory.fromId(parts[2])
                        val timestamp = parts[3]
                        notes.add(
                            ConfidentialNote(
                                id = key,
                                title = title,
                                content = content,
                                category = category,
                                timestamp = timestamp,
                                isEncryptedStored = true,
                                isExternalStored = false,
                                encryptedKeyCipher = CryptoSimulator.generateEncryptedKey(key),
                                encryptedValueCipher = CryptoSimulator.generateEncryptedValue("$title|||$content"),
                                rawExternalContent = ""
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error recuperando notas cifradas", e)
        }
        return notes
    }

    fun deleteEncryptedNote(noteId: String) {
        try {
            encryptedPrefs.edit().remove(noteId).apply()
        } catch (e: Exception) {
            Log.e(TAG, "Error eliminando nota cifrada", e)
        }
    }

    // =========================================================================
    // 2. ALMACENAMIENTO EXTERNO PÚBLICO SIN CIFRAR (INSEGURO - SD / PÚBLICO)
    // =========================================================================

    fun saveInsecureExternalNote(note: ConfidentialNote): File? {
        return try {
            val targetDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)

            if (!targetDir.exists()) {
                targetDir.mkdirs()
            }

            val targetFile = File(targetDir, EXTERNAL_INSECURE_FILENAME)
            val newEntry = buildString {
                append("\n[REGISTRO INSEGURO SIN CIFRAR]\n")
                append("ID: ${note.id}\n")
                append("FECHA: ${note.timestamp}\n")
                append("CATEGORÍA: ${note.category.label}\n")
                append("TÍTULO: ${note.title}\n")
                append("CONTENIDO CONFIDENCIAL:\n${note.content}\n")
                append("-------------------------------------------------------\n")
            }

            FileOutputStream(targetFile, true).use { stream ->
                stream.write(newEntry.toByteArray())
            }

            Log.w(TAG, "⚠️ VULNERABILIDAD: Nota guardada en texto plano en ${targetFile.absolutePath}")
            targetFile
        } catch (e: Exception) {
            Log.e(TAG, "Error al escribir en almacenamiento externo", e)
            null
        }
    }

    fun clearInsecureExternalFile(): Boolean {
        return try {
            val targetDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val targetFile = File(targetDir, EXTERNAL_INSECURE_FILENAME)
            if (targetFile.exists()) {
                targetFile.delete()
            } else {
                true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error al limpiar archivo externo", e)
            false
        }
    }
}
