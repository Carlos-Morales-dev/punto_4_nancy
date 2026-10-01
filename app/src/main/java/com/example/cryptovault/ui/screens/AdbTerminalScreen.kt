package com.example.cryptovault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.LogType
import com.example.cryptovault.viewmodel.SecurityUiState
import com.example.cryptovault.viewmodel.SecurityViewModel

@Composable
fun AdbTerminalScreen(
    uiState: SecurityUiState,
    viewModel: SecurityViewModel,
    modifier: Modifier = Modifier
) {
    var commandInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    val quickCommands = listOf(
        "adb devices" to "Dispositivos",
        "adb shell ls -la /sdcard/Download/" to "Listar SD",
        "adb shell cat /sdcard/Download/secret_note_insecure.txt" to "Leer Inseguro SD",
        "adb pull /sdcard/Download/secret_note_insecure.txt" to "Exfiltrar (Pull)",
        "adb shell cat /data/data/com.example/shared_prefs/secret_notes_encrypted.xml" to "Leer Sandbox Directo",
        "adb shell run-as com.example cat shared_prefs/secret_notes_encrypted.xml" to "Leer con Run-As",
        "help" to "Ayuda",
        "clear" to "Limpiar"
    )

    LaunchedEffect(uiState.terminalLogs.size) {
        if (uiState.terminalLogs.isNotEmpty()) {
            listState.animateScrollToItem(uiState.terminalLogs.size - 1)
        }
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
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header del Terminal
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Terminal, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Terminal ADB Forense", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text("Android Debug Bridge Emulator - Auditoría de Persistencia", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
                IconButton(onClick = { viewModel.executeAdbCommand("clear") }) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Limpiar", tint = TextSecondary)
                }
            }

            // Barra de Comandos Rápidos
            Text("Comandos de Auditoría Forense:", style = MaterialTheme.typography.labelSmall, color = LimeAccent)
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(quickCommands) { (cmd, label) ->
                    Button(
                        onClick = { viewModel.executeAdbCommand(cmd) },
                        colors = ButtonDefaults.buttonColors(containerColor = DarkCard),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.testTag("quick_cmd_${label.lowercase().replace(" ", "_")}")
                    ) {
                        Text(label, fontSize = 11.sp, color = GreenLight, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            // Ventana del Terminal (Linux Console Style)
            Surface(
                color = Color(0xFF030712),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DarkGreen)),
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.terminalLogs, key = { it.id }) { log ->
                        val textColor = when (log.type) {
                            LogType.INPUT -> LimeAccent
                            LogType.OUTPUT -> TextPrimary
                            LogType.ERROR -> DangerRed
                            LogType.SUCCESS -> GreenLight
                            LogType.INFO -> Color(0xFF38BDF8)
                        }
                        Column {
                            if (log.type == LogType.INPUT) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(">", color = GreenLight, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(log.text, color = textColor, fontFamily = FontFamily.Monospace, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                }
                            } else {
                                Text(
                                    log.text,
                                    color = textColor,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }
                }
            }

            // Línea de Entrada de Comandos
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = commandInput,
                    onValueChange = { commandInput = it },
                    placeholder = { Text("Escribe comando adb shell...", fontSize = 12.sp, color = TextSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = GreenLight,
                        unfocusedBorderColor = DarkCard
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("terminal_input_field")
                )

                Button(
                    onClick = {
                        viewModel.executeAdbCommand(commandInput)
                        commandInput = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenLight, contentColor = DarkBackground),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("btn_execute_adb")
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = "Ejecutar")
                }
            }
        }
    }
}
