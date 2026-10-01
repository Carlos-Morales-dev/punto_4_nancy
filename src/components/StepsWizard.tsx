import React, { useState } from 'react';
import {
  Smartphone,
  HardDrive,
  Terminal,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StepsWizardProps {
  onNavigateToTab?: (tabId: 'phone' | 'explorer' | 'adb' | 'crypto' | 'code' | 'readme') => void;
}

interface StepWindow {
  id: number;
  title: string;
  badge: string;
  shortDesc: string;
  icon: React.ElementType;
  imageIcon?: string;
  targetTab: 'phone' | 'explorer' | 'adb' | 'crypto' | 'code' | 'readme';
  targetTabName: string;
  objective: string;
  actions: string[];
  evidenceText: string;
  evidenceType: 'success' | 'warning' | 'terminal';
  commands?: string[];
  tip: string;
}

export const StepsWizard: React.FC<StepsWizardProps> = ({ onNavigateToTab }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const steps: StepWindow[] = [
    {
      id: 1,
      title: 'Ventana 1: Creación de la Nota Confidencial en la App',
      badge: 'Paso 1 de 5 • Captura de Datos',
      shortDesc: 'Ingresar datos sensibles y seleccionar el método de almacenamiento',
      icon: Smartphone,
      targetTab: 'phone',
      targetTabName: 'Ir al Simulador Móvil',
      objective: 'Generar una nota con datos sensibles (contraseñas, PIN, tokens) para comparar su comportamiento en disco.',
      actions: [
        'Abre la pestaña "Simulador Móvil".',
        'Escribe un título como "PIN y Clave" y selecciona la categoría en el desplegable.',
        'Ingresa un contenido corto (ej: "PIN: 8841 | Clave: Sec#9918").',
        'Haz clic en "1. Guardar Cifrado (Interno Keystore)" o "2. Guardar Copia en SD/Público". Cada opción te llevará a su ventana independiente demostrando su resultado.',
      ],
      evidenceText: 'Cada opción demuestra de forma independiente su comportamiento: la bóveda cifrada en EncryptedSharedPreferences o el volcado sin cifrar en /sdcard/Download.',
      evidenceType: 'success',
      tip: 'Puedes alternar la vista entre "Ver en texto plano" y "Ver cifrado" dentro de la pantalla del celular para verificar la transformación en memoria.',
    },
    {
      id: 2,
      title: 'Ventana 2: Inspección Visual con Device File Explorer',
      badge: 'Paso 2 de 5 • Análisis de Archivos',
      shortDesc: 'Explorar las rutas /data/data y /sdcard en el sistema de archivos Android',
      icon: HardDrive,
      targetTab: 'explorer',
      targetTabName: 'Abrir Device File Explorer',
      objective: 'Verificar la ubicación física de los dos archivos creados y contrastar sus permisos de Linux (0660 vs público).',
      actions: [
        'Entra a la pestaña "Device File Explorer".',
        'En el árbol izquierdo, despliega "data > data > com.security.securenotes > shared_prefs" y haz clic en "secret_notes_encrypted.xml".',
        'Observa que el contenido son etiquetas XML con claves y valores AES-256 indescifrables.',
        'Luego despliega "sdcard > Download" y selecciona "secret_note_insecure.txt" para verificar la fuga de datos en texto plano.',
      ],
      evidenceText: 'En el archivo XML privado no aparece la palabra "admin_2026" ni la clave real; en la tarjeta SD el texto está totalmente legible.',
      evidenceType: 'warning',
      tip: 'Usa la pestaña "Visor Hexadecimal (Hex Dump)" para evidenciar los bytes en crudo ante el docente o evaluador.',
    },
    {
      id: 3,
      title: 'Ventana 3: Extracción Forense con ADB (Prueba en SD)',
      badge: 'Paso 3 de 5 • Simulación de Ataque',
      shortDesc: 'Ejecutar comandos adb shell y adb pull para descargar el archivo vulnerable',
      icon: Terminal,
      targetTab: 'adb',
      targetTabName: 'Abrir Terminal ADB',
      objective: 'Demostrar que cualquier atacante con conexión USB o malware con READ_EXTERNAL_STORAGE puede robar los datos de la SD.',
      actions: [
        'Dirígete a la pestaña "Terminal ADB".',
        'Haz clic en el botón rápido "2. Listar SD (/sdcard)" para ver los permisos y el grupo "everybody".',
        'Haz clic en "3. Cat nota insegura (SD)" para ver el texto plano en la consola.',
        'Haz clic en "4. Extraer nota SD (Pull)" para descargar una copia local al computador atacante.',
      ],
      evidenceText: 'adb pull /sdcard/Download/secret_note_insecure.txt ./insecure_dump.txt\n[RESULTADO]: Archivo descargado exitosamente sin solicitar credenciales ni root.',
      evidenceType: 'terminal',
      commands: [
        'adb shell ls -la /sdcard/Download/',
        'adb shell cat /sdcard/Download/secret_note_insecure.txt',
        'adb pull /sdcard/Download/secret_note_insecure.txt ./insecure_dump.txt',
      ],
      tip: 'El grupo "everybody" confirma la ausencia de sandbox POSIX en el almacenamiento externo compartido.',
    },
    {
      id: 4,
      title: 'Ventana 4: Auditoría del Sandbox y Cifrado AES-256',
      badge: 'Paso 4 de 5 • Protección Criptográfica',
      shortDesc: 'Comprobar el bloqueo de Linux (Permission denied) y el acceso controlado con run-as',
      icon: ShieldCheck,
      targetTab: 'adb',
      targetTabName: 'Comprobar Bloqueo en Terminal',
      objective: 'Comprobar la doble barrera: el aislamiento a nivel de proceso del kernel Linux y el cifrado fuerte AES-256-GCM / AES-256-SIV.',
      actions: [
        'En la "Terminal ADB", ejecuta o haz clic en "5. Cat directo a /data/data".',
        'Comprueba que el kernel responde con "Permission denied" debido a los permisos -rw-rw---- del usuario de la app.',
        'Ejecuta "6. Cat con run-as (Cifrado)" para simular el acceso desde el propio proceso de la app.',
        'Observa que aun teniendo acceso al archivo, los datos son ininteligibles sin la MasterKey alojada en hardware Keystore.',
      ],
      evidenceText: '/system/bin/sh: cat: .../secret_notes_encrypted.xml: Permission denied\n[ANÁLISIS]: El sandbox impide acceso no autorizado. Con run-as, los datos están bajo AES256_GCM + SIV.',
      evidenceType: 'success',
      commands: [
        'adb shell cat /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml',
        'adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml',
      ],
      tip: 'La biblioteca Tink administra las claves DEK, mientras que el hardware de AndroidKeystore custodia la KEK maestra.',
    },
    {
      id: 5,
      title: 'Ventana 5: Exportación de Informe README y Código Fuente',
      badge: 'Paso 5 de 5 • Sustentación y Entrega',
      shortDesc: 'Descargar el informe técnico README.md y el proyecto nativo en ZIP',
      icon: FileText,
      targetTab: 'readme',
      targetTabName: 'Ir al Informe README.md',
      objective: 'Generar la evidencia formal requerida para la calificación del laboratorio.',
      actions: [
        'Ve a la pestaña "Informe README.md" para revisar el reporte técnico detallado.',
        'Haz clic en "Descargar README.md" para tener el informe en formato Markdown listo para entrega.',
        'Ingresa a la pestaña "Código Android Studio" y haz clic en "Descargar Proyecto ZIP".',
        'Descomprime el ZIP y ábrelo directamente en Android Studio si deseas compilarlo en un emulador real.',
      ],
      evidenceText: 'El proyecto ZIP incluye AndroidManifest.xml, build.gradle.kts con la dependencia androidx.security:security-crypto:1.1.0-alpha06, SecureStorageManager.kt y MainActivity.kt.',
      evidenceType: 'success',
      tip: 'Revisa las preguntas clave al final de esta pantalla para repasar la sustentación oral ante el docente.',
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#42D674] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Guía Interactiva de Sustentación en Ventanas (Punto 4)
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Pasos a Seguir para el Laboratorio de Seguridad
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Navega por cada ventana paso a paso para realizar la auditoría forense y preparar la sustentación.
          </p>
        </div>

        {/* Window Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#BADBA2] rounded-xl shadow-2xs">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-8 px-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                currentStepIndex === idx
                  ? 'bg-[#42D674] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#E3F0A3]/50 hover:text-gray-900'
              }`}
              title={step.title}
            >
              <step.icon className="w-3.5 h-3.5" />
              <span>V{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Multi-Window Frame */}
      <div className="bg-white border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-xs">
        {/* Window Top Titlebar */}
        <div className="bg-[#111827] px-5 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5 mr-1">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-[#42D674]"></div>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <div className="w-7 h-7 rounded-lg bg-[#153422] border border-[#42D674]/50 flex items-center justify-center text-[#42D674] shadow-xs shrink-0">
                <currentStep.icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span>{currentStep.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E3F0A3] text-gray-900 text-[10px] font-mono font-bold">
              {currentStep.badge}
            </span>
          </div>
        </div>

        {/* Window Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Objective Box */}
          <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono text-[#42D674] font-bold uppercase tracking-wider block">
              🎯 Objetivo del Paso:
            </span>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {currentStep.objective}
            </p>
          </div>

          {/* Action Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#42D674]" />
              Acciones a Realizar en Esta Ventana:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentStep.actions.map((act, i) => (
                <div
                  key={i}
                  className="bg-[#FAFDF9] border border-[#BADBA2]/70 rounded-xl p-3 text-xs text-gray-700 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-[#42D674] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commands block if present */}
          {currentStep.commands && currentStep.commands.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#42D674]" />
                Comandos de Terminal para Esta Prueba:
              </span>
              <div className="bg-gray-900 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                {currentStep.commands.map((cmd, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-gray-200">
                    <span className="text-[#80EF80] truncate">{cmd}</span>
                    <button
                      onClick={() => handleCopyCmd(cmd)}
                      className="text-gray-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
                      title="Copiar comando"
                    >
                      {copiedCmd === cmd ? (
                        <Check className="w-3.5 h-3.5 text-[#42D674]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Result Box */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              {currentStep.evidenceType === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#42D674]" />
              )}
              Evidencia / Resultado Esperado:
            </span>
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed font-mono whitespace-pre-wrap ${
                currentStep.evidenceType === 'terminal'
                  ? 'bg-gray-950 text-[#80EF80] border-gray-800'
                  : currentStep.evidenceType === 'warning'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-[#FAFDF9] text-gray-800 border-[#BADBA2]'
              }`}
            >
              {currentStep.evidenceText}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-3.5 rounded-xl bg-[#E3F0A3]/50 border border-[#BADBA2] text-xs text-gray-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#42D674] shrink-0 mt-0.5" />
            <span>
              <strong>Tip para el Sustentador:</strong> {currentStep.tip}
            </span>
          </div>

          {/* Action to Jump to Tool */}
          {onNavigateToTab && (
            <div className="pt-2 flex justify-start">
              <button
                onClick={() => onNavigateToTab(currentStep.targetTab)}
                className="px-4 py-2 rounded-xl bg-[#42D674] hover:bg-[#38b863] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>{currentStep.targetTabName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Window Footer Navigation Bar */}
        <div className="bg-[#FAFDF9] px-6 py-4 border-t border-[#BADBA2]/40 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-lg bg-white border border-[#BADBA2] text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer hover:bg-gray-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ventana Anterior</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStepIndex === i ? 'bg-[#42D674] scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Ventana ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="px-4 py-2 rounded-lg bg-[#42D674] hover:bg-[#38b863] text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <span>Siguiente Ventana</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preguntas Clave y Conceptos para la Sustentación Oral */}
      <div className="bg-[#FAFDF9] border border-[#BADBA2]/80 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-[#42D674]" />
          <span>Preguntas Clave para la Sustentación del Punto 4</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-gray-700">
          <div className="bg-white p-4 rounded-xl border border-[#BADBA2]/60 space-y-1.5 shadow-2xs">
            <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>1. ¿Por qué la SD es insegura en Android?</span>
            </h5>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Las memorias externas (FAT32/exFAT) no soportan permisos POSIX ni sandbox Linux por UID. Cualquier app con permiso de lectura o cable USB (<code className="bg-amber-100 text-amber-900 px-1 rounded font-mono">adb pull</code>) extrae el archivo sin autenticación ni cifrado.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#BADBA2]/60 space-y-1.5 shadow-2xs">
            <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>2. ¿Por qué EncryptedSharedPreferences es seguro?</span>
            </h5>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Utiliza cifrado autenticado en 2 capas: <code className="bg-[#E3F0A3] text-gray-900 px-1 rounded font-mono font-semibold">AES-256 GCM</code> para valores y <code className="bg-[#E3F0A3] text-gray-900 px-1 rounded font-mono font-semibold">AES-256 SIV</code> para claves, con una <strong>MasterKey</strong> resguardada en el hardware Keystore (TEE/StrongBox).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
