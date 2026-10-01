package com.example.cryptovault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.data.crypto.CryptoSimulator
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.SecurityUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceFileExplorerScreen(
    uiState: SecurityUiState,
    modifier: Modifier = Modifier
) {
    val clipboardManager = LocalClipboardManager.current
    var selectedFile by remember { mutableStateOf("enc_xml") } // "enc_xml" or "insecure_txt"
    var viewMode by remember { mutableStateOf("text") } // "text", "hex", "security"
    var copyMessage by remember { mutableStateOf<String?>(null) }

    val encryptedXmlContent = remember(uiState.notes) {
        CryptoSimulator.generateEncryptedPrefsXml(uiState.notes)
    }

    val externalTxtContent = remember(uiState.notes) {
        CryptoSimulator.generateExternalFileContent(uiState.notes)
    }

    val activeContent = if (selectedFile == "enc_xml") encryptedXmlContent else externalTxtContent
    val activeFileName = if (selectedFile == "enc_xml") "secret_notes_encrypted.xml" else "secret_note_insecure.txt"
    val activeFilePath = if (selectedFile == "enc_xml") {
        "/data/data/com.example/shared_prefs/secret_notes_encrypted.xml"
    } else {
        "/sdcard/Download/secret_note_insecure.txt"
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Storage, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Device File Explorer", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text("Inspección de almacenamiento Android", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
                IconButton(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(activeContent))
                        copyMessage = "Copiado al portapapeles"
                    },
                    modifier = Modifier.testTag("copy_file_btn")
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copiar", tint = LimeAccent)
                }
            }

            // Selector de archivos del sistema
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { selectedFile = "enc_xml" }
                        .testTag("select_enc_xml"),
                    colors = CardDefaults.cardColors(
                        containerColor = if (selectedFile == "enc_xml") DarkGreen else DarkSurface
                    ),
                    shape = RoundedCornerShape(12.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (selectedFile == "enc_xml") GreenLight else Color.Transparent
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Lock, contentDescription = null, tint = GreenLight, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("secret_notes.xml", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                        }
                        Text("Interno Seguro (u0_a145)", fontSize = 10.sp, color = GreenLight)
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { selectedFile = "insecure_txt" }
                        .testTag("select_insecure_txt"),
                    colors = CardDefaults.cardColors(
                        containerColor = if (selectedFile == "insecure_txt") Color(0xFF7F1D1D) else DarkSurface
                    ),
                    shape = RoundedCornerShape(12.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (selectedFile == "insecure_txt") DangerRed else Color.Transparent
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = DangerRed, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("secret_note.txt", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                        }
                        Text("Externo Inseguro (everybody)", fontSize = 10.sp, color = DangerRed)
                    }
                }
            }

            // Path & Metadatos
            Surface(
                color = DarkSurface,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        activeFilePath,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = LimeAccent,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        if (selectedFile == "enc_xml") "-rw-rw---- u0_a145" else "-rw-rw---- everybody",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = TextSecondary
                    )
                }
            }

            // Tabs de visualización: Texto, Hex Dump, Riesgo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = viewMode == "text",
                    onClick = { viewMode = "text" },
                    label = { Text("Contenido Texto", fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = GreenLight,
                        selectedLabelColor = DarkBackground
                    )
                )
                FilterChip(
                    selected = viewMode == "hex",
                    onClick = { viewMode = "hex" },
                    label = { Text("Visor Hexadecimal", fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = GreenLight,
                        selectedLabelColor = DarkBackground
                    )
                )
                FilterChip(
                    selected = viewMode == "security",
                    onClick = { viewMode = "security" },
                    label = { Text("Análisis de Riesgo", fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = GreenLight,
                        selectedLabelColor = DarkBackground
                    )
                )
            }

            // Área de Contenido
            Surface(
                color = DarkSurface,
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DarkCard)),
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                when (viewMode) {
                    "text" -> {
                        LazyColumn(modifier = Modifier.fillMaxSize().padding(12.dp)) {
                            item {
                                Text(
                                    activeContent,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    lineHeight = 16.sp,
                                    color = if (selectedFile == "enc_xml") TextPrimary else DangerRed
                                )
                            }
                        }
                    }
                    "hex" -> {
                        val hexDump = remember(activeContent) {
                            CryptoSimulator.generateHexDump(activeContent)
                        }
                        LazyColumn(modifier = Modifier.fillMaxSize().padding(12.dp)) {
                            item {
                                Text(
                                    hexDump,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 10.sp,
                                    lineHeight = 15.sp,
                                    color = LimeAccent
                                )
                            }
                        }
                    }
                    "security" -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            item {
                                if (selectedFile == "enc_xml") {
                                    Text(
                                        "🛡️ Análisis de Seguridad: EncryptedSharedPreferences",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = GreenLight
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        "• La clave maestra (MasterKey) reside en el hardware TEE / StrongBox mediante Android Keystore.\n" +
                                        "• Claves cifradas con AES-256 SIV: no revelan nombres de variables ni patrones.\n" +
                                        "• Valores cifrados con AES-256 GCM: garantizan confidencialidad y detección de manipulación (AEAD).\n" +
                                        "• Permisos Sandbox: sólo accesibles por el UID 'u0_a145'. Otras apps en el sistema operativo reciben Permission Denied.",
                                        fontSize = 12.sp,
                                        color = TextPrimary,
                                        lineHeight = 18.sp
                                    )
                                } else {
                                    Text(
                                        "⚠️ Análisis de Riesgo: Almacenamiento Externo Público",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = DangerRed
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        "• Vulnerabilidad OWASP M2 (Insecure Data Storage).\n" +
                                        "• Permisos globales del grupo 'everybody' (sdcard_rw).\n" +
                                        "• Cualquier app con permiso READ_EXTERNAL_STORAGE puede extraer todos los PINs, contraseñas y claves de API.\n" +
                                        "• El comando forense 'adb pull' permite exfiltrar el archivo completo sin requerir permisos de root ni autorización en el dispositivo.",
                                        fontSize = 12.sp,
                                        color = TextPrimary,
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
