package com.example.cryptovault.data.model

data class ConfidentialNote(
    val id: String,
    val title: String,
    val content: String,
    val category: SecretCategory,
    val timestamp: String,
    val isEncryptedStored: Boolean,
    val isExternalStored: Boolean,
    val encryptedKeyCipher: String,
    val encryptedValueCipher: String,
    val rawExternalContent: String
)
