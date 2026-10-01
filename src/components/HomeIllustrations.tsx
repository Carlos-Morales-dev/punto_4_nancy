import React from 'react';

/**
 * Ilustración exacta de la Tarjeta 1 (Crear Nota Secreta):
 * Cuaderno de notas con espiral azul, renglones, destellos amarillos y candado verde brillante.
 */
export const NotebookSecretDrawing: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-md select-none`}
    >
      {/* Destellos / Rayos amarillos superiores */}
      <path
        d="M68 18L72 13M80 24L87 22M76 32L83 36"
        stroke="#FCD34D"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M26 22L21 16M16 28L10 29"
        stroke="#6EE7B7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Sombra proyectada del cuaderno */}
      <rect
        x="24"
        y="22"
        width="46"
        height="56"
        rx="8"
        transform="rotate(-4 24 22)"
        fill="#0D2E26"
        opacity="0.3"
      />

      {/* Tapa trasera del cuaderno */}
      <rect
        x="20"
        y="18"
        width="48"
        height="60"
        rx="8"
        transform="rotate(-4 20 18)"
        fill="#0284C7"
        stroke="#042F2E"
        strokeWidth="3.5"
      />

      {/* Hoja de papel principal blanca */}
      <rect
        x="24"
        y="17"
        width="44"
        height="58"
        rx="6"
        transform="rotate(-4 24 17)"
        fill="#FFFFFF"
        stroke="#042F2E"
        strokeWidth="3.5"
      />

      {/* Renglones azules en la hoja */}
      <g transform="rotate(-4 24 17)">
        <line x1="32" y1="28" x2="58" y2="28" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="36" x2="58" y2="36" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="44" x2="58" y2="44" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="52" x2="52" y2="52" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Anillos de la espiral izquierda */}
      <g transform="rotate(-4 20 18)">
        <path d="M19 26C16 26 15 28 15 30C15 32 16 34 22 34" stroke="#042F2E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M19 36C16 36 15 38 15 40C15 42 16 44 22 44" stroke="#042F2E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M19 46C16 46 15 48 15 50C15 52 16 54 22 54" stroke="#042F2E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M19 56C16 56 15 58 15 60C15 62 16 64 22 64" stroke="#042F2E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Candado en primer plano (Superpuesto abajo a la derecha) */}
      <g filter="drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.35))">
        {/* Grillete metálico del candado */}
        <path
          d="M52 48V42C52 36.5 56.5 32 62 32C67.5 32 72 36.5 72 42V48"
          stroke="#064E3B"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M54 48V42C54 37.6 57.6 34 62 34C66.4 34 70 37.6 70 42V48"
          stroke="#6EE7B7"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cuerpo del candado verde brillante */}
        <rect
          x="46"
          y="47"
          width="32"
          height="28"
          rx="7"
          fill="#10B981"
          stroke="#064E3B"
          strokeWidth="3.5"
        />

        {/* Brillo interior del candado */}
        <path
          d="M51 51H73C74.5 51 75 51.5 75 53V55C75 53.5 74 53 72 53H52C50 53 49 53.5 49 55V53C49 51.5 49.5 51 51 51Z"
          fill="#6EE7B7"
          opacity="0.8"
        />

        {/* Ojo de la cerradura (Keyhole) */}
        <circle cx="62" cy="59" r="2.8" fill="#064E3B" />
        <path d="M60.8 59.5L60 66H64L63.2 59.5Z" fill="#064E3B" />
      </g>
    </svg>
  );
};

/**
 * Ilustración exacta de la Tarjeta 2 (Ver Notas y Comparar):
 * Carpeta amarilla abierta con documentos asomando (blanco, azul, morado), destellos y botón azul con '+'.
 */
export const FolderCompareDrawing: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-md select-none`}
    >
      {/* Rayos / destellos celestes y blancos */}
      <path
        d="M24 24L18 20M34 16L32 10M72 22L78 18M86 28L92 27"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="82" cy="14" r="2" fill="#E0F2FE" />
      <circle cx="16" cy="30" r="1.8" fill="#E0F2FE" />

      {/* Sombra base */}
      <ellipse cx="48" cy="80" rx="34" ry="7" fill="#030E26" opacity="0.45" />

      {/* Tapa trasera de la carpeta (Amarillo oscuro/mostaza) */}
      <path
        d="M16 42C16 38 19 35 23 35H38L44 41H77C81 41 84 44 84 48V72C84 76 81 79 77 79H23C19 79 16 76 16 72V42Z"
        fill="#D97706"
        stroke="#0F172A"
        strokeWidth="3.5"
      />

      {/* Documento 1 (Blanco al fondo) */}
      <g transform="rotate(-6 38 40)">
        <rect
          x="28"
          y="25"
          width="26"
          height="34"
          rx="4"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="3"
        />
        <line x1="33" y1="32" x2="48" y2="32" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="33" y1="38" x2="46" y2="38" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Documento 2 (Azul intermedio) */}
      <g transform="rotate(3 50 36)">
        <rect
          x="42"
          y="28"
          width="24"
          height="32"
          rx="4"
          fill="#0284C7"
          stroke="#0F172A"
          strokeWidth="3"
        />
        <line x1="47" y1="35" x2="59" y2="35" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Documento 3 (Púrpura / Violeta al frente con esquina doblada) */}
      <g transform="rotate(8 58 38)">
        <path
          d="M50 31H68C70 31 72 33 72 35V56C72 58 70 60 68 60H52C50 60 48 58 48 56V33C48 32 49 31 50 31Z"
          fill="#8B5CF6"
          stroke="#0F172A"
          strokeWidth="3"
        />
        {/* Esquina doblada */}
        <path
          d="M65 31V37H72"
          fill="#C4B5FD"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Tapa frontal de la carpeta abierta (Amarillo brillante con degradado cálido) */}
      <path
        d="M17 50C17 46.5 19.5 43.5 23 43.5H41L47 48.5H76C79.5 48.5 82.5 51.5 82 55L78 74C77.5 77 74.5 79.5 71 79.5H23C19.5 79.5 16.5 76.5 17 73L17 50Z"
        fill="#FBBF24"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Detalle de brillo en la pestaña de la carpeta */}
      <path
        d="M24 46H40L45 50H74"
        stroke="#FDE68A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Insignia Circular Azul con signo '+' en la esquina inferior derecha */}
      <g filter="drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4))">
        <circle
          cx="72"
          cy="71"
          r="13"
          fill="#2563EB"
          stroke="#0F172A"
          strokeWidth="3.5"
        />
        {/* Brillo interior del botón */}
        <circle cx="72" cy="71" r="11" stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Signo más '+' blanco y grueso */}
        <path
          d="M72 65V77M66 71H78"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

/**
 * Insignia de candado brillante para el encabezado SecureNotes
 */
export const HeaderLockBadge: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <div
      className={`${className} rounded-2xl bg-[#06331F] border-2 border-[#10B981] flex items-center justify-center p-1.5 shadow-md shadow-[#10B981]/25 shrink-0`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="4"
          y="10"
          width="16"
          height="12"
          rx="3.5"
          fill="#10B981"
          stroke="#064E3B"
          strokeWidth="2"
        />
        <circle cx="12" cy="15.5" r="1.5" fill="#064E3B" />
        <path d="M12 16.5V18.5" stroke="#064E3B" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
};
