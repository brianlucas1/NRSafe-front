import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function rgValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rg = control.value?.toString().trim();

    if (!rg) return null; // Campo vazio, deixa o required cuidar

    // Remove pontos, hífens e espaços
    const cleaned = rg.replace(/[.\-\s]/g, '');

    // Verifica se o RG tem entre 5 e 14 caracteres alfanuméricos (último dígito pode ser X)
    const rgRegex = /^[0-9]{5,13}[0-9Xx]$/;
    if (!rgRegex.test(cleaned)) {
      return { rgInvalido: true };
    }

    // Rejeita RGs com todos os dígitos iguais (ex: 111111111, 000000000)
    const repeated = /^(\d)\1{4,}$/;
    if (repeated.test(cleaned.replace(/[^0-9]/g, ''))) {
      return { rgInvalido: true };
    }

    return null;
  };
}