// src/app/util/arquivo-download.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class ArquivoDownloadService {

  baixar(blob: Blob, nome: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
