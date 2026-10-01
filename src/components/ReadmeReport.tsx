import React, { useState } from 'react';
import { README_CONTENT } from '../data/androidProjectSource';
import { Copy, Check, Download, Eye, Code, BookOpen } from 'lucide-react';

export const ReadmeReport: React.FC = () => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(README_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([README_CONTENT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[760px]">
      {/* Header */}
      <div className="bg-[#FAFDF9] px-5 py-3 border-b border-[#BADBA2]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#42D674]" />
          <span className="font-bold text-gray-900 text-sm">
            Informe Técnico de Laboratorio (README.md - Punto 4.4)
          </span>
          <span className="text-gray-400 font-mono">|</span>
          <span className="text-[11px] text-gray-600 font-medium font-mono">Inspección Forense y Cifrado</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-300 flex">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Informe Formateado</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Markdown (.md)</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition-colors border border-gray-300 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#42D674]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar README'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-[#42D674] hover:bg-[#38b863] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Descargar README.md</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {viewMode === 'raw' ? (
          <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed selection:bg-[#80EF80]">
            {README_CONTENT}
          </pre>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 text-gray-700 text-sm leading-relaxed font-sans">
            {/* Title card */}
            <div className="border-b border-gray-200 pb-5">
              <span className="text-[#42D674] font-mono text-xs uppercase tracking-wider block mb-1 font-bold">
                Punto 4: Seguridad en el Almacenamiento Local y Cifrado
              </span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Informe Técnico: EncryptedSharedPreferences vs Almacenamiento Externo en SD
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span><strong>Mecanismo:</strong> Cifrado Local con MasterKey en Hardware</span>
                <span><strong>Plataforma:</strong> Android API 34 / Jetpack Security</span>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-l-4 border-[#42D674] pl-3">
                1. Resumen Ejecutivo y Objetivo
              </h2>
              <p>
                El presente informe técnico evalúa y contrasta de manera empírica la seguridad y confidencialidad en distintos medios de almacenamiento local en Android:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700 text-xs">
                <li>
                  <strong className="text-gray-900">Almacenamiento Interno Privado Cifrado:</strong> Implementado mediante <code className="bg-[#E3F0A3] text-gray-900 px-1.5 py-0.5 rounded font-mono font-semibold">EncryptedSharedPreferences</code> respaldado por una <code className="bg-[#E3F0A3] text-gray-900 px-1.5 py-0.5 rounded font-mono font-semibold">MasterKey</code> en hardware seguro (Android Keystore con enclave TEE / StrongBox).
                </li>
                <li>
                  <strong className="text-amber-700">Almacenamiento Externo Público Sin Cifrar:</strong> Implementado guardando copias en texto plano en la tarjeta SD o directorio público de descargas (<code className="bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono">/sdcard/Download/secret_note_insecure.txt</code>).
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-l-4 border-[#42D674] pl-3">
                2. Metodología de Implementación Criptográfica
              </h2>
              <p className="text-xs">
                Se utilizó la biblioteca oficial de Google <code className="text-[#42D674] font-mono font-bold">androidx.security:security-crypto</code>, la cual aplica un esquema de protección criptográfica en dos capas (2-Tier Architecture):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    AES-256 SIV (Cifrado de Claves)
                  </h3>
                  <p className="text-xs text-gray-600 leading-normal">
                    <strong>Synthetic Initialization Vector (RFC 5297):</strong> Proporciona cifrado determinista sobre las llaves del mapa. Permite que la aplicación busque si una clave existe sin necesidad de descifrar todos los valores del archivo XML en memoria.
                  </p>
                </div>
                <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    AES-256 GCM (Cifrado de Valores)
                  </h3>
                  <p className="text-xs text-gray-600 leading-normal">
                    <strong>Galois/Counter Mode (AEAD):</strong> Garantiza confidencialidad e integridad física. Cada valor almacenado incluye un vector de inicialización único de 96 bits y una etiqueta de autenticación de 128 bits. Si un atacante modifica un solo byte en disco, el descifrado falla de forma inmediata.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-l-4 border-[#42D674] pl-3">
                3. Pruebas Experimentales con Device File Explorer y ADB
              </h2>
              <div className="bg-[#FAFDF9] border border-amber-300 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-amber-800">Prueba 3.1: Extracción en Almacenamiento Externo / SD</h4>
                <p className="text-gray-700">
                  Al ejecutar comandos ADB hacia el emulador para inspeccionar el directorio público:
                </p>
                <div className="bg-gray-900 p-3 rounded-lg font-mono text-gray-100 space-y-1">
                  <div className="text-[#80EF80]">$ adb shell cat /sdcard/Download/secret_note_insecure.txt</div>
                  <div className="text-gray-500">-------------------------------------------------------</div>
                  <div className="text-amber-300">NOTA CONFIDENCIAL - COPIA SIN CIFRAR EN SD/EXTERNO</div>
                  <div className="text-gray-200">Título: Credenciales Bancarias</div>
                  <div className="text-gray-200">Contenido: Usuario: admin_2026 | Clave: SuperSecret#992! | PIN: 8841</div>
                </div>
                <p className="text-amber-800 text-xs font-medium">
                  <strong>Evidencia:</strong> Los datos sensibles fueron <strong>100% legibles de forma inmediata</strong>. Cualquier aplicación maliciosa o lector USB puede extraerlos sin necesidad de permisos de superusuario (root).
                </p>
              </div>

              <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-[#42D674]">Prueba 3.2: Inspección en Almacenamiento Interno Cifrado</h4>
                <p className="text-gray-700">
                  Al intentar leer el XML mediante el entorno protegido:
                </p>
                <div className="bg-gray-900 p-3 rounded-lg font-mono text-gray-100 space-y-1">
                  <div className="text-[#80EF80]">$ adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml</div>
                  <div className="text-gray-500">-------------------------------------------------------</div>
                  <div className="text-gray-300">&lt;map&gt;</div>
                  <div className="text-gray-400">&nbsp;&nbsp;&lt;string name=&quot;Ab4h...cifrado...&quot;&gt;AYn2...ciphertext...&lt;/string&gt;</div>
                  <div className="text-gray-300">&lt;/map&gt;</div>
                </div>
                <p className="text-gray-700 text-xs">
                  <strong>Evidencia:</strong> Tanto las claves XML como los valores son bloques criptográficos ininteligibles sin la clave privada custodiada en el chip de hardware Keystore.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
