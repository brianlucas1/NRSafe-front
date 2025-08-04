import { AbstractControl, ValidationErrors } from "@angular/forms";

export function  validaCep(control: AbstractControl): ValidationErrors | null {
    const valor = (control.value || '').replace(/\D/g, '');       
    if (!/^\d{8}$/.test(valor)) return { formato: true };
    if (valor.split('').every((d: any) => d === valor[0])) return { cepInvalido: true };
    return null;                                                  
  }