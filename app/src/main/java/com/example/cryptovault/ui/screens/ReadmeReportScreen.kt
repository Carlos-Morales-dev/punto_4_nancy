package com.example.cryptovault.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.ui.theme.*

@Composable
fun ReadmeReportScreen(modifier: Modifier = Modifier) {
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Description, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Informe Técnico Oficial: Punto 4", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text("Taller 3 - Persistencia y Seguridad en Android", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("1. Introducción y Justificación", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 13.sp)
                        Text(
                            "El presente laboratorio implementa y audita el Punto 4 del Taller 3 sobre seguridad en almacenamiento Android. Compara de forma empírica la protección robusta de EncryptedSharedPreferences (Jetpack Security) frente a la vulnerabilidad crítica del almacenamiento externo en texto claro.",
                            fontSize = 12.sp,
                            color = TextPrimary,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("2. Mecanismo de Cifrado en Hardware", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 13.sp)
                        Text(
                            "Android Keystore almacena la MasterKey en el enclave de ejecución confiable (TEE / StrongBox). La llave maestra nunca se expone a la memoria accesible por el sistema operativo ni por otras aplicaciones.",
                            fontSize = 12.sp,
                            color = TextPrimary,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("3. Resultados de la Auditoría Forense ADB", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 13.sp)
                        Text(
                            "• Almacenamiento Externo: Mediante 'adb shell cat /sdcard/Download/secret_note_insecure.txt' o 'adb pull' cualquier atacante puede extraer PINs y tokens sin autenticación.\n\n" +
                            "• Almacenamiento Cifrado: El acceso directo a /data/data/ está bloqueado por el Sandbox. Al inspeccionar con run-as, solo se observan hashes SIV y ciphers GCM indescifrables.",
                            fontSize = 12.sp,
                            color = TextPrimary,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("4. Conclusiones y Cumplimiento OWASP Mobile", fontWeight = FontWeight.Bold, color = LimeAccent, fontSize = 13.sp)
                        Text(
                            "Nunca deben persistirse credenciales, tokens o información médica en directorios públicos o en SharedPreferences estándar sin cifrar. EncryptedSharedPreferences mitiga el riesgo OWASP M2 (Insecure Data Storage) cumpliendo con los estándares de seguridad de Android modernos.",
                            fontSize = 12.sp,
                            color = TextPrimary,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}
