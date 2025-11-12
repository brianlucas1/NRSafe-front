// src/app/shared/models/plano-acao-status.model.ts

/** Códigos aceitos pelo backend (iguais ao enum do Java) */
export type PlanoAcaoStatusCodigo = 'AB' | 'EA' | 'CO' | 'CA';

export interface PlanoAcaoStatusOption {
  codigo: PlanoAcaoStatusCodigo;
  descricao: string;
}

/** Opções para usar direto no p-dropdown */
export const PLANO_ACAO_STATUS_OPTIONS: ReadonlyArray<PlanoAcaoStatusOption> = [
  { codigo: 'AB', descricao: 'Aberto' },
  { codigo: 'EA', descricao: 'Em andamento' },
  { codigo: 'CO', descricao: 'Concluído' },
  { codigo: 'CA', descricao: 'Cancelado' },
] as const;

/** Mapa rápido código -> descrição */
export const PLANO_ACAO_STATUS_MAP: ReadonlyMap<PlanoAcaoStatusCodigo, string> =
  new Map(PLANO_ACAO_STATUS_OPTIONS.map(o => [o.codigo, o.descricao]));

/** Guard para validar valores vindos do back/front */
export function isPlanoAcaoStatusCodigo(v: any): v is PlanoAcaoStatusCodigo {
  return v === 'AB' || v === 'EA' || v === 'CO' || v === 'CA';
}

/** Pega a descrição legível a partir do código */
export function statusDescricao(codigo: PlanoAcaoStatusCodigo | null | undefined): string {
  return (codigo && PLANO_ACAO_STATUS_MAP.get(codigo)) ?? '';
}

/**
 * Normaliza strings vindas do back (caso algum endpoint retorne a descrição em vez do código).
 * - Aceita códigos ('EA') ou descrições ('EM ANDAMENTO', 'Em Andamento', etc.)
 * - Retorna sempre um código válido ou null se não reconhecer.
 */
export function normalizeStatus(input: string | null | undefined): PlanoAcaoStatusCodigo | null {
  if (!input) return null;
  const up = input.toUpperCase().trim();

  if (isPlanoAcaoStatusCodigo(up)) return up;

  switch (up) {
    case 'ABERTO': return 'AB';
    case 'EM ANDAMENTO': return 'EA';
    case 'CONCLUÍDO':
    case 'CONCLUIDO': return 'CO';
    case 'CANCELADO': return 'CA';
    default: return null;
  }
}

export const DEFAULT_STATUS: PlanoAcaoStatusCodigo = 'AB';
