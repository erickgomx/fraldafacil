import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageMagicBytes } from '../lib/storage';

describe('validateImageMagicBytes', () => {
  it('aceita assinatura binária JPEG válida', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    assert.deepEqual(validateImageMagicBytes(jpeg), {
      valid: true,
      mimeType: 'image/jpeg',
      ext: 'jpg',
    });
  });

  it('aceita assinatura binária PNG válida', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    assert.deepEqual(validateImageMagicBytes(png), {
      valid: true,
      mimeType: 'image/png',
      ext: 'png',
    });
  });

  it('aceita assinatura binária WebP válida', () => {
    const webp = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'latin1');
    assert.deepEqual(validateImageMagicBytes(webp), {
      valid: true,
      mimeType: 'image/webp',
      ext: 'webp',
    });
  });

  it('rejeita SVG, HTML, buffers curtos e conteúdo arbitrário', () => {
    assert.deepEqual(
      validateImageMagicBytes(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8')),
      { valid: false }
    );
    assert.deepEqual(
      validateImageMagicBytes(Buffer.from('<!DOCTYPE html><html></html>', 'utf8')),
      { valid: false }
    );
    assert.deepEqual(validateImageMagicBytes(Buffer.from([0xff, 0xd8, 0xff])), { valid: false });
    assert.deepEqual(validateImageMagicBytes(Buffer.alloc(24, 0x41)), { valid: false });
  });
});
