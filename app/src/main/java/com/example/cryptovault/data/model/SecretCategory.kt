package com.example.cryptovault.data.model

import androidx.compose.ui.graphics.Color

enum class SecretCategory(
    val id: String,
    val label: String,
    val badgeBgColor: Color,
    val badgeTextColor: Color
) {
    BANCARIO(
        "bancario",
        "Bancario & Financiero (PINs, Tarjetas)",
        Color(0xFF064E3B),
        Color(0xFF6EE7B7)
    ),
    CREDENCIALES(
        "credenciales",
        "Credenciales de Acceso (Usuario & Clave)",
        Color(0xFF1E3A8A),
        Color(0xFF93C5FD)
    ),
    API_TOKENS(
        "api_tokens",
        "API Keys & Tokens (AWS, Firebase, Cloud)",
        Color(0xFF78350F),
        Color(0xFFFCD34D)
    ),
    CRIPTO_WALLETS(
        "cripto_wallets",
        "Cripto & Wallets (Seed Phrase, Claves)",
        Color(0xFF581C87),
        Color(0xFFD8B4FE)
    ),
    DOBLE_FACTOR(
        "doble_factor",
        "Respaldo 2FA & OTP (Códigos de Respaldo)",
        Color(0xFF164E63),
        Color(0xFF67E8F9)
    ),
    IDENTIDAD(
        "identidad",
        "Identidad & Documentos (Cédula, Pasaporte)",
        Color(0xFF312E81),
        Color(0xFFA5B4FC)
    ),
    MEDICO(
        "medico",
        "Médico & Salud (Historial, Medicación)",
        Color(0xFF881337),
        Color(0xFFFDA4AF)
    ),
    EMPRESA(
        "empresa",
        "Corporativo & Negocios (Servidores, VPN)",
        Color(0xFF1E293B),
        Color(0xFFCBD5E1)
    ),
    WIFI_REDES(
        "wifi_redes",
        "Redes & Wi-Fi (Claves WPA3, Routers)",
        Color(0xFF134E4A),
        Color(0xFF5EEAD4)
    ),
    PERSONAL(
        "personal",
        "Personal & Privado (Notas confidenciales)",
        Color(0xFF27272A),
        Color(0xFFD4D4D8)
    );

    companion object {
        fun fromId(id: String): SecretCategory {
            return entries.find { it.id.equals(id, ignoreCase = true) } ?: PERSONAL
        }
    }
}
