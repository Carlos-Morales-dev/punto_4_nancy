package com.example.cryptovault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.data.model.ConfidentialNote
import com.example.cryptovault.data.model.SecretCategory
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.SecurityUiState
import com.example.cryptovault.viewmodel.SecurityViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultScreen(
    uiState: SecurityUiState,
    viewModel: SecurityViewModel,
    modifier: Modifier = Modifier
) {
    val clipboardManager = LocalClipboardManager.current
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedNoteForDetail by remember { mutableStateOf<ConfidentialNote?>(null) }
    var newTitle by remember { mutableStateOf("") }
    var newContent by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(SecretCategory.BANCARIO) }
    var categoryDropdownExpanded by remember { mutableStateOf(false) }

    val filteredNotes = remember(uiState.notes, uiState.listFilter) {
        when (uiState.listFilter) {
            "encrypted" -> uiState.notes.filter { it.isEncryptedStored }
            "external" -> uiState.notes.filter { it.isExternalStored }
            else -> uiState.notes
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground,
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = GreenLight,
                contentColor = DarkBackground,
                shape = RoundedCornerShape(16.dp),
                icon = { Icon(Icons.Default.Add, contentDescription = "Nueva Nota") },
                text = { Text("Nueva Nota", fontWeight = FontWeight.Bold) },
                modifier = Modifier.testTag("new_note_fab")
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(6.dp))
                // Banner Explicativo del Laboratorio
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DarkGreen)),
                    modifier = Modifier.fillMaxWidth().testTag("vault_header_card")
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Security,
                                    contentDescription = "Security",
                                    tint = GreenLight,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    "Bóveda Confidencial - Punto 4",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary
                                )
                                Text(
                                    "EncryptedSharedPreferences (Keystore) vs Almacenamiento Externo",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = DarkGreen,
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(
                                        "Cifradas Keystore",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = GreenLight
                                    )
                                    Text(
                                        "${uiState.notes.count { it.isEncryptedStored }} notas",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF3B1F2B),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(
                                        "En Texto Plano (SD)",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = DangerRed
                                    )
                                    Text(
                                        "${uiState.notes.count { it.isExternalStored }} notas",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Filtros de navegación rápida
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = uiState.listFilter == "all",
                        onClick = { viewModel.setFilter("all") },
                        label = { Text("Todas (${uiState.notes.size})") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GreenLight,
                            selectedLabelColor = DarkBackground
                        ),
                        modifier = Modifier.testTag("filter_all")
                    )
                    FilterChip(
                        selected = uiState.listFilter == "encrypted",
                        onClick = { viewModel.setFilter("encrypted") },
                        label = { Text("Cifradas (${uiState.notes.count { it.isEncryptedStored }})") },
                        leadingIcon = {
                            Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GreenLight,
                            selectedLabelColor = DarkBackground
                        ),
                        modifier = Modifier.testTag("filter_encrypted")
                    )
                    FilterChip(
                        selected = uiState.listFilter == "external",
                        onClick = { viewModel.setFilter("external") },
                        label = { Text("Externas SD (${uiState.notes.count { it.isExternalStored }})") },
                        leadingIcon = {
                            Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp))
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = DangerRed,
                            selectedLabelColor = Color.White
                        ),
                        modifier = Modifier.testTag("filter_external")
                    )
                }
            }

            // Botón de limpieza de almacenamiento inseguro si hay notas externas
            if (uiState.notes.any { it.isExternalStored }) {
                item {
                    Button(
                        onClick = { viewModel.clearExternalStorage() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7F1D1D)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("clear_external_button")
                    ) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Purgar Archivo Externo Inseguro (/sdcard/Download)", fontSize = 12.sp)
                    }
                }
            }

            // Lista de Notas
            items(filteredNotes, key = { it.id }) { note ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedNoteForDetail = note }
                        .testTag("note_card_${note.id}"),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (note.isEncryptedStored) DarkGreen else Color(0xFF7F1D1D)
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Badge de Categoría
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = note.category.badgeBgColor
                            ) {
                                Text(
                                    note.category.name,
                                    color = note.category.badgeTextColor,
                                    style = MaterialTheme.typography.labelSmall,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    note.timestamp,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextSecondary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                IconButton(
                                    onClick = { viewModel.deleteNote(note.id) },
                                    modifier = Modifier.size(28.dp).testTag("delete_${note.id}")
                                ) {
                                    Icon(
                                        Icons.Default.Delete,
                                        contentDescription = "Eliminar",
                                        tint = TextSecondary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            note.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            note.content,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (note.isEncryptedStored) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = DarkGreen
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = GreenLight, modifier = Modifier.size(12.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("AES-256 GCM (Keystore)", color = GreenLight, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }
                            if (note.isExternalStored) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFF7F1D1D)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Icon(Icons.Default.Warning, contentDescription = null, tint = DangerRed, modifier = Modifier.size(12.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("SD Texto Plano Inseguro", color = DangerRed, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(60.dp))
            }
        }
    }

    // Modal para Crear Nota
    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = {
                Text("Crear Nota Confidencial", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Título de la Nota") },
                        placeholder = { Text("Ej: Clave API Bancaria") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("input_title")
                    )

                    OutlinedTextField(
                        value = newContent,
                        onValueChange = { newContent = it },
                        label = { Text("Contenido Secreto") },
                        placeholder = { Text("PIN: 4920 | Token: AKIA-SECRET...") },
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("input_content")
                    )

                    Text("Categoría:", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Box(modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = { categoryDropdownExpanded = true },
                            colors = ButtonDefaults.buttonColors(containerColor = DarkCard),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(selectedCategory.label, fontSize = 12.sp, color = TextPrimary)
                        }
                        DropdownMenu(
                            expanded = categoryDropdownExpanded,
                            onDismissRequest = { categoryDropdownExpanded = false }
                        ) {
                            SecretCategory.entries.forEach { cat ->
                                DropdownMenuItem(
                                    text = { Text(cat.label, fontSize = 12.sp) },
                                    onClick = {
                                        selectedCategory = cat
                                        categoryDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Selecciona el destino de almacenamiento:",
                        style = MaterialTheme.typography.labelSmall,
                        color = LimeAccent
                    )

                    Button(
                        onClick = {
                            val ok = viewModel.addNote(newTitle, newContent, selectedCategory, isEncrypted = true)
                            if (ok) {
                                newTitle = ""
                                newContent = ""
                                showCreateDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GreenLight, contentColor = DarkBackground),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().testTag("btn_save_encrypted_dialog")
                    ) {
                        Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("1. Guardar Cifrado (Keystore AES-256)", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            val ok = viewModel.addNote(newTitle, newContent, selectedCategory, isEncrypted = false)
                            if (ok) {
                                newTitle = ""
                                newContent = ""
                                showCreateDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7F1D1D), contentColor = Color.White),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().testTag("btn_save_insecure_dialog")
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("2. Guardar Inseguro en SD (Texto Plano)", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("Cancelar", color = TextSecondary)
                }
            },
            containerColor = DarkSurface
        )
    }

    // Modal de Detalle de Nota
    selectedNoteForDetail?.let { note ->
        var revealPlaintext by remember { mutableStateOf(true) }
        AlertDialog(
            onDismissRequest = { selectedNoteForDetail = null },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(note.title, fontWeight = FontWeight.Bold, color = TextPrimary)
                    IconButton(onClick = { revealPlaintext = !revealPlaintext }) {
                        Icon(
                            if (revealPlaintext) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle Visibility",
                            tint = LimeAccent
                        )
                    }
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Contenido:", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Surface(
                        color = DarkBackground,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            if (revealPlaintext) note.content else "••••••••••••••••••••••••••",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = GreenLight,
                            modifier = Modifier.padding(10.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Detalles Criptográficos en Disco:", style = MaterialTheme.typography.labelSmall, color = LimeAccent)

                    Text("Clave Cifrada (AES-256 SIV):", fontSize = 10.sp, color = TextSecondary)
                    Surface(
                        color = DarkBackground,
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            note.encryptedKeyCipher,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = TextPrimary,
                            modifier = Modifier.padding(6.dp)
                        )
                    }

                    Text("Valor Cifrado (AES-256 GCM):", fontSize = 10.sp, color = TextSecondary)
                    Surface(
                        color = DarkBackground,
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            note.encryptedValueCipher,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = TextPrimary,
                            modifier = Modifier.padding(6.dp)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(note.content))
                            }
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Copiar Secreto", fontSize = 11.sp, color = LimeAccent)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { selectedNoteForDetail = null },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenLight, contentColor = DarkBackground)
                ) {
                    Text("Cerrar")
                }
            },
            containerColor = DarkSurface
        )
    }
}
