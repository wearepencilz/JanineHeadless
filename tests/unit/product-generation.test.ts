/**
 * Unit tests for product generation eligibility functions
 * 
 * Tests the core eligibility checking logic for format-flavour combinations.
 */

import { describe, it, expect } from 'vitest';
import { isFormatEligibleForFlavour, isFormatEligibleForFlavours } from '@/lib/product-generation';

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

describe('isFormatEligibleForFlavours', () => {
  describe('backward compatibility - formats without eligibility rules', () => {
    it('should accept all flavour combinations when format has no eligibleFlavourTypes field', () => {
      const format = { allowMixedTypes: true };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(true);
      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, gelatoFlavour])).toBe(true);
    });

    it('should accept all flavour combinations when format has empty eligibleFlavourTypes array', () => {
      const format = { eligibleFlavourTypes: [], allowMixedTypes: true };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(true);
    });
  });

  describe('single type combinations', () => {
    it('should accept combinations where all flavours have the same eligible type', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: false 
      };
      const gelatoFlavour1 = { type: 'gelato' };
      const gelatoFlavour2 = { type: 'gelato' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour1, gelatoFlavour2])).toBe(true);
    });

    it('should reject combinations where any flavour is ineligible', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato'],
        allowMixedTypes: false 
      };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(false);
    });
  });

  describe('mixed type combinations', () => {
    it('should accept mixed types when allowMixedTypes is true and all types are eligible', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: true 
      };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(true);
    });

    it('should reject mixed types when allowMixedTypes is false', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: false 
      };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(false);
    });

    it('should reject mixed types when one type is ineligible', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato'],
        allowMixedTypes: true 
      };
      const gelatoFlavour = { type: 'gelato' };
      const sorbetFlavour = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [gelatoFlavour, sorbetFlavour])).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle twist format allowing mixed gelato and sorbet', () => {
      const twistFormat = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: true 
      };
      const vanillaGelato = { type: 'gelato' };
      const chocolateGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };

      // Same type combinations
      expect(isFormatEligibleForFlavours(twistFormat, [vanillaGelato, chocolateGelato])).toBe(true);
      
      // Mixed type combinations
      expect(isFormatEligibleForFlavours(twistFormat, [vanillaGelato, lemonSorbet])).toBe(true);
      expect(isFormatEligibleForFlavours(twistFormat, [chocolateGelato, lemonSorbet])).toBe(true);
    });

    it('should handle gelato-only twist format', () => {
      const gelatoTwistFormat = { 
        eligibleFlavourTypes: ['gelato'],
        allowMixedTypes: false 
      };
      const vanillaGelato = { type: 'gelato' };
      const chocolateGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };

      // Gelato combinations should work
      expect(isFormatEligibleForFlavours(gelatoTwistFormat, [vanillaGelato, chocolateGelato])).toBe(true);
      
      // Mixed with sorbet should fail
      expect(isFormatEligibleForFlavours(gelatoTwistFormat, [vanillaGelato, lemonSorbet])).toBe(false);
    });

    it('should handle format that requires same type but accepts multiple types', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: false 
      };
      const vanillaGelato = { type: 'gelato' };
      const chocolateGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };
      const strawberrySorbet = { type: 'sorbet' };

      // Same type combinations should work
      expect(isFormatEligibleForFlavours(format, [vanillaGelato, chocolateGelato])).toBe(true);
      expect(isFormatEligibleForFlavours(format, [lemonSorbet, strawberrySorbet])).toBe(true);
      
      // Mixed type should fail
      expect(isFormatEligibleForFlavours(format, [vanillaGelato, lemonSorbet])).toBe(false);
    });

    it('should handle three-flavour combinations', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: true 
      };
      const vanillaGelato = { type: 'gelato' };
      const chocolateGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };

      expect(isFormatEligibleForFlavours(format, [vanillaGelato, chocolateGelato, lemonSorbet])).toBe(true);
    });

    it('should reject if any flavour in multi-flavour combination is ineligible', () => {
      const format = { 
        eligibleFlavourTypes: ['gelato', 'sorbet'],
        allowMixedTypes: true 
      };
      const vanillaGelato = { type: 'gelato' };
      const lemonSorbet = { type: 'sorbet' };
      const softServe = { type: 'soft-serve-base' };

      expect(isFormatEligibleForFlavours(format, [vanillaGelato, lemonSorbet, softServe])).toBe(false);
    });
  });
});
