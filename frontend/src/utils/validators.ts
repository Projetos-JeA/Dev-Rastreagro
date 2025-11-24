export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  email = email.trim();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;

  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  if (localPart.includes('..')) {
    return false;
  }

  if (domainPart.length === 0 || domainPart.length > 255) {
    return false;
  }

  if (
    domainPart.startsWith('-') ||
    domainPart.endsWith('-') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.')
  ) {
    return false;
  }

  return true;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirement {
  key: string;
  label: string;
  met: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 número');
  }

  if (!/[!@#$%&*]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 caractere especial (! @ # $ % & *)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { key: 'length', label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { key: 'uppercase', label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { key: 'lowercase', label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { key: 'number', label: 'Um número', met: /[0-9]/.test(password) },
    { key: 'special', label: 'Um caractere especial (!@#$%&*)', met: /[!@#$%&*]/.test(password) },
  ];
}

export function validateNomeCompleto(nome: string): { isValid: boolean; error: string } {
  if (!nome || !nome.trim()) {
    return { isValid: false, error: 'Nome completo é obrigatório' };
  }

  const nomeNormalized = nome.trim();

  for (const char of nomeNormalized) {
    if (!(char.match(/[a-zA-ZÀ-ÿ]/) || char === ' ' || char === '-')) {
      return { isValid: false, error: "O campo 'nome' só pode conter letras e espaços" };
    }
  }

  if (nomeNormalized.length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (!/[a-zA-ZÀ-ÿ]/.test(nomeNormalized)) {
    return { isValid: false, error: 'Nome deve conter pelo menos uma letra' };
  }

  return { isValid: true, error: '' };
}