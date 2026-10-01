package com.example.cryptovault.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.cryptovault.data.crypto.CryptoSimulator
import com.example.cryptovault.data.crypto.SecurityStorageManager
import com.example.cryptovault.data.model.ConfidentialNote
import com.example.cryptovault.data.model.SecretCategory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class NavTab(val title: String, val badge: String? = null) {
    VAULT("Simulador Móvil"),
    EXPLORER("Device Explorer"),
    ADB("Terminal ADB"),
    ARCHITECTURE("Arquitectura"),
    CODE("Código Fuente", "5"),
    REPORT("Informe README"),
    STEPS("Guía Lab", "5 pasos")
}

data class TerminalLog(
    val id: String,
    val type: LogType,
    val text: String,
    val timestamp: String
)

enum class LogType {
    INPUT, OUTPUT, ERROR, SUCCESS, INFO
}

data class SecurityUiState(
    val activeTab: NavTab = NavTab.VAULT,
    val notes: List<ConfidentialNote> = emptyList(),
    val selectedNoteId: String? = null,
    val listFilter: String = "all", // "all", "encrypted", "external"
    val terminalLogs: List<TerminalLog> = emptyList(),
    val currentStep: Int = 1,
    val toastMessage: String? = null,
    val isSuccessToast: Boolean = true
)

class SecurityViewModel(application: Application) : AndroidViewModel(application) {

    private val storageManager = SecurityStorageManager(application)

    private val _uiState = MutableStateFlow(SecurityUiState())
    val uiState: StateFlow<SecurityUiState> = _uiState.asStateFlow()

    init {
        val initialNotes = listOf(
            ConfidentialNote(
                id = "note_849201",
                title = "PIN y Clave Bancaria",
                content = "PIN: 8841 | Clave: Sec#9918",
                category = SecretCategory.BANCARIO,
                timestamp = "19:42:15",
                isEncryptedStored = true,
                isExternalStored = true,
                encryptedKeyCipher = "AR92J3KLM4091A8SK0192JDJAKL901==",
                encryptedValueCipher = "AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==",
                rawExternalContent = "PIN: 8841 | Clave: Sec#9918"
            ),
            ConfidentialNote(
                id = "note_512844",
                title = "Token de Servicio API",
                content = "API_KEY: AKIAIOSF9918-SECRET-TOKEN-AUTH",
                category = SecretCategory.API_TOKENS,
                timestamp = "19:44:02",
                isEncryptedStored = true,
                isExternalStored = false,
                encryptedKeyCipher = "AR83HD9201LKS0928374HJAKSLMNZ9==",
                encryptedValueCipher = "AQ83Kd821ksl81923kjsdkla7182903jskldja81923==",
                rawExternalContent = ""
            )
        )

        val initialLogs = listOf(
            TerminalLog(
                id = "init-1",
                type = LogType.INFO,
                text = "Android Debug Bridge (ADB) v1.0.41 - Auditoría Forense de Seguridad (Punto 4)\nConectado a emulador: emulator-5554 (Android 14 API 34 x86_64)",
                timestamp = "19:40:00"
            ),
            TerminalLog(
                id = "init-2",
                type = LogType.OUTPUT,
                text = "Escribe un comando o haz clic en los comandos rápidos para inspeccionar el almacenamiento.",
                timestamp = "19:40:01"
            )
        )

        _uiState.update {
            it.copy(
                notes = initialNotes,
                terminalLogs = initialLogs,
                selectedNoteId = initialNotes.firstOrNull()?.id
            )
        }
    }

    fun setTab(tab: NavTab) {
        _uiState.update { it.copy(activeTab = tab) }
    }

    fun setFilter(filter: String) {
        _uiState.update { it.copy(listFilter = filter) }
    }

    fun selectNote(id: String) {
        _uiState.update { it.copy(selectedNoteId = id) }
    }

    fun setStep(step: Int) {
        _uiState.update { it.copy(currentStep = step.coerceIn(1, 5)) }
    }

