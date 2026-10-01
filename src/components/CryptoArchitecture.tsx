import React from 'react';
import { ShieldCheck, Cpu, Key, Lock, AlertTriangle, Layers, Database, CheckCircle2, XCircle } from 'lucide-react';

export const CryptoArchitecture: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#153422] border-2 border-[#42D674]/50 shrink-0 flex items-center justify-center text-[#42D674] shadow-xs">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#42D674] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Arquitectura Criptográfica Oficial de Android (Punto 4)
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                ¿Cómo Funciona EncryptedSharedPreferences y por qué la SD es Insegura?
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                Explicación gráfica y técnica del sistema de claves en dos niveles (2-Tier Key Management) utilizado por Jetpack Security y la biblioteca Tink de Google.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#E3F0A3] border border-[#BADBA2] text-gray-900 text-xs font-mono font-bold shrink-0">
            Jetpack Security 1.1.0 (AES-256)
          </div>
        </div>
      </div>

      {/* Visual Pipeline 2-Tier Architecture */}
      <div className="bg-white border border-[#BADBA2]/60 rounded-2xl p-6 md:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#42D674]" />
          Flujo de Cifrado en 2 Niveles: MasterKey (Hardware) → Data Keys (Software)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Step 1: Android Keystore */}
          <div className="bg-[#FAFDF9] border border-[#BADBA2]/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#42D674] transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E3F0A3] border border-[#BADBA2] flex items-center justify-center text-gray-900">
                <Cpu className="w-5 h-5 text-[#42D674]" />
              </div>
              <div className="text-[10px] font-mono text-[#42D674] font-bold uppercase">Nivel 1: Hardware</div>
              <h4 className="font-bold text-gray-900 text-xs">Android Keystore</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Genera la <code className="text-gray-900 font-semibold bg-[#E3F0A3] px-1 rounded">MasterKey</code> en un enclave de hardware seguro (TEE - <em>Trusted Execution Environment</em> o módulo StrongBox).
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#BADBA2]/40 text-[10px] text-[#42D674] font-medium">
              🔒 La llave maestra nunca sale del chip físico
            </div>
          </div>

          {/* Step 2: Keyset Encryption */}
          <div className="bg-[#FAFDF9] border border-[#BADBA2]/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#42D674] transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E3F0A3] border border-[#BADBA2] flex items-center justify-center text-gray-900">
                <Key className="w-5 h-5 text-[#42D674]" />
              </div>
              <div className="text-[10px] font-mono text-[#42D674] font-bold uppercase">Protección de Llaves</div>
              <h4 className="font-bold text-gray-900 text-xs">Keyset Cifrado (KEK)</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                La <code className="text-gray-900 font-semibold bg-[#E3F0A3] px-1 rounded">MasterKey</code> actúa como KEK (<em>Key Encryption Key</em>) y cifra las llaves secundarias en memoria antes de guardarlas en el XML.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#BADBA2]/40 text-[10px] text-gray-600 font-mono">
              Tink Keyset Manager
            </div>
          </div>

          {/* Step 3: Algoritmos Criptográficos */}
          <div className="bg-[#FAFDF9] border border-[#BADBA2]/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#42D674] transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E3F0A3] border border-[#BADBA2] flex items-center justify-center text-gray-900">
                <Lock className="w-5 h-5 text-[#42D674]" />
              </div>
              <div className="text-[10px] font-mono text-[#42D674] font-bold uppercase">Nivel 2: Algoritmos</div>
              <h4 className="font-bold text-gray-900 text-xs">AES-256 SIV + GCM</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <strong>Claves (Keys):</strong> AES256_SIV (Cifrado determinístico que impide inferir el nombre).<br/>
                <strong>Valores (Values):</strong> AES256_GCM (Cifrado autenticado AEAD con tag de integridad).
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#BADBA2]/40 text-[10px] text-[#42D674] font-medium">
              Confidencialidad + Integridad
            </div>
          </div>

          {/* Step 4: Destino en Disco */}
          <div className="bg-[#FAFDF9] border border-[#BADBA2]/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#42D674] transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E3F0A3] border border-[#BADBA2] flex items-center justify-center text-gray-900">
                <Database className="w-5 h-5 text-[#42D674]" />
              </div>
              <div className="text-[10px] font-mono text-[#42D674] font-bold uppercase">Sandbox Linux</div>
              <h4 className="font-bold text-gray-900 text-xs">Disco Interno Privado</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                El archivo XML reside en <code className="text-gray-900 font-semibold bg-[#E3F0A3] px-1 rounded">/data/data/pkg/shared_prefs/</code> con permisos <code className="text-gray-900 font-semibold bg-[#E3F0A3] px-1 rounded">0660</code> exclusivos para el UID del proceso.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#BADBA2]/40 text-[10px] text-gray-600 font-mono">
              Inaccesible para otras aplicaciones
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Secure vs Insecure Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: EncryptedSharedPreferences */}
        <div className="bg-white border-2 border-[#42D674] rounded-2xl p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-[#42D674] text-white flex items-center justify-center font-bold">
                <Lock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900">EncryptedSharedPreferences (Recomendado)</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#E3F0A3] text-gray-900 border border-[#BADBA2] text-[10px] font-bold font-mono">
              SEGURO
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Forma parte de <strong>AndroidX Security</strong>. Diseñado específicamente para almacenar pares clave-valor confidenciales (credenciales bancarias, tokens JWT, información médica, llaves privadas).
          </p>

          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#42D674] shrink-0 mt-0.5" />
              <span><strong>Hardware Keystore:</strong> La clave maestra nunca se expone en memoria ni en disco.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#42D674] shrink-0 mt-0.5" />
              <span><strong>Cifrado AEAD (GCM):</strong> Detección instantánea de cualquier modificación o manipulación maliciosa de los datos.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#42D674] shrink-0 mt-0.5" />
              <span><strong>Sandbox UID:</strong> Cada aplicación en Android corre con un usuario Linux único que impide la lectura cruzada sin root.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#42D674] shrink-0 mt-0.5" />
              <span><strong>Extracción ADB infructuosa:</strong> Si alguien extrae el XML con <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-900">run-as</code>, solo obtiene hashes y cadenas cifradas inútiles sin la MasterKey.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tarjeta SD / Almacenamiento Externo */}
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-400 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900">Almacenamiento Externo / SD (Inseguro)</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono">
              VULNERABLE
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            El almacenamiento externo tradicional (<code className="bg-amber-50 px-1 py-0.5 rounded font-mono text-amber-900">/sdcard/</code> o <code className="bg-amber-50 px-1 py-0.5 rounded font-mono text-amber-900">/storage/emulated/0/</code>) fue concebido para compartir fotos, música y descargas entre aplicaciones.
          </p>

          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Sin Sandbox de Proceso:</strong> Los archivos tienen el grupo <code className="bg-amber-50 px-1 py-0.5 rounded font-mono text-amber-900">everybody</code> (sdcard_rw). Cualquier app autorizada puede leerlos.</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Extracción Instantánea por ADB:</strong> Conectando un cable USB y ejecutando <code className="bg-amber-50 px-1 py-0.5 rounded font-mono text-amber-900">adb pull</code> se descarga el archivo completo sin necesidad de contraseñas ni root.</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Falta de Cifrado en Reposo:</strong> El archivo se escribe en texto plano legible por humanos con cualquier explorador de archivos.</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Manipulación Sin Detección:</strong> Un atacante puede alterar los datos almacenados y la app no tiene manera de comprobar si fueron modificados.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
