// Utilitários de Máscaras e Formatações para Formulários Clínicos

export const maskCPF = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
};

export const maskPhone = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 2) return clean ? `(${clean}` : '';
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
};

export const maskCEP = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
};

export const maskCRP = (value: string): string => {
  let clean = value.toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (!clean.startsWith('CRP')) {
    clean = 'CRP' + clean.replace(/CRP/g, '');
  }
  const digits = clean.slice(3).replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits ? `CRP ${digits}` : 'CRP ';
  }
  return `CRP ${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const maskCurrency = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (!clean) return 'R$ 0,00';
  const number = Number(clean) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
