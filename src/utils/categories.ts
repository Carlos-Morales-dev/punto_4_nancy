import { SecretCategory } from '../types';

export interface CategoryInfo {
  id: SecretCategory;
  label: string;
  badgeBg: string;
  textColor: string;
}

export const SECRET_CATEGORIES: CategoryInfo[] = [
  {
    id: 'bancario',
    label: 'Bancario & Financiero',
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40',
    textColor: 'text-emerald-300',
  },
  {
    id: 'credenciales',
    label: 'Credenciales de Acceso',
    badgeBg: 'bg-blue-950/70 border-blue-500/40',
    textColor: 'text-blue-300',
  },
  {
    id: 'api_tokens',
    label: 'API Keys & Tokens',
    badgeBg: 'bg-amber-950/70 border-amber-500/40',
    textColor: 'text-amber-300',
  },
  {
    id: 'cripto_wallets',
    label: 'Cripto & Billeteras',
    badgeBg: 'bg-purple-950/70 border-purple-500/40',
    textColor: 'text-purple-300',
  },
  {
    id: 'doble_factor',
    label: 'Respaldo 2FA & OTP',
    badgeBg: 'bg-cyan-950/70 border-cyan-500/40',
    textColor: 'text-cyan-300',
  },
  {
    id: 'identidad',
    label: 'Identidad & Documentos',
    badgeBg: 'bg-indigo-950/70 border-indigo-500/40',
    textColor: 'text-indigo-300',
  },
  {
    id: 'medico',
    label: 'Médico & Salud Privada',
    badgeBg: 'bg-rose-950/70 border-rose-500/40',
    textColor: 'text-rose-300',
  },
  {
    id: 'empresa',
    label: 'Corporativo & Negocios',
    badgeBg: 'bg-slate-800 border-slate-600',
    textColor: 'text-slate-200',
  },
  {
    id: 'wifi_redes',
    label: 'Redes & Wi-Fi',
    badgeBg: 'bg-teal-950/70 border-teal-500/40',
    textColor: 'text-teal-300',
  },
  {
    id: 'personal',
    label: 'Personal & Privado',
    badgeBg: 'bg-zinc-800 border-zinc-600',
    textColor: 'text-zinc-200',
  },
];

export function getCategoryInfo(categoryId: SecretCategory): CategoryInfo {
  return (
    SECRET_CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      label: categoryId,
      badgeBg: 'bg-gray-800 border-gray-700',
      textColor: 'text-gray-300',
    }
  );
}