    fun clearToast() {
        _uiState.update { it.copy(toastMessage = null) }
    }

    fun addNote(
        title: String,
        content: String,
        category: SecretCategory,
        isEncrypted: Boolean
    ): Boolean {
        val trimmedTitle = title.trim()
        val trimmedContent = content.trim()

        if (trimmedTitle.length < 3 || trimmedContent.length < 3) {
            _uiState.update {
                it.copy(
                    toastMessage = "Error: El título y contenido deben tener al menos 3 caracteres",
                    isSuccessToast = false
                )
            }
            return false
        }

        if (_uiState.value.notes.any { it.title.equals(trimmedTitle, ignoreCase = true) }) {
            _uiState.update {
                it.copy(
                    toastMessage = "Error: Ya existe una nota con este título",
                    isSuccessToast = false
                )
            }
            return false
        }

        val id = "note_${System.currentTimeMillis().toString().takeLast(6)}"
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val encKey = CryptoSimulator.generateEncryptedKey(id)
        val encVal = CryptoSimulator.generateEncryptedValue("$trimmedTitle|||$trimmedContent")

        val newNote = ConfidentialNote(
            id = id,
            title = trimmedTitle,
            content = trimmedContent,
            category = category,
            timestamp = time,
            isEncryptedStored = isEncrypted,
            isExternalStored = !isEncrypted,
            encryptedKeyCipher = encKey,
            encryptedValueCipher = encVal,
            rawExternalContent = if (!isEncrypted) trimmedContent else ""
        )

        // Almacenar con el gestor nativo de Android
        if (isEncrypted) {
            storageManager.saveEncryptedNote(newNote)
        } else {
            storageManager.saveInsecureExternalNote(newNote)
        }

        _uiState.update { state ->
            val updatedNotes = listOf(newNote) + state.notes
            state.copy(
                notes = updatedNotes,
                selectedNoteId = id,
                toastMessage = if (isEncrypted) {
                    "✅ Guardada con AES-256 en EncryptedSharedPreferences (Hardware Keystore)"
                } else {
                    "⚠️ Guardada en TEXTO PLANO en /sdcard/Download/secret_note_insecure.txt"
                },
                isSuccessToast = isEncrypted,
                listFilter = if (isEncrypted) "encrypted" else "external"
            )
        }
        return true
    }

    fun deleteNote(id: String) {
        storageManager.deleteEncryptedNote(id)
        _uiState.update { state ->
            val filtered = state.notes.filterNot { it.id == id }
            state.copy(
                notes = filtered,
                selectedNoteId = filtered.firstOrNull()?.id,
                toastMessage = "Nota eliminada",
                isSuccessToast = true
            )
        }
    }

    fun clearExternalStorage() {
        storageManager.clearInsecureExternalFile()
        _uiState.update { state ->
            val updated = state.notes.map { it.copy(isExternalStored = false, rawExternalContent = "") }
            state.copy(
                notes = updated,
                toastMessage = "Almacenamiento externo insecure limpiado exitosamente",
                isSuccessToast = true
            )
        }
    }

