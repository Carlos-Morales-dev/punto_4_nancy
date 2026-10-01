// Simulation of Android Jetpack Security (Tink library) cryptographic artifacts
// EncryptedSharedPreferences uses:
// - AES256_SIV for keys (Deterministic AEAD: same key produces same ciphertext in XML to allow key lookup)
// - AES256_GCM for values (Authenticated Encryption with Associated Data: includes 12-byte IV + ciphertext + 16-byte GCM tag)

export function fakeBase64(str: string, salt: string = 'enc'): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = 'AR' + Math.abs(hash).toString(36).toUpperCase();
  for (let i = 0; i < 28; i++) {
    const idx = Math.abs((hash * 31 + i * 17 + salt.charCodeAt(i % salt.length)) % chars.length);
    result += chars[idx];
  }
  return result + '==';
}

export function generateEncryptedKey(rawKey: string): string {
  return fakeBase64(rawKey, 'siv_key_determinism');
}

export function generateEncryptedValue(rawValue: string): string {
  return fakeBase64(rawValue, 'gcm_authenticated_payload');
}

export function generateHexDump(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const lines: string[] = [];
  const chunkSize = 16;
  for (let i = 0; i < bytes.length && i < 256; i += chunkSize) {
    const offset = i.toString(16).padStart(8, '0');
    const chunk = bytes.slice(i, i + chunkSize);
    
    // Hex representations
    const hexParts: string[] = [];
    for (let j = 0; j < chunkSize; j++) {
      if (j < chunk.length) {
        hexParts.push(chunk[j].toString(16).padStart(2, '0'));
      } else {
        hexParts.push('  ');
      }
    }
    const hex1 = hexParts.slice(0, 8).join(' ');
    const hex2 = hexParts.slice(8).join(' ');

    // ASCII representation
    let ascii = '';
    for (let j = 0; j < chunk.length; j++) {
      const byte = chunk[j];
      ascii += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
    }
    lines.push(`${offset}  ${hex1}  ${hex2}  |${ascii}|`);
  }
  if (bytes.length > 256) {
    lines.push(`... (${bytes.length - 256} bytes más no mostrados)`);
  }
  return lines.join('\n');
}

export function generateEncryptedPrefsXml(notes: Array<{ id: string; title: string; content: string; encryptedKeyCipher: string; encryptedValueCipher: string }>): string {
  let xml = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n`;
  xml += `<map>\n`;
  xml += `    <!-- Android Jetpack Security: androidx.security.crypto.EncryptedSharedPreferences -->\n`;
  xml += `    <!-- Claves cifradas con AES-256-SIV (determinístico) -->\n`;
  xml += `    <!-- Valores cifrados con AES-256-GCM (AEAD con IV y Tag) -->\n`;
  xml += `    <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQo...AndroidKeystoreMasterKeyRef...AA=</string>\n`;
  xml += `    <string name="__androidx_security_crypto_encrypted_prefs_value_keyset__">BQw...KeysetValuePayloadEncrypted...AQ==</string>\n`;
  notes.forEach((note) => {
    xml += `    <string name="${note.encryptedKeyCipher}">${note.encryptedValueCipher}</string>\n`;
  });
  xml += `</map>`;
  return xml;
}

export function generateExternalFileContent(notes: Array<{ id: string; title: string; content: string; timestamp: string; category: string }>): string {
  let text = `=======================================================\n`;
  text += `ALMACENAMIENTO EXTERNO INSEGURO (/sdcard/Download)\n`;
  text += `ARCHIVO: secret_note_insecure.txt\n`;
  text += `ADVERTENCIA: Archivo almacenado SIN CIFRAR en texto plano\n`;
  text += `Cualquier aplicación con permiso de lectura o acceso ADB puede leer este contenido.\n`;
  text += `=======================================================\n\n`;
  if (notes.length === 0) {
    text += `(No hay notas guardadas actualmente en almacenamiento externo)\n`;
  } else {
    notes.forEach((n, idx) => {
      text += `[NOTA #${idx + 1}] - ID: ${n.id}\n`;
      text += `FECHA: ${n.timestamp}\n`;
      text += `CATEGORÍA: ${n.category.toUpperCase()}\n`;
      text += `TÍTULO: ${n.title}\n`;
      text += `CONTENIDO CONFIDENCIAL:\n${n.content}\n`;
      text += `-------------------------------------------------------\n\n`;
    });
  }
  return text;
}
