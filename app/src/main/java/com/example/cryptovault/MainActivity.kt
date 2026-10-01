package com.example.cryptovault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.cryptovault.ui.screens.*
import com.example.cryptovault.ui.theme.*
import com.example.cryptovault.viewmodel.NavTab
import com.example.cryptovault.viewmodel.SecurityViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidSecurityTheme {
                val viewModel: SecurityViewModel = viewModel()
                SecurityApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityApp(
    viewModel: SecurityViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    // Intercept back button to return to Vault if elsewhere
    BackHandler(enabled = uiState.activeTab != NavTab.VAULT) {
        viewModel.setTab(NavTab.VAULT)
    }

    LaunchedEffect(uiState.toastMessage) {
        uiState.toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearToast()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = DarkGreen,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = GreenLight,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "Punto 4: Seguridad & Cifrado",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = LimeAccent
                                ) {
                                    Text(
                                        "AES-256",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = DarkBackground,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                "EncryptedSharedPreferences vs Almacenamiento Externo",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                ),
                modifier = Modifier.testTag("main_top_app_bar")
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = DarkSurface,
                tonalElevation = 4.dp,
                modifier = Modifier.testTag("main_navigation_bar")
            ) {
                val items = listOf(
                    Triple(NavTab.VAULT, Icons.Default.PhoneAndroid, "Bóveda"),
                    Triple(NavTab.EXPLORER, Icons.Default.FolderOpen, "Explorer"),
                    Triple(NavTab.ADB, Icons.Default.Terminal, "ADB"),
                    Triple(NavTab.ARCHITECTURE, Icons.Default.AccountTree, "Cripto"),
                    Triple(NavTab.CODE, Icons.Default.Code, "Código"),
                    Triple(NavTab.STEPS, Icons.Default.FormatListNumbered, "Guía")
                )

                items.forEach { (tab, icon, label) ->
                    val isSelected = uiState.activeTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.setTab(tab) },
                        icon = {
                            BadgedBox(
                                badge = {
                                    if (tab.badge != null) {
                                        Badge(
                                            containerColor = GreenLight,
                                            contentColor = DarkBackground
                                        ) {
                                            Text(tab.badge, fontSize = 9.sp)
                                        }
                                    }
                                }
                            ) {
                                Icon(icon, contentDescription = label)
                            }
                        },
                        label = { Text(label, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DarkBackground,
                            selectedTextColor = GreenLight,
                            indicatorColor = GreenLight,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        ),
                        modifier = Modifier.testTag("nav_item_${label.lowercase()}")
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (uiState.activeTab) {
                NavTab.VAULT -> VaultScreen(uiState = uiState, viewModel = viewModel)
                NavTab.EXPLORER -> DeviceFileExplorerScreen(uiState = uiState)
                NavTab.ADB -> AdbTerminalScreen(uiState = uiState, viewModel = viewModel)
                NavTab.ARCHITECTURE -> CryptoArchitectureScreen()
                NavTab.CODE -> SourceCodeViewerScreen()
                NavTab.REPORT -> ReadmeReportScreen()
                NavTab.STEPS -> StepsWizardScreen(uiState = uiState, viewModel = viewModel)
            }
        }
    }
}