    fun executeAdbCommand(command: String) {
        val trimmed = command.trim()
        if (trimmed.isEmpty()) return

        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val inputLog = TerminalLog(
            id = "cmd_${System.currentTimeMillis()}",
            type = LogType.INPUT,
            text = "analyst@workstation:~$ $trimmed",
            timestamp = time
        )

        val lower = trimmed.lowercase(Locale.ROOT)
        if (lower == "clear" || lower == "cls") {
            _uiState.update { it.copy(terminalLogs = emptyList()) }
            return
        }

        val outLog: TerminalLog = when {
            lower == "help" -> {
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.INFO,
                    text = """
                    Comandos sugeridos para la auditoría forense del Punto 4:
                      adb devices                                                      -> Listar emuladores conectados
                      adb shell ls -la /sdcard/Download/                               -> Listar almacenamiento externo (Permisos globales)
                      adb shell cat /sdcard/Download/secret_note_insecure.txt           -> Leer archivo inseguro (Texto claro vulnerable)
                      adb pull /sdcard/Download/secret_note_insecure.txt               -> Extraer nota externa a la máquina local
                      adb shell cat /data/data/com.example/shared_prefs/secret_notes_encrypted.xml -> Bloqueo Sandbox
                      adb shell run-as com.example cat shared_prefs/secret_notes_encrypted.xml    -> Leer XML Cifrado
                      clear                                                            -> Limpiar pantalla
                    """.trimIndent(),
                    timestamp = time
                )
            }
            lower.contains("adb devices") -> {
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.OUTPUT,
                    text = "List of devices attached\nemulator-5554\tdevice product:sdk_gphone64_x86_64 model:Pixel_7_Pro device:emu64xa transport_id:1",
                    timestamp = time
                )
            }
            lower.contains("ls") && lower.contains("/sdcard") -> {
                val extContent = CryptoSimulator.generateExternalFileContent(_uiState.value.notes)
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.OUTPUT,
                    text = "total 16\ndrwxrwx--x 3 root     everybody 4096 2026-09-30 19:40 .\ndrwxrwx--x 4 root     everybody 4096 2026-09-30 19:35 ..\n-rw-rw---- 1 u0_a145  everybody  ${extContent.length} 2026-09-30 19:42 secret_note_insecure.txt\n\n[ANÁLISIS]: El grupo 'everybody' (sdcard_rw) permite que cualquier app con READ_EXTERNAL_STORAGE lea este archivo.",
                    timestamp = time
                )
            }
            lower.contains("cat") && lower.contains("secret_note_insecure.txt") -> {
                val extContent = CryptoSimulator.generateExternalFileContent(_uiState.value.notes)
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.ERROR,
                    text = "⚠️ [VULNERABILIDAD CRÍTICA - EXTRACCIÓN EXITOSA EN TEXTO PLANO]:\n$extContent",
                    timestamp = time
                )
            }
            lower.contains("pull") && lower.contains("secret_note_insecure.txt") -> {
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.SUCCESS,
                    text = "/sdcard/Download/secret_note_insecure.txt: 1 file pulled, 0 skipped. 0.8 MB/s (1284 bytes in 0.001s)\nArchivo copiado en el host local: ./analyst_loot/secret_note_insecure.txt (Contiene secretos en texto plano)",
                    timestamp = time
                )
            }
            lower.contains("run-as") && lower.contains("secret_notes_encrypted.xml") -> {
                val xml = CryptoSimulator.generateEncryptedPrefsXml(_uiState.value.notes)
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.SUCCESS,
                    text = "✅ [PROTECCIÓN EFECTIVA - DATOS CIFRADOS]:\n$xml\n\n[RESULTADO]: Las llaves están cifradas con AES-256 SIV y los valores con AES-256 GCM. Sin la MasterKey del Android Keystore, el atacante solo ve ruido binario.",
                    timestamp = time
                )
            }
            lower.contains("cat") && lower.contains("/data/data/") -> {
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.ERROR,
                    text = "/system/bin/sh: cat: /data/data/com.example/shared_prefs/secret_notes_encrypted.xml: Permission denied\n\n[ANÁLISIS]: El aislamiento Sandbox de Linux bloquea el acceso directo a procesos no autorizados.",
                    timestamp = time
                )
            }
            else -> {
                TerminalLog(
                    id = "out_${System.currentTimeMillis()}",
                    type = LogType.OUTPUT,
                    text = "Comando '$trimmed' ejecutado. Escribe 'help' para ver la lista de comandos forenses del laboratorio.",
                    timestamp = time
                )
            }
        }

        _uiState.update { it.copy(terminalLogs = it.terminalLogs + listOf(inputLog, outLog)) }
    }
}
