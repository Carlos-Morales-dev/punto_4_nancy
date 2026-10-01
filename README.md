# Taller 3 — Punto 4: Seguridad y Cifrado en Android

Aplicación nativa en **Android (Kotlin + Jetpack Compose)** y suite de laboratorio para el análisis y auditoría de persistencia segura: **`EncryptedSharedPreferences` respaldado por Android Keystore vs Almacenamiento Externo Público Sin Cifrar (`/sdcard/Download`)**.

---

## 📱 Descripción General

La aplicación implementa de forma práctica y visual los conceptos de seguridad requeridos en el Punto 4 de persistencia en Android:
1. **Almacenamiento Cifrado Seguro**: Uso de `androidx.security.crypto.EncryptedSharedPreferences` con llaves administradas en hardware (TEE / StrongBox) mediante `MasterKey` con esquema `AES256_GCM`. Las claves se cifran determinísticamente con **AES-256 SIV** y los datos con **AES-256 GCM**.
2. **Almacenamiento Externo Inseguro**: Persistencia de secretos en texto plano en `/sdcard/Download/secret_note_insecure.txt` para evidenciar la vulnerabilidad OWASP M2 (Insecure Data Storage).
3. **Device File Explorer**: Inspección en tiempo real de los archivos generados en el sandbox de Linux (`/data/data/com.example/shared_prefs/secret_notes_encrypted.xml`) frente al archivo público, con visor XML y volcado hexadecimal (Hex Dump).
4. **Terminal ADB Forense**: Consola interactiva de comandos Android Debug Bridge para simular la extracción y auditoría forense (`adb devices`, `adb shell cat`, `adb pull`, `run-as`).
5. **Arquitectura Criptográfica**: Explicación técnica de la gestión de claves en 2 niveles (2-Tier Key Management) de Jetpack Security y Google Tink.
6. **Guía de Laboratorio en 5 Pasos**: Asistente interactivo guiado para reproducir la práctica completa.

---

## 🛠️ Estructura del Proyecto Android

```
├── app/
│   ├── build.gradle.kts                 # Configuración de compilación con Compose y Jetpack Security
│   └── src/main/
│       ├── AndroidManifest.xml          # Permisos y configuración de aplicación segura
│       ├── java/com/example/cryptovault/
│       │   ├── MainActivity.kt          # Actividad principal con navegación y barras de herramientas
│       │   ├── data/
│       │   │   ├── model/
│       │   │   │   ├── ConfidentialNote.kt
│       │   │   │   ├── SecretCategory.kt
│       │   │   │   └── FileSystemItem.kt
│       │   │   └── crypto/
│       │   │       ├── SecurityStorageManager.kt  # Implementación nativa de EncryptedSharedPreferences
│       │   │       └── CryptoSimulator.kt         # Generación de volcados Hex y artefactos XML
│       │   ├── ui/
│       │   │   ├── theme/
│       │   │   │   ├── Color.kt
│       │   │   │   ├── Type.kt
│       │   │   │   └── Theme.kt
│       │   │   └── screens/
│       │   │       ├── VaultScreen.kt              # Bóveda móvil de notas confidenciales
│       │   │       ├── DeviceFileExplorerScreen.kt # Explorador de archivos del dispositivo
│       │   │       ├── AdbTerminalScreen.kt        # Terminal ADB forense
│       │   │       ├── CryptoArchitectureScreen.kt # Diagramas y comparativa criptográfica
│       │   │       ├── SourceCodeViewerScreen.kt   # Visor de código fuente de la solución
│       │   │       ├── ReadmeReportScreen.kt       # Informe técnico completo del laboratorio
│       │   │       └── StepsWizardScreen.kt        # Guía interactiva en 5 pasos
│       │   └── viewmodel/
│       │       └── SecurityViewModel.kt            # Manejo de estado reactivo y comandos forenses
│       └── res/
│           ├── drawable/
│           │   ├── ic_launcher_background.xml
│           │   └── ic_launcher_foreground.xml     # Ícono adaptativo personalizado (Escudo de seguridad)
│           ├── mipmap-anydpi-v26/
│           ├── values/
│           │   ├── strings.xml
│           │   ├── colors.xml
│           │   └── themes.xml
│           └── xml/
│               ├── backup_rules.xml
│               └── data_extraction_rules.xml
├── gradle/
│   └── libs.versions.toml               # Catálogo de dependencias centralizado
├── build.gradle.kts                     # Gradle raíz
├── settings.gradle.kts                  # Configuración del proyecto Android
└── metadata.json
```

---

## 🔒 Mecanismo Criptográfico (EncryptedSharedPreferences)

1. **Hardware Keystore**: Se genera una `MasterKey` con `MasterKey.KeyScheme.AES256_GCM` en el hardware seguro del dispositivo (TEE o StrongBox).
2. **Deterministic AEAD (AES256_SIV)**: Las claves de los pares clave-valor se cifran con AES-256 SIV. Esto permite buscar y acceder a las claves por su hash cifrado sin necesidad de descifrar todo el almacenamiento.
3. **Authenticated Encryption (AES256_GCM)**: Los valores de las notas se cifran con AES-256 GCM, incorporando un vector de inicialización (IV) de 12 bytes y un tag de autenticación de 16 bytes que previene la alteración o manipulación de datos en reposo.

---

## ⚡ Comandos ADB de Auditoría

- `adb devices`: Lista los dispositivos y emuladores conectados.
- `adb shell ls -la /sdcard/Download/`: Muestra los permisos del grupo `everybody` en almacenamiento externo.
- `adb shell cat /sdcard/Download/secret_note_insecure.txt`: Lee la nota expuesta en texto plano (falla de seguridad).
- `adb pull /sdcard/Download/secret_note_insecure.txt`: Exfiltra el archivo inseguro hacia la máquina local.
- `adb shell run-as com.example cat shared_prefs/secret_notes_encrypted.xml`: Muestra el archivo cifrado protegido en el sandbox.
