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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.NavTab
import com.example.cryptovault.viewmodel.SecurityUiState
import com.example.cryptovault.viewmodel.SecurityViewModel

data class WizardStep(
    val stepNumber: Int,
    val title: String,
    val description: String,
    val targetTab: NavTab,
    val actionText: String
)

@Composable
fun StepsWizardScreen(
    uiState: SecurityUiState,
    viewModel: SecurityViewModel,
    modifier: Modifier = Modifier
) {
    val steps = listOf(
        WizardStep(
            stepNumber = 1,
            title = "Paso 1: Guardar Nota Cifrada vs Insegura",
            description = "Ingresa a la Bóveda Móvil y crea dos notas de prueba: una guardada con AES-256 (Keystore) y otra guardada de forma insegura en almacenamiento externo.",
            targetTab = NavTab.VAULT,
            actionText = "Ir a Bóveda Móvil"
        ),
        WizardStep(
            stepNumber = 2,
            title = "Paso 2: Inspeccionar con Device File Explorer",
            description = "Explora el sistema de archivos de Android. Observa cómo el archivo XML privado solo contiene ciphertext ilegible mientras el archivo en la SD muestra los secretos en texto claro.",
            targetTab = NavTab.EXPLORER,
            actionText = "Abrir Device Explorer"
        ),
        WizardStep(
            stepNumber = 3,
            title = "Paso 3: Auditoría Forense con ADB Terminal",
            description = "Ejecuta 'adb shell cat' y 'adb pull' para comprobar que el archivo en la SD es extraíble directamente, mientras que el sandbox privado requiere permisos de aplicación.",
            targetTab = NavTab.ADB,
            actionText = "Abrir Terminal ADB"
        ),
        WizardStep(
            stepNumber = 4,
            title = "Paso 4: Análisis de Arquitectura Criptográfica",
            description = "Revisa el diagrama interactivo de 2 niveles: MasterKey en Android Keystore (TEE/StrongBox) y cifrado híbrido AES-256 SIV + GCM.",
            targetTab = NavTab.ARCHITECTURE,
            actionText = "Ver Arquitectura"
        ),
        WizardStep(
            stepNumber = 5,
            title = "Paso 5: Revisión de Código e Informe Final",
            description = "Inspecciona la implementación real en SecurityStorageManager.kt y revisa el informe técnico de conclusiones para el Punto 4.",
            targetTab = NavTab.REPORT,
            actionText = "Ver Informe Técnico"
        )
    )

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
                    Icon(Icons.Default.Checklist, contentDescription = null, tint = GreenLight, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Guía Interactiva de Laboratorio", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                        Text("5 Pasos Prácticos de Demostración (Taller 3)", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }
            }

            // Barra de Progreso
            item {
                LinearProgressIndicator(
                    progress = { uiState.currentStep / 5f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                    color = GreenLight,
                    trackColor = DarkCard
                )
            }

            items(steps.size) { index ->
                val step = steps[index]
                val isCurrent = uiState.currentStep == step.stepNumber
                val isCompleted = uiState.currentStep > step.stepNumber

                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (isCurrent) DarkCard else DarkSurface
                    ),
                    shape = RoundedCornerShape(14.dp),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (isCurrent) GreenLight else if (isCompleted) DarkGreen else DarkCard
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isCompleted || isCurrent) DarkGreen else DarkCard),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isCompleted) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = GreenLight, modifier = Modifier.size(16.dp))
                                    } else {
                                        Text("${step.stepNumber}", color = if (isCurrent) GreenLight else TextSecondary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(step.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                            }
                        }

                        Text(step.description, fontSize = 12.sp, color = TextSecondary, lineHeight = 17.sp)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Button(
                                onClick = {
                                    viewModel.setStep(step.stepNumber)
                                    viewModel.setTab(step.targetTab)
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isCurrent) GreenLight else DarkCard,
                                    contentColor = if (isCurrent) DarkBackground else TextPrimary
                                ),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(step.actionText, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            if (!isCompleted && uiState.currentStep == step.stepNumber && step.stepNumber < 5) {
                                OutlinedButton(
                                    onClick = { viewModel.setStep(step.stepNumber + 1) },
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Siguiente", fontSize = 11.sp, color = LimeAccent)
                                }
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
