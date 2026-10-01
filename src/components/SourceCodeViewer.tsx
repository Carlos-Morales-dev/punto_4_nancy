import React, { useState } from 'react';
import { ANDROID_FILES, README_CONTENT } from '../data/androidProjectSource';
import { AndroidCodeFile } from '../types';
import { FileCode, Copy, Check, Download, FolderTree } from 'lucide-react';
import JSZip from 'jszip';

export const SourceCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Add each Android file into its relative path
      ANDROID_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Add root README.md
      zip.file('README.md', README_CONTENT);

      // Add gradle wrapper properties and settings.gradle.kts for easy import
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SecureNotesApp"
include(":app")
`
      );

      zip.file(
        'build.gradle.kts',
        `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SecureNotesApp_Android_Project.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Error generando el archivo ZIP.');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="bg-[#111827] border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-md flex flex-col h-[760px]">
      {/* Top Header */}
      <div className="bg-[#1F2937] px-5 py-3 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#153422] border border-[#42D674]/50 flex items-center justify-center text-[#42D674] shadow-xs">
            <FolderTree className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">Código Fuente Nativo Android (Kotlin & XML) - Punto 4</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Android Studio Hedgehog / Iguana • SDK 34</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono flex items-center gap-1.5 transition-colors border border-gray-700 cursor-pointer"
            title="Copiar código actual"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#42D674]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Archivo</span>
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="px-4 py-1.5 rounded-lg bg-[#42D674] hover:bg-[#38b863] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            title="Descargar proyecto completo en ZIP"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{downloadingZip ? 'Comprimiendo...' : 'Descargar Proyecto ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-800">
        {/* Left File Selector List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#111827] overflow-hidden">
          <div className="px-4 py-2 bg-[#1A2234] border-b border-gray-800 text-[11px] text-[#80EF80] font-bold flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Estructura del Proyecto</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {ANDROID_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-mono transition-all flex flex-col gap-1 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#153422] border-[#42D674] text-[#80EF80] shadow-xs font-semibold'
                      : 'bg-gray-800/80 border-gray-700/80 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold flex items-center gap-1.5 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#80EF80]' : 'text-gray-400'}`} />
                      <span className="truncate text-white">{file.name}</span>
                    </span>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                        file.language === 'kotlin'
                          ? 'bg-[#E3F0A3] text-gray-900'
                          : 'bg-[#BADBA2] text-gray-900'
                      }`}
                    >
                      {file.language}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate mt-0.5">{file.path}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#1A2234] border-t border-gray-800 text-[11px] text-gray-400 space-y-1">
            <p className="font-bold text-[#80EF80]">📦 Importación Directa:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-gray-400">
              <li>Haz clic en <strong>Descargar Proyecto ZIP</strong>.</li>
              <li>Abre Android Studio y selecciona <strong>Open...</strong></li>
              <li>Compila y ejecuta en tu emulador o dispositivo físico.</li>
            </ol>
          </div>
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col bg-[#0B0F19] overflow-hidden">
          {/* File description header */}
          <div className="bg-[#1F2937] px-5 py-2.5 border-b border-gray-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-[#80EF80] font-bold text-sm">{selectedFile.name}</span>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedFile.description}</p>
            </div>
            <span className="text-[10px] font-mono text-gray-300 bg-gray-800 px-2.5 py-1 rounded-md border border-gray-700">
              {selectedFile.path}
            </span>
          </div>

          {/* Code text */}
          <div className="flex-1 overflow-auto p-5 font-mono text-xs bg-[#0B0F19] leading-relaxed text-gray-200 selection:bg-[#42D674] selection:text-white">
            <pre className="whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
