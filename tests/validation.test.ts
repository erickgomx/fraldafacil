import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCpf,
  formatEventDateBR,
  formatPhone,
  isReservedSlug,
  isValidCpf,
  isValidEmail,
  isValidEventType,
  parseEventDateInput,
  sanitizeSlug,
  validateSlug,
} from '../lib/validation';

describe('validation helpers', () => {
  it('normaliza textos em slugs válidos', () => {
    assert.equal(sanitizeSlug('  Chá de Bebê — João & Maria!! '), 'cha-de-bebe-joao-maria');
    assert.equal(sanitizeSlug('Revelação_2026---Lucas'), 'revelacao-2026-lucas');
  });

  it('valida comprimento e bloqueia rotas reservadas do sistema', () => {
    assert.equal(validateSlug('ab').valid, false);
    assert.equal(validateSlug('a'.repeat(81)).valid, false);

    for (const reserved of ['admin', 'api', 'painel', 'demo', 'sitemap.xml', '_next', '_custom']) {
      assert.equal(isReservedSlug(reserved), true, `Slug ${reserved} deveria ser reservado`);
      assert.equal(validateSlug(reserved).valid, false);
    }

    assert.deepEqual(validateSlug('cha-do-heitor'), { valid: true });
  });

  it('valida dígitos verificadores de CPF e formata corretamente', () => {
    assert.equal(isValidCpf('52998224725'), true);
    assert.equal(isValidCpf('529.982.247-25'), true);
    assert.equal(isValidCpf('11111111111'), false);
    assert.equal(isValidCpf('52998224726'), false);
    assert.equal(isValidCpf('12345'), false);
    assert.equal(isValidCpf(null), false);

    assert.equal(formatCpf('52998224725'), '529.982.247-25');
  });

  it('formata telefones fixos (10 dígitos) e celulares (11 dígitos)', () => {
    assert.equal(formatPhone('1133334444'), '(11) 3333-4444');
    assert.equal(formatPhone('11988887777'), '(11) 98888-7777');
    assert.equal(formatPhone(''), '');
  });

  it('valida e-mail e eventType permitidos', () => {
    assert.equal(isValidEmail('mamae@exemplo.com.br'), true);
    assert.equal(isValidEmail('invalido@'), false);
    assert.equal(isValidEmail(''), false);

    assert.equal(isValidEventType('REVELACAO'), true);
    assert.equal(isValidEventType('FRALDA'), true);
    assert.equal(isValidEventType('AMBOS'), true);
    assert.equal(isValidEventType('CASAMENTO'), false);
  });

  it('interpreta e formata datas YYYY-MM-DD em meio-dia UTC sem deslocar o dia', () => {
    const parsed = parseEventDateInput('2026-08-15');
    assert.ok(parsed instanceof Date);
    assert.equal(parsed.toISOString(), '2026-08-15T12:00:00.000Z');
    assert.equal(formatEventDateBR(parsed), '15/08/2026');

    assert.equal(parseEventDateInput('2026-02-30'), null);
    assert.equal(parseEventDateInput(''), null);
  });
});
