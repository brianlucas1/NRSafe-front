import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = (control.value || '').replace(/\D/g, '').trim();

    if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    const calcCheckDigit = (cpf: string, factor: number): number => {
      let total = 0;
      for (let i = 0; i < factor - 1; i++) {
        total += parseInt(cpf[i]) * (factor - i);
      }
      const remainder = (total * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };

    const digito1 = calcCheckDigit(cpf, 10);
    const digito2 = calcCheckDigit(cpf, 11);

    if (digito1 !== +cpf[9] || digito2 !== +cpf[10]) {
      return { cpfInvalido: true };
    }

    return null;
  };
}

export function sanitizeCpf(input: string | null | undefined): string | null {
  if (input == null) return null;                 // mantém semântica de nulo
  const digits = input.replace(/\D/g, "");        // remove tudo que não é dígito (., -, espaço, etc.)
  return digits.length ? digits : null;           // evita string vazia viajando no app
}