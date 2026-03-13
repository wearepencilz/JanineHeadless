/**
 * Unit tests for product generation eligibility functions
 * 
 * Tests the core eligibility checking logic for format-flavour combinations.
 */

import { describe, it, expect } from 'vitest';
import { isFormatEligibleForFlavour } from '@/lib/product-generation';

describe('isFormatEligibleForFlavour', () => {
  describe('backward compatibility - formats without eligibility rules', () => {
    it('should accept all flavours when format has no eligibleFlavourTypes field', () => {
      const format = {};
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };
      const softServeFlavour = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavour(format, gelatoFlavour)).toBe(true);
      expect(isFormatEligibleForFlavour(format, sorbetFlavour)).toBe(true);
      expect(isFormatEligibleForFlavour(format, softServeFlavour)).toBe(true);
    });

    it('should accept all flavours when format has empty eligibleFlavourTypes array', () => {
      const format = { eligibleFlavourTypes: [] };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };
      const softServeFlavour = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavour(format, gelatoFlavour)).toBe(true);
      expect(isFormatEligibleForFlavour(format, sorbetFlavour)).toBe(true);
      expect(isFormatEligibleForFlavour(format, softServeFlavour)).toBe(true);
    });
  });

  describe('single eligible type', () => {
    it('should accept flavours matching the single eligible type', () => {
      const format = { eligibleFlavourTypes: ['gelato'] };
      const gelatoFlavour = { type: 'gelato' };

      expect(isFormatEligibleForFlavour(format, gelatoFlavour)).toBe(true);
    });

    it('should reject flavours not matching the single eligible type', () => {
      const format = { eligibleFlavourTypes: ['gelato'] };
      const sorbetFlavour = { type: 'sorbet' };
      const softServeFlavour = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavour(format, sorbetFlavour)).toBe(false);
      expect(isFormatEligibleForFlavour(format, softServeFlavour)).toBe(false);
    });
  });

  describe('multiple eligible types', () => {
    it('should accept flavours matching any of the eligible types', () => {
      const format = { eligibleFlavourTypes: ['gelato', 'sorbet'] };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavour(format, gelatoFlavour)).toBe(true);
      expect(isFormatEligibleForFlavour(format, sorbetFlavour)).toBe(true);
    });

    it('should reject flavours not matching any eligible type', () => {
      const format = { eligibleFlavourTypes: ['gelato', 'sorbet'] };
      const softServeFlavour = { type: 'soft-serve-base' };
      const cookieFlavour = { type: 'cookie' };

      expect(isFormatEligibleForFlavour(format, softServeFlavour)).toBe(false);
      expect(isFormatEligibleForFlavour(format, cookieFlavour)).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle scoop format accepting gelato and sorbet', () => {
      const scoopFormat = { eligibleFlavourTypes: ['gelato', 'sorbet'] };
      const vanillaGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };
      const softServe = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavour(scoopFormat, vanillaGelato)).toBe(true);
      expect(isFormatEligibleForFlavour(scoopFormat, lemonSorbet)).toBe(true);
      expect(isFormatEligibleForFlavour(scoopFormat, softServe)).toBe(false);
    });

    it('should handle sandwich format accepting only gelato', () => {
      const sandwichFormat = { eligibleFlavourTypes: ['gelato'] };
      const chocolateGelato = { type: 'gelato' };
      const strawberrySorbet = { type: 'sorbet' };

      expect(isFormatEligibleForFlavour(sandwichFormat, chocolateGelato)).toBe(true);
      expect(isFormatEligibleForFlavour(sandwichFormat, strawberrySorbet)).toBe(false);
    });

    it('should handle soft-serve format accepting only soft-serve-base', () => {
      const softServeFormat = { eligibleFlavourTypes: ['soft-serve-base'] };
      const vanillaSoftServe = { type: 'soft-serve-base' };
      const chocolateGelato = { type: 'gelato' };

      expect(isFormatEligibleForFlavour(softServeFormat, vanillaSoftServe)).toBe(true);
      expect(isFormatEligibleForFlavour(softServeFormat, chocolateGelato)).toBe(false);
    });

    it('should handle legacy format without eligibility rules', () => {
      const legacyFormat = {};
      const anyFlavour1 = { type: 'gelato' };
      const anyFlavour2 = { type: 'sorbet' };
      const anyFlavour3 = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavour(legacyFormat, anyFlavour1)).toBe(true);
      expect(isFormatEligibleForFlavour(legacyFormat, anyFlavour2)).toBe(true);
      expect(isFormatEligibleForFlavour(legacyFormat, anyFlavour3)).toBe(true);
    });
  });
});
