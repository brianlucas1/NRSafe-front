// Utilidades para formatar datas para backends Java (LocalDate/LocalDateTime)

/**
 * Retorna 'YYYY-MM-DD' representando o dia local, sem timezone.
 * - Se endOfDay = false, considera início do dia local (00:00:00.000)
 * - Se endOfDay = true, considera fim do dia local (23:59:59.999)
 */
export function formataDataDiaMesAno(date: Date, endOfDay: boolean): string {
  if (!date) return '';
  const d = new Date(date);
  if (endOfDay) d.setHours(23, 59, 59, 999); else d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${m}-${y}`;
}

export function startOfDayLocalForJava(date: Date): string {
  return formataDataDiaMesAno(date, false);
}

export function endOfDayLocalForJava(date: Date): string {
  return formataDataDiaMesAno(date, true);
}

