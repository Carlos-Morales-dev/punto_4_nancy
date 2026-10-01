import React, { useState } from 'react';
import { ConfidentialNote } from '../types';
import {
  generateEncryptedPrefsXml,
  generateExternalFileContent,
  generateHexDump,
} from '../utils/cryptoSim';
import {
  Folder,
  FolderOpen,
  FileText,
  Lock,
  AlertTriangle,
  HardDrive,
  Copy,
  Check,
  Download,
  Info,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
} from 'lucide-react';

interface DeviceFileExplorerProps {
  notes: ConfidentialNote[];
}

export const DeviceFileExplorer: React.FC<DeviceFileExplorerProps> = ({ notes }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('enc_xml');
  const [activeViewTab, setActiveViewTab] = useState<'text' | 'hex' | 'security'>('text');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    data: true,
    data_data: true,
    app_pkg: true,
    shared_prefs: true,
    sdcard: true,
    download: true,
    storage: true,
    emulated: true,
    emulated_0: true,
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const encryptedNotes = notes.filter((n) => n.isEncryptedStored);
  const externalNotes = notes.filter((n) => n.isExternalStored);

  const encryptedXmlContent = generateEncryptedPrefsXml(encryptedNotes);
  const externalTxtContent = generateExternalFileContent(externalNotes);

  const filesRegistry: Record<string, { name: string; path: string; content: string; isEncrypted: boolean; size: string; permissions: string; owner: string; group: string }> = {
    enc_xml: {
      name: 'secret_notes_encrypted.xml',
      path: '/data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml',
      content: encryptedXmlContent,
      isEncrypted: true,
      size: `${new TextEncoder().encode(encryptedXmlContent).length} B`,
      permissions: '-rw-rw----',
      owner: 'u0_a145',
      group: 'u0_a145',
    },
    insecure_txt: {
      name: 'secret_note_insecure.txt',
      path: '/sdcard/Download/secret_note_insecure.txt',
      content: externalTxtContent,
      isEncrypted: false,
      size: `${new TextEncoder().encode(externalTxtContent).length} B`,
      permissions: '-rw-rw----',
      owner: 'root',
      group: 'everybody',
    },
  };

  const currentFile = filesRegistry[selectedFileId] || filesRegistry['enc_xml'];
  const currentHex = generateHexDump(currentFile.content);

  const handleCopy = (contentToCopy: string) => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111827] border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-md flex flex-col h-[760px]">
      {/* Top Device Bar */}
      <div className="bg-[#1F2937] px-5 py-3 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#153422] border border-[#42D674]/50 flex items-center justify-center text-[#42D674] shadow-xs">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">Device File Explorer (Punto 4.3)</h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Android Virtual Device Storage Inspector</p>
          </div>
          <span className="text-gray-500 font-mono">|</span>
          <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px] bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
            <span className="w-2 h-2 rounded-full bg-[#42D674] inline-block animate-pulse"></span>
            <span>Pixel_7_Pro_API_34 (Emulator:5554)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-gray-200 w-36 focus:w-48 transition-all focus:outline-none focus:border-[#42D674]"
            />
          </div>
          <button
            title="Refrescar árbol"
            className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-800">
        {/* Left Panel: Android Filesystem Tree */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#111827] overflow-hidden">
          <div className="px-4 py-2 bg-[#1A2234] border-b border-gray-800 text-[11px] text-[#80EF80] font-bold flex justify-between items-center">
            <span>Sistema de Archivos del Dispositivo</span>
            <span className="text-[10px] text-gray-400 font-mono">Linux 6.1-android</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 font-mono text-xs space-y-1 select-none">
            {/* Folder: data */}
            <div>
              <div
                onClick={() => toggleFolder('data')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-gray-200"
              >
                {expandedFolders.data ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {expandedFolders.data ? <FolderOpen className="w-3.5 h-3.5 text-[#BADBA2]" /> : <Folder className="w-3.5 h-3.5 text-[#BADBA2]" />}
                <span>data</span>
                <span className="text-[9px] text-gray-500 ml-auto">drwxrwx--x</span>
              </div>

              {expandedFolders.data && (
                <div className="ml-4 pl-1.5 border-l border-gray-800 space-y-0.5">
                  {/* Folder: data/data */}
                  <div
                    onClick={() => toggleFolder('data_data')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-gray-200"
                  >
                    {expandedFolders.data_data ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {expandedFolders.data_data ? <FolderOpen className="w-3.5 h-3.5 text-[#BADBA2]" /> : <Folder className="w-3.5 h-3.5 text-[#BADBA2]" />}
                    <span>data (interno privado)</span>
                  </div>

                  {expandedFolders.data_data && (
                    <div className="ml-4 pl-1.5 border-l border-gray-800 space-y-0.5">
                      {/* App package folder */}
                      <div
                        onClick={() => toggleFolder('app_pkg')}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-[#80EF80] font-semibold"
                      >
                        {expandedFolders.app_pkg ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {expandedFolders.app_pkg ? <FolderOpen className="w-3.5 h-3.5 text-[#80EF80]" /> : <Folder className="w-3.5 h-3.5 text-[#80EF80]" />}
                        <span>com.security.securenotes</span>
                        <Lock className="w-2.5 h-2.5 ml-1 text-[#80EF80]" />
                      </div>

                      {expandedFolders.app_pkg && (
                        <div className="ml-4 pl-1.5 border-l border-[#BADBA2]/40 space-y-0.5">
                          {/* shared_prefs */}
                          <div
                            onClick={() => toggleFolder('shared_prefs')}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300"
                          >
                            {expandedFolders.shared_prefs ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {expandedFolders.shared_prefs ? <FolderOpen className="w-3.5 h-3.5 text-[#BADBA2]" /> : <Folder className="w-3.5 h-3.5 text-[#BADBA2]" />}
                            <span>shared_prefs</span>
                          </div>

                          {expandedFolders.shared_prefs && (
                            <div className="ml-4 pl-1.5 border-l border-gray-800 space-y-0.5">
                              {/* File 1: secret_notes_encrypted.xml */}
                              <div
                                onClick={() => setSelectedFileId('enc_xml')}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                                  selectedFileId === 'enc_xml'
                                    ? 'bg-[#153422] text-[#80EF80] border border-[#42D674] font-bold shadow-xs'
                                    : 'text-gray-300 hover:bg-gray-800'
                                }`}
                              >
                                <Lock className="w-3 h-3 shrink-0 text-[#80EF80]" />
                                <span className="truncate">secret_notes_encrypted.xml</span>
                                <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded-full bg-[#E3F0A3] text-gray-900 font-mono font-bold">
                                  AES-256
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500">
                            <Folder className="w-3.5 h-3.5 text-gray-600" />
                            <span>databases</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500">
                            <Folder className="w-3.5 h-3.5 text-gray-600" />
                            <span>cache</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Folder: sdcard */}
            <div className="pt-2">
              <div
                onClick={() => toggleFolder('sdcard')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-amber-400 hover:text-amber-300 font-semibold"
              >
                {expandedFolders.sdcard ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {expandedFolders.sdcard ? <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> : <Folder className="w-3.5 h-3.5 text-amber-400" />}
                <span>sdcard (/storage/emulated/0)</span>
                <AlertTriangle className="w-3 h-3 ml-1 text-amber-400" />
              </div>

              {expandedFolders.sdcard && (
                <div className="ml-4 pl-1.5 border-l border-amber-900/60 space-y-0.5">
                  <div
                    onClick={() => toggleFolder('download')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300"
                  >
                    {expandedFolders.download ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {expandedFolders.download ? <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> : <Folder className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Download</span>
                  </div>

                  {expandedFolders.download && (
                    <div className="ml-4 pl-1.5 border-l border-gray-800 space-y-0.5">
                      {/* File: secret_note_insecure.txt */}
                      <div
                        onClick={() => setSelectedFileId('insecure_txt')}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                          selectedFileId === 'insecure_txt'
                            ? 'bg-amber-950/60 text-amber-200 border border-amber-700/80 font-bold shadow-xs'
                            : 'text-amber-400 hover:bg-gray-800'
                        }`}
                      >
                        <FileText className="w-3 h-3 shrink-0 text-amber-400" />
                        <span className="truncate">secret_note_insecure.txt</span>
                        <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded-full bg-amber-900/80 text-amber-300 font-mono">
                          TEXTO PLANO
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500">
                    <Folder className="w-3.5 h-3.5 text-gray-600" />
                    <span>DCIM</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-gray-500">
                    <Folder className="w-3.5 h-3.5 text-gray-600" />
                    <span>Documents</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-[#1A2234] border-t border-gray-800 text-[11px] text-gray-400">
            <span className="text-[#80EF80] font-bold block mb-0.5">🔬 Inspección comparativa:</span>
            Contrasta el XML cifrado con el archivo en texto plano de la tarjeta SD.
          </div>
        </div>

        {/* Right Panel: File Preview */}
        <div className="flex-1 flex flex-col bg-[#0B0F19] overflow-hidden">
          {/* File Metadata Bar */}
          <div className="bg-[#1F2937] px-5 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              {currentFile.isEncrypted ? (
                <div className="p-2 rounded-lg bg-[#153422] border border-[#42D674] text-[#80EF80]">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-white font-mono">{currentFile.name}</h4>
                <p className="text-[10px] text-gray-400 font-mono">{currentFile.path}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                {currentFile.permissions}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                {currentFile.owner}:{currentFile.group}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                {currentFile.size}
              </span>
              <button
                onClick={() => handleCopy(currentFile.content)}
                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 border border-gray-700 cursor-pointer"
                title="Copiar contenido"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#42D674]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadFile}
                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 border border-gray-700 cursor-pointer"
                title="Descargar archivo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="bg-[#151D2A] px-5 py-2.5 border-b border-gray-800 flex gap-2 text-xs">
            <button
              onClick={() => setActiveViewTab('text')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeViewTab === 'text'
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Vista de Texto (Raw)
            </button>
            <button
              onClick={() => setActiveViewTab('hex')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeViewTab === 'hex'
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Visor Hexadecimal (Hex Dump)
            </button>
            <button
              onClick={() => setActiveViewTab('security')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewTab === 'security'
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Diagnóstico de Seguridad
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-5 font-mono text-xs">
            {activeViewTab === 'text' && (
              <pre className="text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-[#42D674] selection:text-white">
                {currentFile.content}
              </pre>
            )}
            {activeViewTab === 'hex' && (
              <pre className="text-[#80EF80] font-mono text-[11px] leading-relaxed whitespace-pre selection:bg-[#153422]">
                {currentHex}
              </pre>
            )}
            {activeViewTab === 'security' && (
              <div className="space-y-4 font-sans text-xs text-gray-300">
                {currentFile.isEncrypted ? (
                  <div className="bg-[#153422] border border-[#42D674]/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#80EF80] font-bold text-sm">
                      <Lock className="w-4 h-4" />
                      ALMACENAMIENTO SEGURO: EncryptedSharedPreferences (AES-256)
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      Este archivo reside en el <strong>almacenamiento interno privado</strong> (<code className="text-[#80EF80] font-mono">/data/data/com.security.securenotes/</code>).
                      A nivel de Linux, los permisos <code className="text-[#80EF80] font-mono">-rw-rw----</code> restringen el acceso exclusivamente al UID de la app.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-[#0B0F19] p-3.5 rounded-lg border border-gray-800">
                        <span className="text-[#80EF80] font-semibold text-xs block mb-1">Cifrado de Claves (Keys):</span>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Algoritmo <strong>AES256_SIV</strong> (RFC 5297). Cifrado determinístico que impide revelar el nombre real de las preferencias pero permite indexar valores.
                        </p>
                      </div>
                      <div className="bg-[#0B0F19] p-3.5 rounded-lg border border-gray-800">
                        <span className="text-[#80EF80] font-semibold text-xs block mb-1">Cifrado de Valores (Values):</span>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Algoritmo <strong>AES256_GCM</strong> (AEAD). Integra vector de inicialización único (IV) y etiqueta de autenticación (Tag) que garantiza confidencialidad e integridad.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border border-amber-700/60 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      ALMACENAMIENTO VULNERABLE: Tarjeta SD / Directorio Público
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      Este archivo reside en el <strong>directorio público de descargas</strong> (<code className="text-amber-300 font-mono">/sdcard/Download/secret_note_insecure.txt</code>).
                      Cualquier app con permiso de almacenamiento o cualquier cable USB conectado puede leer este archivo sin barrera criptográfica.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
