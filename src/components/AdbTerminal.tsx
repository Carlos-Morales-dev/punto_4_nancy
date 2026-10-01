import React, { useState, useRef, useEffect } from 'react';
import { ConfidentialNote } from '../types';
import { generateEncryptedPrefsXml, generateExternalFileContent } from '../utils/cryptoSim';
import { Terminal, Play, Trash2, Copy, Check, Sparkles } from 'lucide-react';

interface AdbTerminalProps {
  notes: ConfidentialNote[];
}

interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
  timestamp: string;
}

export const AdbTerminal: React.FC<AdbTerminalProps> = ({ notes }) => {
  const [inputCommand, setInputCommand] = useState('');
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'Android Debug Bridge (ADB) v1.0.41 - Auditoría Forense de Seguridad (Punto 4)\nConectado a emulador: emulator-5554 (Android 14 API 34 x86_64)',
      timestamp: '19:40:00',
    },
    {
      id: 'init-2',
      type: 'output',
      text: 'Escribe un comando o haz clic en los botones de prueba rápida para inspeccionar el almacenamiento.',
      timestamp: '19:40:01',
    },
  ]);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const encryptedNotes = notes.filter((n) => n.isEncryptedStored);
  const externalNotes = notes.filter((n) => n.isExternalStored);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString('es-CO');
    const newLogs: TerminalLog[] = [
      ...logs,
      {
        id: `input-${Date.now()}`,
        type: 'input',
        text: `analyst@workstation:~$ ${trimmed}`,
        timestamp: time,
      },
    ];

    const lower = trimmed.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setLogs([]);
      setInputCommand('');
      return;
    }

    if (lower === 'help') {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'info',
        text: `Comandos sugeridos para la auditoría forense del Punto 4:
  adb devices                                                      -> Listar emuladores conectados
  adb shell ls -la /sdcard/Download/                               -> Listar almacenamiento externo (Permisos globales)
  adb shell cat /sdcard/Download/secret_note_insecure.txt           -> Leer archivo inseguro (Texto claro vulnerable)
  adb pull /sdcard/Download/secret_note_insecure.txt               -> Extraer nota externa a la máquina local
  adb shell cat /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml -> Bloqueo Sandbox
  adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml    -> Leer XML Cifrado
  clear                                                            -> Limpiar pantalla`,
        timestamp: time,
      });
    } else if (lower.includes('adb devices')) {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `List of devices attached\nemulator-5554\tdevice product:sdk_gphone64_x86_64 model:Pixel_7_Pro device:emu64xa transport_id:1`,
        timestamp: time,
      });
    } else if (lower.includes('ls') && lower.includes('/sdcard')) {
      const extContent = generateExternalFileContent(externalNotes);
      const size = extContent.length;
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `total 16\ndrwxrwx--x 3 root     everybody 4096 2026-09-30 19:40 .\ndrwxrwx--x 4 root     everybody 4096 2026-09-30 19:35 ..\n-rw-rw---- 1 u0_a145  everybody  ${size} 2026-09-30 19:42 secret_note_insecure.txt\n\n[ANÁLISIS]: El grupo 'everybody' (sdcard_rw) permite que cualquier aplicación con READ_EXTERNAL_STORAGE lea este archivo sin restricción.`,
        timestamp: time,
      });
    } else if (lower.includes('cat') && lower.includes('secret_note_insecure.txt')) {
      const extContent = generateExternalFileContent(externalNotes);
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'error',
        text: `[SALIDA DEL ARCHIVO EN TARJETA SD - TEXTO PLANO EXPUESTO]:\n${extContent}\n\n[ALERTA FORENSE]: Los datos están completamente expuestos sin ninguna capa de cifrado. Cualquier spyware o malware en el teléfono puede leerlos.`,
        timestamp: time,
      });
    } else if (lower.includes('pull') && lower.includes('secret_note_insecure.txt')) {
      const extContent = generateExternalFileContent(externalNotes);
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'success',
        text: `/sdcard/Download/secret_note_insecure.txt: 1 file pulled, 0 skipped. 0.1 MB/s (${extContent.length} bytes in 0.001s)\nArchivo descargado exitosamente a la máquina local del atacante en ./insecure_dump.txt`,
        timestamp: time,
      });
    } else if (lower.includes('cat') && lower.includes('/data/data') && !lower.includes('run-as')) {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'error',
        text: `/system/bin/sh: cat: /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml: Permission denied\n\n[ANÁLISIS]: El sandbox a nivel de kernel Linux impide el acceso no autorizado a los datos privados entre aplicaciones sin root.`,
        timestamp: time,
      });
    } else if (lower.includes('run-as') || (lower.includes('cat') && lower.includes('shared_prefs/secret_notes_encrypted.xml'))) {
      const xml = generateEncryptedPrefsXml(encryptedNotes);
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'info',
        text: `[SALIDA DEL COMANDO RUN-AS - USUARIO u0_a145]:\n${xml}\n\n[ANÁLISIS DE SEGURIDAD]: Aunque accedas al archivo con permisos del paquete, los datos están CIFRADOS con AES-256-GCM y AES-256-SIV. La información es ininteligible sin la MasterKey del Keystore.`,
        timestamp: time,
      });
    } else if (lower.includes('pull') && lower.includes('/data/data/')) {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'error',
        text: `adb: error: failed to copy '/data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml' to './': remote open failed: Permission denied\n(El sandbox de Android impide el adb pull directo de /data/data en dispositivos no rooteados)`,
        timestamp: time,
      });
    } else {
      newLogs.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `Comando simulado: '${trimmed}' ejecutado en Pixel_7_Pro_API_34.\n(Tip: Utiliza 'help' o los botones rápidos para ver los comandos de auditoría).`,
        timestamp: time,
      });
    }

    setLogs(newLogs);
    setInputCommand('');
  };

  const handlePresetClick = (cmd: string) => {
    executeCommand(cmd);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `${l.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const QUICK_COMMANDS = [
    {
      label: '1. Ver dispositivos',
      cmd: 'adb devices',
      desc: 'Comprueba la conexión con el emulador Android',
      category: 'basic',
    },
    {
      label: '2. Listar SD (/sdcard)',
      cmd: 'adb shell ls -la /sdcard/Download/',
      desc: 'Muestra permisos y grupo everybody en la tarjeta',
      category: 'external',
    },
    {
      label: '3. Cat nota insegura (SD)',
      cmd: 'adb shell cat /sdcard/Download/secret_note_insecure.txt',
      desc: 'Evidencia la fuga de datos en texto claro',
      category: 'external',
    },
    {
      label: '4. Extraer nota SD (Pull)',
      cmd: 'adb pull /sdcard/Download/secret_note_insecure.txt ./insecure_dump.txt',
      desc: 'Descarga el archivo no cifrado a la computadora',
      category: 'external',
    },
    {
      label: '5. Cat directo a /data/data',
      cmd: 'adb shell cat /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml',
      desc: 'Comprueba el bloqueo de permisos de Linux (Permission denied)',
      category: 'internal',
    },
    {
      label: '6. Cat con run-as (Cifrado)',
      cmd: 'adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml',
      desc: 'Inspecciona el XML con privilegios y verifica el cifrado AES-256',
      category: 'internal',
    },
  ];

  return (
    <div className="bg-[#111827] border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-md flex flex-col h-[760px]">
      {/* Terminal Title Bar */}
      <div className="bg-[#1F2937] px-5 py-3 border-b border-gray-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-[#42D674]"></div>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-wide">
            <Terminal className="w-4 h-4 text-[#80EF80]" />
            <span>Terminal ADB — Inspección Forense (Punto 4.3)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors border border-gray-700 cursor-pointer"
            title="Copiar log de consola"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#42D674]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Salida</span>
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700 cursor-pointer"
            title="Limpiar terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Commands Bar */}
      <div className="bg-[#151D2A] px-5 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#80EF80] flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#42D674]" />
            Acciones Rápidas (Un solo clic para ejecutar):
          </span>
          <span className="text-[10px] text-gray-400 font-mono">Consola Interactiva</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(item.cmd)}
              className={`p-2.5 rounded-xl border text-left text-[10px] font-mono transition-all flex flex-col justify-between cursor-pointer ${
                item.category === 'internal'
                  ? 'bg-gray-900 border-[#BADBA2]/50 hover:border-[#42D674] text-[#80EF80]'
                  : item.category === 'external'
                  ? 'bg-amber-950/30 border-amber-800/60 hover:border-amber-400 text-amber-300'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 text-gray-200'
              }`}
              title={item.desc}
            >
              <span className="font-bold truncate">{item.label}</span>
              <span className="text-[9px] opacity-75 truncate mt-1">{item.cmd.split(' ')[1] || item.cmd}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 bg-[#0B0F19] p-5 overflow-y-auto font-mono text-xs space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed">
            {log.type === 'input' && (
              <div className="text-[#80EF80] font-bold flex items-center gap-1">
                <span>{log.text}</span>
              </div>
            )}
            {log.type === 'output' && (
              <pre className="text-gray-300 whitespace-pre-wrap pl-3 border-l-2 border-gray-800">
                {log.text}
              </pre>
            )}
            {log.type === 'info' && (
              <pre className="text-[#80EF80] bg-gray-900 p-3.5 rounded-xl border border-[#BADBA2]/40 whitespace-pre-wrap">
                {log.text}
              </pre>
            )}
            {log.type === 'error' && (
              <pre className="text-amber-300 bg-amber-950/25 p-3.5 rounded-xl border border-amber-900/50 whitespace-pre-wrap">
                {log.text}
              </pre>
            )}
            {log.type === 'success' && (
              <pre className="text-[#42D674] bg-gray-900 p-3.5 rounded-xl border border-[#42D674]/40 whitespace-pre-wrap font-bold">
                {log.text}
              </pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command Input Prompt */}
      <div className="bg-[#1F2937] px-5 py-3 border-t border-gray-800 flex items-center gap-2.5">
        <span className="text-[#80EF80] font-mono text-xs font-bold shrink-0">
          analyst@workstation:~$
        </span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              executeCommand(inputCommand);
            }
          }}
          placeholder="Escribe un comando ADB (ej: adb shell cat /sdcard/Download/secret_note_insecure.txt)..."
          className="flex-1 bg-[#0B0F19] border border-gray-700 rounded-lg px-3.5 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#42D674]"
        />
        <button
          onClick={() => executeCommand(inputCommand)}
          className="px-4 py-2 rounded-lg bg-[#42D674] hover:bg-[#38b863] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Ejecutar</span>
        </button>
      </div>
    </div>
  );
};
