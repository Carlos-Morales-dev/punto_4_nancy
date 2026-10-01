package com.example.cryptovault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.ui.theme.*

@Composable
fun CryptoArchitectureScreen(modifier: Modifier = Modifier) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                // Header
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Security, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Arquitectura Criptográfica Oficial", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text("Jetpack Security + Google Tink Library (Punto 4)", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
            }

            // Flujo en 4 pasos
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Flujo Criptográfico en 2 Niveles (2-Tier Architecture)", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 14.sp)

                        // Paso 1
                        Row(verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(DarkGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("1", color = GreenLight, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Android Keystore (Nivel Hardware TEE/StrongBox)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                                Text("Genera la MasterKey respaldada en silicio. La clave criptográfica maestra nunca sale del chip físico del teléfono.", fontSize = 11.sp, color = TextSecondary)
                            }
                        }

                        // Paso 2
                        Row(verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(DarkGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("2", color = GreenLight, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Protección de Keyset (KEK - Key Encryption Key)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                                Text("La MasterKey cifra el conjunto de subclaves de datos (Keyset) gestionado por Google Tink antes de guardarse en el XML.", fontSize = 11.sp, color = TextSecondary)
                            }
                        }

                        // Paso 3
                        Row(verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(DarkGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("3", color = GreenLight, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Cifrado Híbrido: AES-256 SIV + AES-256 GCM", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                                Text("• Claves (Nombres): Cifradas con AES-256 SIV (Determinístico para permitir lookups rápidos sin descifrar toda la base).\n• Valores (Contenido): Cifrados con AES-256 GCM (AEAD con IV aleatorio y Tag de autenticación para evitar manipulación).", fontSize = 11.sp, color = TextSecondary)
                            }
                        }

                        // Paso 4
                        Row(verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(DarkGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("4", color = GreenLight, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Almacenamiento en Sandbox Privado de Linux", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                                Text("El archivo XML se almacena en /data/data/<pkg>/shared_prefs con permisos UID 600 (-rw-------), impidiendo el acceso a otras aplicaciones.", fontSize = 11.sp, color = TextSecondary)
                            }
                        }
                    }
                }
            }

            // Comparativa de Seguridad
            item {
                Text("Tabla Comparativa de Seguridad (Punto 4)", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 14.sp)
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Criterio", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextSecondary, modifier = Modifier.weight(1.2f))
                            Text("EncryptedPrefs", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = GreenLight, modifier = Modifier.weight(1f))
                            Text("SD Externa", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = DangerRed, modifier = Modifier.weight(1f))
                        }

                        Divider(color = DarkCard)

                        val rows = listOf(
                            Triple("Algoritmo", "AES-256 (GCM/SIV)", "Ninguno (Texto plano)"),
                            Triple("Custodia Claves", "Android Keystore (Hardware)", "No aplica"),
                            Triple("Permisos SO", "Privado (UID App)", "Público (sdcard_rw)"),
                            Triple("Acceso ADB", "Requiere run-as / Root", "Lectura directa adb cat"),
                            Triple("Integridad", "Tag GCM antimanioulación", "Modificable por cualquier app"),
                            Triple("Cumplimiento OWASP", "M2 Cumplido Seguro", "Vulnerabilidad M2 Crítica")
                        )

                        rows.forEach { (criterio, seguro, inseguro) ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(criterio, fontSize = 11.sp, color = TextPrimary, modifier = Modifier.weight(1.2f))
                                Text(seguro, fontSize = 10.sp, color = GreenLight, fontFamily = FontFamily.Monospace, modifier = Modifier.weight(1f))
                                Text(inseguro, fontSize = 10.sp, color = DangerRed, fontFamily = FontFamily.Monospace, modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}
