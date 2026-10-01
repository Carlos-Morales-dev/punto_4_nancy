import React, { useState } from 'react';
import { ConfidentialNote } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { DeviceFileExplorer } from './components/DeviceFileExplorer';
import { AdbTerminal } from './components/AdbTerminal';
import { CryptoArchitecture } from './components/CryptoArchitecture';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { ReadmeReport } from './components/ReadmeReport';
import { StepsWizard } from './components/StepsWizard';
import { exportAndroidStudioProject } from './utils/exportAndroidStudioProject';
import {
  Smartphone,
  HardDrive,
  Terminal,
  Shield,
  Code2,
  FileText,
  ListChecks,
  ShieldCheck,
  Download,
  FolderArchive,
  Info,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'phone' | 'explorer' | 'adb' | 'crypto' | 'code' | 'readme' | 'steps'
  >('phone');
  const [isExporting, setIsExporting] = useState(false);
  const [showStudioModal, setShowStudioModal] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAndroidStudioProject();
    } catch (e) {
      console.error(e);
      alert('Error al generar el ZIP del proyecto');
    } finally {
      setIsExporting(false);
    }
  };

  // Estado con notas de ejemplo iniciales cortas y concisas
  const [notes, setNotes] = useState<ConfidentialNote[]>([
    {
      id: 'note_849201',
      title: 'PIN y Clave Bancaria',
      content: 'PIN: 8841 | Clave: Sec#9918',
      category: 'bancario',
      timestamp: '19:42:15',
      isEncryptedStored: true,
      isExternalStored: true,
      encryptedKeyCipher: 'AR92J3KLM4091A8SK0192JDJAKL901==',
      encryptedValueCipher: 'AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==',
      rawExternalContent: 'PIN: 8841 | Clave: Sec#9918',
    },
    {
      id: 'note_512844',
      title: 'Token de Servicio API',
      content: 'API_KEY: AKIAIOSF9918-SECRET-TOKEN-AUTH',
      category: 'api_tokens',
      timestamp: '19:44:02',
      isEncryptedStored: true,
      isExternalStored: false,
      encryptedKeyCipher: 'AR83HD9201LKS0928374HJAKSLMNZ9==',
      encryptedValueCipher: 'AQ83Kd821ksl81923kjsdkla7182903jskldja81923==',
      rawExternalContent: '',
    },
  ]);

  const handleAddNote = (newNote: ConfidentialNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearExternal = () => {
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        isExternalStored: false,
      }))
    );
  };

  const navItems = [
    {
      id: 'phone' as const,
      label: 'Simulador Móvil',
      icon: Smartphone,
      badge: `${notes.length}`,
    },
    {
      id: 'explorer' as const,
      label: 'Device File Explorer',
      icon: HardDrive,
    },
    {
      id: 'adb' as const,
      label: 'Terminal ADB',
      icon: Terminal,
    },
    {
      id: 'crypto' as const,
      label: 'Arquitectura Cifrado',
      icon: Shield,
    },
    {
      id: 'code' as const,
      label: 'Código Fuente Android',
      icon: Code2,
      badge: '5 archivos',
    },
    {
      id: 'readme' as const,
      label: 'Informe README.md',
      icon: FileText,
    },
    {
      id: 'steps' as const,
      label: 'Guía de Laboratorio',
      icon: ListChecks,
      badge: '5 pasos',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-[#80EF80] selection:text-gray-950">
      {/* Header Limpio y Profesional */}
      <header className="border-b border-[#BADBA2]/40 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-[#42D674]/50 bg-[#153422] flex items-center justify-center text-[#42D674] shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-gray-900 tracking-tight leading-tight">
                  Taller 3 — Punto 4: Seguridad y Cifrado en Android
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E3F0A3] text-gray-800 border border-[#BADBA2] font-mono">
                  AES-256
                </span>
              </div>
              <p className="text-xs text-gray-500">
                EncryptedSharedPreferences vs Almacenamiento en SD/Público • Auditoría ADB y Device File Explorer
              </p>
            </div>
          </div>

          {/* Botones de Exportación a Android Studio */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStudioModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BADBA2] bg-[#FAFDF9] hover:bg-[#E3F0A3]/40 text-xs font-semibold text-gray-800 transition-all cursor-pointer"
              title="Ver instrucciones para Android Studio"
            >
              <Info className="w-3.5 h-3.5 text-gray-600" />
              <span>Instrucciones Android Studio</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-[#153422] hover:bg-[#1e4830] text-[#42D674] border border-[#42D674]/60 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generando ZIP...' : 'Descargar Proyecto Android Studio (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegación Limpia y Directa */}
        <div className="bg-[#FAFDF9] border-t border-[#BADBA2]/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-[#42D674] text-white font-bold border-[#42D674] shadow-xs'
                      : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-[#E3F0A3]/30 border-[#BADBA2]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white text-gray-900'
                          : 'bg-[#E3F0A3] text-gray-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace con fondo blanco */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 bg-white space-y-4">
        {/* Banner de Flujo Guiado Interactivo: 4 Pasos del Laboratorio */}
        <div className="bg-[#F8FAF8] border border-[#BADBA2]/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#42D674] animate-pulse"></span>
              <span className="text-xs font-bold text-gray-900">
                Flujo Recomendado de Demostración:
              </span>
            </div>
            {/* Pasos Clickables */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('phone')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'phone'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                1. Guardar Nota (App)
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('explorer')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                2. Explorar Archivos
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('adb')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'adb'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                3. Probar ADB
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('readme')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'readme'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                4. Sustentar (README)
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'phone' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <PhoneSimulator
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onClearExternal={handleClearExternal}
              onNavigateToTab={(t) => setActiveTab(t)}
            />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <DeviceFileExplorer notes={notes} />
          </div>
        )}

        {activeTab === 'adb' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdbTerminal notes={notes} />
          </div>
        )}

        {activeTab === 'crypto' && (
          <div className="animate-in fade-in duration-150">
            <CryptoArchitecture />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="animate-in fade-in duration-150">
            <SourceCodeViewer />
          </div>
        )}

        {activeTab === 'readme' && (
          <div className="animate-in fade-in duration-150">
            <ReadmeReport />
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="animate-in fade-in duration-150">
            <StepsWizard onNavigateToTab={(t) => setActiveTab(t)} />
          </div>
        )}
      </main>

      {/* Footer con la paleta y fondo blanco */}
      <footer className="border-t border-[#BADBA2]/40 bg-[#FAFDF9] py-5 px-4 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">
          Universidad de Nariño • Taller 3 • Persistencia en Android Studio • Punto 4: Seguridad y Cifrado
        </p>
        <p className="text-gray-500 mt-1">
          Implementación con EncryptedSharedPreferences (Jetpack Security) & Android Keystore vs Almacenamiento Externo SD
        </p>
      </footer>

      {/* Modal Instrucciones Android Studio */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#BADBA2] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#153422] text-[#42D674] flex items-center justify-center font-bold">
                  AS
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  Cómo abrir y ejecutar el proyecto en Android Studio
                </h3>
              </div>
              <button
                onClick={() => setShowStudioModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#FAFDF9] border border-[#BADBA2]/70 space-y-1.5">
                <span className="font-bold text-gray-900 block">Paso 1: Descargar el Proyecto</span>
                <p>
                  Haz clic en el botón verde <strong className="text-emerald-700">"Descargar Proyecto Android Studio (.ZIP)"</strong> en la barra superior. Se descargará el archivo comprimido con toda la estructura de Gradle y código Kotlin.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFDF9] border border-[#BADBA2]/70 space-y-1.5">
                <span className="font-bold text-gray-900 block">Paso 2: Descomprimir y Abrir</span>
                <p>
                  Descomprime el archivo en tu computadora. Abre <strong>Android Studio</strong> (Ladybug, Koala o Iguana), selecciona <strong>Open...</strong> y elige la carpeta raíz del proyecto.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFDF9] border border-[#BADBA2]/70 space-y-1.5">
                <span className="font-bold text-gray-900 block">Paso 3: Sincronización Gradle Automática</span>
                <p>
                  Android Studio detectará el archivo <code className="bg-[#E3F0A3] px-1 rounded">gradle-wrapper.properties</code> (Gradle 8.9 y AGP 8.7.0) y descargará automáticamente las dependencias de Jetpack Security y Compose.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFDF9] border border-[#BADBA2]/70 space-y-1.5">
                <span className="font-bold text-gray-900 block">Paso 4: Ejecutar en Emulador o Celular Físico</span>
                <p>
                  Conecta un teléfono Android o inicia un emulador de Android Studio (Pixel con API 26+) y presiona el botón verde <strong>Run 'app'</strong> (<kbd className="bg-gray-100 px-1 border rounded">Shift + F10</kbd>).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowStudioModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowStudioModal(false);
                  handleExport();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#153422] text-[#42D674] border border-[#42D674]/60 hover:bg-[#1e4830] cursor-pointer"
              >
                Descargar ZIP Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
