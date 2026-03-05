import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpfMask',
  standalone: true
})
export class CpfMaskPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value == null) return '';

    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 11) return String(value);

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
