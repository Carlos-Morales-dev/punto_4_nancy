package com.example.cryptovault.data.model

data class FileSystemItem(
    val id: String,
    val name: String,
    val path: String,
    val isDirectory: Boolean,
    val size: String = "4 KB",
    val permissions: String = "drwxr-xr-x",
    val owner: String = "root",
    val group: String = "root",
    val lastModified: String = "19:45",
    val isConfidential: Boolean = false,
    val content: String = "",
    val children: List<FileSystemItem> = emptyList()
)
