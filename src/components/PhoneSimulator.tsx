import React, { useState } from 'react';
import { ConfidentialNote, SecretCategory } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Lock,
  FileText,
  CheckCircle2,
  Trash2,
  Key,
  ArrowLeft,
  PlusCircle,
  Eye,
  EyeOff,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Tag,
  Copy,
  Check,
  Database,
  Cpu,
  Clock,
  Hash,
  FileCode,
  Terminal,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { generateEncryptedKey, generateEncryptedValue } from '../utils/cryptoSim';
import { NotebookSecretDrawing, FolderCompareDrawing, HeaderLockBadge } from './HomeIllustrations';

interface PhoneSimulatorProps {
  notes: ConfidentialNote[];
  onAddNote: (note: ConfidentialNote) => void;
  onDeleteNote: (id: string) => void;
  onClearExternal: () => void;
  onNavigateToTab?: (tab: 'explorer' | 'adb' | 'crypto') => void;
}

export type MobileScreen = 'home' | 'new_note' | 'notes_list' | 'note_detail';

const SECRET_CATEGORIES: { id: SecretCategory; label: string }[] = [
  { id: 'bancario', label: 'Bancario & Financiero (PINs, Tarjetas, Cuentas)' },
  { id: 'credenciales', label: 'Credenciales de Acceso (Usuario & Contraseña)' },
  { id: 'api_tokens', label: 'API Keys & Tokens (AWS, Firebase, Cloud)' },
  { id: 'cripto_wallets', label: 'Cripto & Billeteras (Seed Phrase, Wallets)' },
  { id: 'doble_factor', label: 'Respaldo 2FA & OTP (Códigos de recuperación)' },
  { id: 'identidad', label: 'Identidad & Documentos (Cédula, Pasaporte)' },
  { id: 'medico', label: 'Médico & Salud (Historial, Medicación)' },
  { id: 'empresa', label: 'Corporativo & Negocios (Servidores, Contratos)' },
  { id: 'wifi_redes', label: 'Redes & Wi-Fi (Claves WPA3, Router)' },
  { id: 'personal', label: 'Personal & Privado (Notas confidenciales)' },
];

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onNavigateToTab,
}) => {
  // Estado de navegación entre ventanas
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<'all' | 'encrypted' | 'external'>('all');

  // Formulario de nueva nota
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SecretCategory>('bancario');
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    content?: string;
    general?: string;
  }>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // En detalle de nota: estado para revelar/ocultar contenido sensible y copiar
  const [isSecretRevealed, setIsSecretRevealed] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (mode: 'encrypted' | 'external') => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const errors: { title?: string; content?: string; general?: string } = {};

    if (!trimmedTitle) {
      errors.title = 'El título de la nota es obligatorio.';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres.';
    } else if (notes.some((n) => n.title.toLowerCase() === trimmedTitle.toLowerCase())) {
      errors.title = 'Ya existe una nota con este título. Usa un título diferente.';
    }

    if (!trimmedContent) {
      errors.content = 'Debes ingresar el contenido sensible o secreto.';
    } else if (trimmedContent.length < 3) {
      errors.content = 'El contenido debe contener al menos 3 caracteres.';
    }

    if (Object.keys(errors).length > 0) {
      errors.general = 'No se puede crear la nota: debes completar todos los campos obligatorios antes de continuar.';
      setFormErrors(errors);
      // Bloquea totalmente la creación si los campos no están llenos
      return;
    }

    // Limpiar errores previos si todo es válido
    setFormErrors({});

    const id = `note_${Date.now().toString().slice(-6)}`;
    const encKey = generateEncryptedKey(id);
    const encVal = generateEncryptedValue(`${trimmedTitle}|||${trimmedContent}`);

    const newNote: ConfidentialNote = {
      id,
      title: trimmedTitle,
      content: trimmedContent,
      category,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isEncryptedStored: mode === 'encrypted',
      isExternalStored: mode === 'external',
      encryptedKeyCipher: encKey,
      encryptedValueCipher: encVal,
      rawExternalContent: mode === 'external' ? trimmedContent : '',
    };

    onAddNote(newNote);
    setTitle('');
    setContent('');

    if (mode === 'encrypted') {
      setNotification({
        type: 'success',
        message: '✅ Guardada bajo cifrado AES-256 en EncryptedSharedPreferences (Hardware Keystore)',
      });
      setListFilter('encrypted');
    } else {
      setNotification({
        type: 'warning',
        message: '⚠️ Guardada copia en TEXTO PLANO en /sdcard/Download/secret_note_insecure.txt',
      });
      setListFilter('external');
    }

    setCurrentScreen('notes_list');

    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenDetail = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsSecretRevealed(true);
    setCopiedKey(null);
    setCurrentScreen('note_detail');
  };

  const encryptedNotes = notes.filter((n) => n.isEncryptedStored);
  const externalNotes = notes.filter((n) => n.isExternalStored);

  const displayedNotes = notes.filter((n) => {
    if (listFilter === 'encrypted') return n.isEncryptedStored;
    if (listFilter === 'external') return n.isExternalStored;
    return true;
  });

  return (
    <div className="flex justify-center items-center py-2">
      {/* Marco de Teléfono Android */}
      <div className="w-full max-w-[430px] mx-auto bg-[#111827] border-4 border-[#BADBA2] rounded-[46px] shadow-xl overflow-hidden p-3.5 ring-1 ring-gray-900">
        {/* Notch y Cámara frontal */}
        <div className="relative flex justify-center items-center pb-2.5 pt-1">
          <div className="w-20 h-4 bg-gray-900 rounded-full flex items-center justify-center gap-2 border border-gray-800">
            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
            <div className="w-7 h-1 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Pantalla del Celular */}
        <div className="bg-[#0B0F19] rounded-[32px] overflow-hidden border border-gray-800 text-slate-100 flex flex-col h-[750px]">
          {/* Barra de Estado Android */}
          <div className="bg-[#111827] px-5 py-1.5 flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-800 font-mono">
            <span className="text-[#80EF80] font-bold">19:45</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[10px] text-[#42D674] font-semibold">5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Android App Bar */}
          <div className="bg-[#111827] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {currentScreen !== 'home' ? (
                <button
                  type="button"
                  onClick={() => setCurrentScreen('home')}
                  className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors cursor-pointer border border-gray-700 shrink-0"
                  title="Volver a Inicio"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <HeaderLockBadge className="w-8 h-8" />
              )}
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
                  SecureNotes
                </h1>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div
              className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b animate-in fade-in slide-in-from-top-2 ${
                notification.type === 'error'
                  ? 'bg-rose-950/95 text-rose-200 border-rose-500 shadow-sm'
                  : notification.type === 'warning'
                  ? 'bg-amber-950/95 text-amber-200 border-amber-500 shadow-sm'
                  : 'bg-[#111827] text-[#80EF80] border-[#42D674]'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#42D674]" />
              )}
              <span className="text-[11px] font-medium leading-tight">{notification.message}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* CUERPO PRINCIPAL SEGÚN LA VENTANA / PANTALLA ACTIVA     */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {/* ---------------------------------------------------- */}
            {/* 1. VENTANA PRINCIPAL - INICIO                        */}
            {/* ---------------------------------------------------- */}
            {currentScreen === 'home' && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                {/* Acciones Rápidas con Ilustraciones Personalizadas */}
                <div className="space-y-3">
                  {/* Tarjeta 1: Crear y Guardar Nota Secreta (Verde con Cuaderno + Candado) */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors({});
                      setCurrentScreen('new_note');
                    }}
                    className="w-full p-3.5 rounded-[22px] bg-gradient-to-r from-[#20E57D] via-[#1CE078] to-[#14D46F] text-gray-950 font-extrabold flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer group border border-emerald-400/50 hover:brightness-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                        <NotebookSecretDrawing className="w-16 h-16" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-snug text-sm font-extrabold text-[#062617] tracking-tight">
                          1. Crear y Guardar Nota Secreta
                        </span>
                        <span className="block text-xs font-semibold text-[#0a3821] mt-0.5">
                          Elegir cifrado interno o copia en SD
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#062617] stroke-[3] shrink-0 mr-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Tarjeta 2: Ver Notas y Comparar Medios (Azul Oscuro con Carpeta Amarilla + Plus) */}
                  <button
                    type="button"
                    onClick={() => {
                      setListFilter('all');
                      setCurrentScreen('notes_list');
                    }}
                    className="w-full p-3.5 rounded-[22px] bg-gradient-to-r from-[#0C2454] via-[#091C42] to-[#071534] border-2 border-[#1E6BFF] text-white font-extrabold flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer group hover:border-[#38BDF8] relative overflow-hidden"
                  >
                    {/* Brillo ambiental de fondo */}
                    <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-[#1E6BFF]/25 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                        <FolderCompareDrawing className="w-16 h-16" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-snug text-sm font-extrabold text-white tracking-tight">
                          2. Ver Notas y Comparar Medios
                        </span>
                        <span className="block text-xs font-medium text-[#80ACF8] mt-0.5">
                          {notes.length} notas registradas en el sistema
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#2D82FE] stroke-[3] shrink-0 mr-1 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 2. VENTANA - NUEVA NOTA                              */}
            {/* ---------------------------------------------------- */}
            {currentScreen === 'new_note' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Banner de Error General si falla la creación */}
                {formErrors.general && (
                  <div className="bg-rose-950/80 border border-rose-600/70 rounded-2xl p-3 flex items-start gap-2.5 text-rose-200 shadow-sm animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] space-y-0.5">
                      <span className="font-bold text-rose-100 block">Error al crear la nota:</span>
                      <p className="text-rose-200/90 leading-tight">{formErrors.general}</p>
                    </div>
                  </div>
                )}

                {/* Formulario */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 space-y-3 shadow-sm">
                  {/* Campo Título con validación de error */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-gray-300 font-medium">Título de la Nota</label>
                      <span className="text-[10px] text-rose-400 font-mono">* Requerido</span>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formErrors.title || formErrors.general) {
                          setFormErrors((prev) => ({ ...prev, title: undefined, general: undefined }));
                        }
                      }}
                      placeholder="Ej: Contraseña Bancaria Principal"
                      className={`w-full bg-[#0B0F19] border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        formErrors.title
                          ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20'
                          : 'border-gray-700 focus:border-[#42D674]'
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* Menú Desplegable con Categorías de la Clave Secreta */}
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#42D674]" />
                        Categoría de la Clave Secreta
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">10 opciones</span>
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as SecretCategory)}
                        className="w-full bg-[#0B0F19] border border-gray-700 hover:border-[#42D674] focus:border-[#42D674] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors appearance-none cursor-pointer pr-9 font-medium"
                      >
                        {SECRET_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-[#111827] text-white py-2">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#42D674]">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Campo Contenido con validación de error */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-gray-300 font-medium">Contenido Sensible</label>
                      <span className="text-[10px] text-rose-400 font-mono">* Requerido</span>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (formErrors.content || formErrors.general) {
                          setFormErrors((prev) => ({ ...prev, content: undefined, general: undefined }));
                        }
                      }}
                      rows={3}
                      placeholder="Escribe aquí el secreto o información confidencial..."
                      className={`w-full bg-[#0B0F19] border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors resize-none font-mono text-[11px] ${
                        formErrors.content
                          ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20'
                          : 'border-gray-700 focus:border-[#42D674]'
                      }`}
                    />
                    {formErrors.content && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.content}</span>
                      </p>
                    )}
                  </div>

                  {/* Botones de Guardado con Explicación Intuitiva */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-gray-400 block font-mono">
                      Selecciona el medio de almacenamiento a probar:
                    </span>

                    {(!title.trim() || !content.trim()) && formErrors.general && (
                      <div className="bg-rose-950/50 border border-rose-600/70 rounded-xl p-2.5 text-[11px] text-rose-300 flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Campos requeridos vacíos. Completa el título y contenido para crear.</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSave('encrypted')}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#42D674] hover:bg-[#38b863] text-gray-950 font-bold flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-left font-bold">1. Guardar Cifrado (Interno Keystore - SEGURO)</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave('external')}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-left font-bold">2. Guardar Copia en SD (Texto Plano - INSEGURO)</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 3. VENTANA - LISTA UNIFICADA CON FILTROS INTUITIVOS */}
            {/* ---------------------------------------------------- */}
            {currentScreen === 'notes_list' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Pestañas de Filtro Segmentado: Todas, Cifradas, SD */}
                <div className="bg-[#111827] p-1 rounded-2xl border border-gray-800 grid grid-cols-3 gap-1 text-center font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setListFilter('all')}
                    className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer font-bold ${
                      listFilter === 'all'
                        ? 'bg-[#42D674] text-gray-950 shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Todas ({notes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListFilter('encrypted')}
                    className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1 ${
                      listFilter === 'encrypted'
                        ? 'bg-[#42D674] text-gray-950 shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Cifradas ({encryptedNotes.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setListFilter('external')}
                    className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-1 ${
                      listFilter === 'external'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'text-amber-400/80 hover:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>En SD ({externalNotes.length})</span>
                  </button>
                </div>

                {/* Botón rápido para agregar otra nota */}
                <button
                  type="button"
                  onClick={() => {
                    setFormErrors({});
                    setCurrentScreen('new_note');
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#0B0F19] hover:bg-gray-800 border border-gray-800 text-[#80EF80] font-bold flex items-center justify-between transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#42D674]" />
                    <span>+ Crear Nueva Nota para Comparar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>

                {/* Lista de Notas */}
                {displayedNotes.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl bg-[#111827]/40 text-gray-400 px-4 space-y-2">
                    <Key className="w-7 h-7 mx-auto opacity-40 text-[#42D674]" />
                    <p className="text-xs font-semibold text-gray-200">No hay notas en este filtro.</p>
                    <p className="text-[10px] text-gray-500">
                      Crea una nota para poner a prueba el almacenamiento.
                    </p>
                  </div>
                ) : (
                  displayedNotes.map((note) => {
                    return (
                      <div
                        key={note.id}
                        className="bg-[#111827] border border-gray-800 hover:border-[#BADBA2]/50 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-sm tracking-tight">{note.title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {note.isEncryptedStored ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#153422] text-[#80EF80] border border-[#42D674]/40 font-mono font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Bóveda AES-256
                                </span>
                              ) : (
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-600/50 font-mono font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> SD (Texto Plano)
                                </span>
                              )}
                              <span className="text-[9px] text-gray-400 font-mono">• {note.timestamp}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Eliminar nota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Botón Ver Detalle Completo */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(note.id)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0B0F19] hover:bg-gray-800 border border-gray-800 text-white font-semibold flex items-center justify-between transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-[#42D674]" />
                            <span className="font-bold text-gray-200">Ver Detalle Completo</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 4. VENTANA - DETALLE COMPLETO (INTUITIVA Y ORDENADA) */}
            {/* ---------------------------------------------------- */}
            {currentScreen === 'note_detail' && selectedNote && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* TARJETA 1: Resumen y Metadatos */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0B0F19] border border-[#42D674]/40 flex items-center justify-center shrink-0">
                        {selectedNote.isEncryptedStored ? (
                          <Lock className="w-4 h-4 text-[#42D674]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">
                          Detalle Completo
                        </span>
                        <h2 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {selectedNote.title}
                        </h2>
                      </div>
                    </div>
                    {selectedNote.isEncryptedStored ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold shrink-0 bg-[#153422] text-[#80EF80] border-[#42D674]/40 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> AES-256
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold shrink-0 bg-amber-950/70 text-amber-300 border-amber-600/50 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> SD Inseguro
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="bg-[#0B0F19] p-2 rounded-xl border border-gray-800/80">
                      <span className="text-[9px] text-gray-400 block flex items-center justify-center gap-1">
                        <Hash className="w-2.5 h-2.5 text-[#42D674]" /> ID Secreto
                      </span>
                      <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                        {selectedNote.id.replace('note_', '#')}
                      </span>
                    </div>
                    <div className="bg-[#0B0F19] p-2 rounded-xl border border-gray-800/80">
                      <span className="text-[9px] text-gray-400 block flex items-center justify-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#42D674]" /> Categoría
                      </span>
                      <span className="text-[11px] font-bold text-gray-200 truncate block mt-0.5" title={selectedNote.category}>
                        {SECRET_CATEGORIES.find((c) => c.id === selectedNote.category)?.label.split('&')[0].trim() || 'General'}
                      </span>
                    </div>
                    <div className="bg-[#0B0F19] p-2 rounded-xl border border-gray-800/80">
                      <span className="text-[9px] text-gray-400 block flex items-center justify-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#42D674]" /> Hora
                      </span>
                      <span className="text-[11px] font-bold text-[#80EF80] truncate block mt-0.5">
                        {selectedNote.timestamp}
                      </span>
                    </div>
                    <div className="bg-[#0B0F19] p-2 rounded-xl border border-gray-800/80">
                      <span className="text-[9px] text-gray-400 block flex items-center justify-center gap-1">
                        <Database className="w-2.5 h-2.5 text-[#42D674]" /> Tamaño
                      </span>
                      <span className="text-[11px] font-bold text-gray-200 truncate block mt-0.5">
                        {new TextEncoder().encode(selectedNote.content).length} B
                      </span>
                    </div>
                  </div>
                </div>

                {/* TARJETA 2: Contenido Sensible en Memoria */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#80EF80]" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        Contenido en Memoria (RAM)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyText('plain_content', selectedNote.content)}
                        className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] font-mono font-semibold text-[#80EF80] flex items-center gap-1 transition-colors cursor-pointer border border-gray-700"
                        title="Copiar texto"
                      >
                        {copiedKey === 'plain_content' ? <Check className="w-3 h-3 text-[#42D674]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'plain_content' ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSecretRevealed(!isSecretRevealed)}
                        className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] font-semibold text-gray-300 flex items-center gap-1 transition-colors cursor-pointer border border-gray-700"
                      >
                        {isSecretRevealed ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-[#42D674]" />}
                        <span>{isSecretRevealed ? 'Ocultar' : 'Revelar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0B0F19] rounded-xl p-3 border border-gray-800 min-h-[50px] flex items-center">
                    {isSecretRevealed ? (
                      <p className="text-white text-xs font-sans font-medium leading-relaxed whitespace-pre-wrap selection:bg-[#42D674] selection:text-gray-950">
                        {selectedNote.content}
                      </p>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 text-gray-500 py-1">
                        <Lock className="w-3.5 h-3.5 text-gray-600" />
                        <span className="font-mono text-xs tracking-widest text-gray-400">••••••••••••••••••••</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TARJETA 3: Comparativa de Seguridad ¿Qué ve un atacante? */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#42D674]" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        Diagnóstico: ¿Qué ve un atacante?
                      </span>
                    </div>
                    {selectedNote.isEncryptedStored ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E3F0A3] text-gray-900 border border-[#BADBA2]">
                        INMUNE (AES-256)
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-200 border border-rose-700">
                        VULNERABLE (TEXTO CLARO)
                      </span>
                    )}
                  </div>

                  {selectedNote.isEncryptedStored ? (
                    <div className="bg-[#153422]/90 border border-[#42D674]/50 rounded-xl p-3 space-y-2 font-mono text-[11px]">
                      <div className="flex items-start gap-1.5 text-gray-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#42D674] shrink-0 mt-0.5" />
                        <span><strong>Bóveda Privada:</strong> La MasterKey reside en hardware Keystore (TEE). En disco solo existe ciphertext indescifrable.</span>
                      </div>
                      <div className="text-[10px] text-gray-300 border-t border-[#42D674]/20 pt-1.5 space-y-1">
                        <div>• Algoritmo Valor: <strong className="text-[#80EF80]">AES-256-GCM (AEAD)</strong></div>
                        <div>• Algoritmo Clave: <strong className="text-[#80EF80]">AES-256-SIV (Determinístico)</strong></div>
                        <div>• Ruta: <span className="text-gray-200">/data/data/com.security.securenotes/shared_prefs/</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-3 space-y-2 font-mono text-[11px]">
                      <div className="flex items-start gap-1.5 text-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Directorio Público SD:</strong> El archivo se guardó sin cifrar. Cualquier app o comando <code className="bg-amber-900/80 px-1 rounded text-amber-200">adb pull</code> lee el secreto de inmediato.</span>
                      </div>
                      <div className="text-[10px] text-amber-200/80 border-t border-amber-600/20 pt-1.5 space-y-1">
                        <div>• Seguridad: <strong className="text-rose-400">0% Cifrado (Texto Plano UTF-8)</strong></div>
                        <div>• Permisos: <span className="text-amber-300">-rw-rw---- (Grupo 'everybody')</span></div>
                        <div>• Ruta: <span className="text-amber-300">/sdcard/Download/secret_note_insecure.txt</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* TARJETA 4: Evidencia en Disco (Criptograma o Texto Plano) */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#80EF80]" />
                      Volcado Físico en Disco
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {selectedNote.isEncryptedStored ? 'Criptograma XML' : 'Texto Plano SD'}
                    </span>
                  </div>

                  {selectedNote.isEncryptedStored ? (
                    <div className="bg-[#0B0F19] p-3 rounded-xl border border-gray-800 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Valor Cifrado (Value Cipher):</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('val_cipher', selectedNote.encryptedValueCipher)}
                          className="text-[10px] text-[#80EF80] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'val_cipher' ? <Check className="w-3 h-3 text-[#42D674]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'val_cipher' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="text-[10px] text-[#80EF80] break-all leading-tight bg-[#111827] p-2 rounded-lg border border-gray-800">
                        {selectedNote.encryptedValueCipher}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0B0F19] p-3 rounded-xl border border-gray-800 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Texto Plano Expuesto:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('sd_raw', selectedNote.rawExternalContent || selectedNote.content)}
                          className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'sd_raw' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'sd_raw' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <pre className="text-[10px] text-rose-300 leading-tight bg-[#111827] p-2 rounded-lg border border-gray-800 whitespace-pre-wrap">
                        {selectedNote.rawExternalContent || selectedNote.content}
                      </pre>
                    </div>
                  )}
                </div>

                {/* TARJETA 5: Atajos Directos a Herramientas Forenses (Novedad Intuitiva) */}
                {onNavigateToTab && (
                  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3 shadow-sm space-y-2">
                    <span className="text-[10px] font-mono text-gray-400 block">
                      Auditoría Forense Directa:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('explorer')}
                        className="p-2 rounded-xl bg-[#0B0F19] hover:bg-gray-800 border border-[#BADBA2]/40 text-[#80EF80] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Ver en File Explorer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('adb')}
                        className="p-2 rounded-xl bg-[#0B0F19] hover:bg-gray-800 border border-[#BADBA2]/40 text-[#80EF80] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Extraer con ADB</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones de Navegación */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNote(selectedNote.id);
                      setCurrentScreen('notes_list');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('notes_list')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#42D674] hover:bg-[#38b863] text-gray-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Volver a la Lista</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Android Barra de Navegación Inferior */}
          <div className="bg-[#0B0F19] py-2.5 px-10 flex justify-around items-center border-t border-gray-900">
            <button
              type="button"
              onClick={() => {
                if (currentScreen === 'note_detail') setCurrentScreen('notes_list');
                else setCurrentScreen('home');
              }}
              className="p-1 hover:text-[#42D674] text-gray-400 transition-colors cursor-pointer"
              title="Atrás"
            >
              <div className="w-3 h-3 border-l-2 border-b-2 border-current rotate-45"></div>
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen('home')}
              className="p-1 hover:text-[#42D674] text-gray-400 transition-colors cursor-pointer"
              title="Inicio"
            >
              <div className="w-3.5 h-3.5 border-2 border-current rounded-full"></div>
            </button>
            <button
              type="button"
              onClick={() => {
                setListFilter('all');
                setCurrentScreen('notes_list');
              }}
              className="p-1 hover:text-[#42D674] text-gray-400 transition-colors cursor-pointer"
              title="Notas Guardadas"
            >
              <div className="w-3 h-3 border-2 border-current rounded-sm"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
