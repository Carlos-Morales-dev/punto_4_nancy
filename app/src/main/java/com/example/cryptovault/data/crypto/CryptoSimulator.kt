package com.example.cryptovault.data.crypto

import com.example.cryptovault.data.model.ConfidentialNote
import java.nio.charset.StandardCharsets
import kotlin.math.abs

object CryptoSimulator {

    fun fakeBase64(str: String, salt: String = "enc"): String {
        var hash = 0
        for (ch in str) {
            hash = (hash shl 5) - hash + ch.code
        }
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        var result = "AR" + abs(hash).toString(36).uppercase()
        for (i in 0 until 28) {
            val saltChar = salt[i % salt.length].code
            val idx = abs((hash * 31 + i * 17 + saltChar) % chars.length)
            result += chars[idx]
        }
        return "$result=="
    }

    fun generateEncryptedKey(rawKey: String): String {
        return fakeBase64(rawKey, "siv_key_determinism")
    }

    fun generateEncryptedValue(rawValue: String): String {
        return fakeBase64(rawValue, "gcm_authenticated_payload")
    }

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
                if (j < chunk.size) {
                    hexParts.add("%02x".format(chunk[j]))
                } else {
                    hexParts.add("  ")
                }
            }

            val hex1 = hexParts.subList(0, 8).joinToString(" ")
            val hex2 = hexParts.subList(8, 16).joinToString(" ")

            val ascii = StringBuilder()
            for (byte in chunk) {
                val b = byte.toInt()
                if (b in 32..126) {
                    ascii.append(b.toChar())
                } else {
                    ascii.append('.')
                }
            }

            lines.add("$offset  $hex1  $hex2  |$ascii|")
            i += chunkSize
        }

        if (bytes.size > 256) {
            lines.add("... (${bytes.size - 256} bytes más en el archivo)")
        }

        return lines.joinToString("\n")
    }

    fun generateEncryptedPrefsXml(notes: List<ConfidentialNote>): String {
        val sb = StringBuilder()
        sb.append("<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n")
        sb.append("<map>\n")
        sb.append("    <!-- Android Jetpack Security: androidx.security.crypto.EncryptedSharedPreferences -->\n")
        sb.append("    <!-- Claves cifradas con AES-256-SIV (determinístico para búsquedas directas) -->\n")
        sb.append("    <!-- Valores cifrados con AES-256-GCM (autenticado con IV de 12 bytes y Tag GCM de 16 bytes) -->\n")
        sb.append("    <string name=\"__androidx_security_crypto_encrypted_prefs_key_keyset__\">AQo...AndroidKeystoreMasterKeyRef...AA=</string>\n")
        sb.append("    <string name=\"__androidx_security_crypto_encrypted_prefs_value_keyset__\">BQw...KeysetValuePayloadEncrypted...AQ==</string>\n")

        val encryptedNotes = notes.filter { it.isEncryptedStored }
        for (note in encryptedNotes) {
            sb.append("    <string name=\"${note.encryptedKeyCipher}\">${note.encryptedValueCipher}</string>\n")
        }
        sb.append("</map>")
        return sb.toString()
    }

    fun generateExternalFileContent(notes: List<ConfidentialNote>): String {
        val externalNotes = notes.filter { it.isExternalStored }
        val sb = StringBuilder()
        sb.append("=======================================================\n")
        sb.append("ALMACENAMIENTO EXTERNO INSEGURO (/sdcard/Download)\n")
        sb.append("ARCHIVO: secret_note_insecure.txt\n")
        sb.append("ADVERTENCIA: Archivo almacenado SIN CIFRAR en texto plano\n")
        sb.append("Cualquier aplicación con permiso de lectura o acceso ADB puede leer este contenido.\n")
        sb.append("=======================================================\n\n")

        if (externalNotes.isEmpty()) {
            sb.append("(No hay notas guardadas actualmente en almacenamiento externo)\n")
        } else {
            externalNotes.forEachIndexed { idx, n ->
                sb.append("[NOTA #${idx + 1}] - ID: ${n.id}\n")
                sb.append("FECHA: ${n.timestamp}\n")
                sb.append("CATEGORÍA: ${n.category.name}\n")
                sb.append("TÍTULO: ${n.title}\n")
                sb.append("CONTENIDO CONFIDENCIAL:\n${n.content}\n")
                sb.append("-------------------------------------------------------\n\n")
            }
        }
        return sb.toString()
    }
}
