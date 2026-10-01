export type SecretCategory =
  | 'bancario'
  | 'credenciales'
  | 'api_tokens'
  | 'cripto_wallets'
  | 'medico'
  | 'identidad'
  | 'empresa'
  | 'wifi_redes'
  | 'personal'
  | 'doble_factor';

export interface ConfidentialNote {
  id: string;
  title: string;
  content: string;
  category: SecretCategory;
  timestamp: string;
  isEncryptedStored: boolean;
  isExternalStored: boolean;
  encryptedKeyCipher: string;
  encryptedValueCipher: string;
  rawExternalContent: string;
}

export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: string;
  permissions: string;
  owner: string;
  group: string;
  lastModified: string;
  isConfidential?: boolean;
  content?: string;
  hexDump?: string;
  children?: FileSystemItem[];
}

export interface AdbCommand {
  command: string;
  label: string;
  description: string;
  category: 'adb' | 'shell' | 'pull';
}

export interface AndroidCodeFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy';
  description: string;
  content: string;
}
