/**
 * Product Generation Utilities
 * 
 * Functions for determining format eligibility and generating products
 * based on format-flavour compatibility rules.
 */

import { Format } from '@/types';

/**
 * Determines if a format is eligible for a specific flavour
 * based on the format's eligibleFlavourTypes configuration.
 * 
 * Eligibility Rules:
 * - If format has no eligibleFlavourTypes field: accepts all flavours (backward compatible)
 * - If format has empty eligibleFlavourTypes array: accepts all flavours
 * - If format has eligibleFlavourTypes with values: only accepts flavours whose type is in the list
 * 
 * @param format - The format to check eligibility for
 * @param flavour - The flavour to check against the format
 * @returns true if the flavour is eligible for this format, false otherwise
 * 
 * @example
 * // Format accepts gelato and sorbet
 * const format = { eligibleFlavourTypes: ['gelato', 'sorbet'] };
 * const gelatoFlavour = { type: 'gelato' };
 * isFormatEligibleForFlavour(format, gelatoFlavour); // true
 * 
 * @example
 * // Format has no eligibility rules (accepts all)
 * const format = { };
 * const anyFlavour = { type: 'soft-serve-base' };
 * isFormatEligibleForFlavour(format, anyFlavour); // true
 */
export function isFormatEligibleForFlavour(
  format: Pick<Format, 'eligibleFlavourTypes'>,
  flavour: { type: string }
): boolean {
  // If no eligibility rules defined, accept all flavours (backward compatible)
  if (!format.eligibleFlavourTypes || format.eligibleFlavourTypes.length === 0) {
    return true;
  }
  
  // Check if flavour's type is in the format's eligible types
  return format.eligibleFlavourTypes.includes(flavour.type);
}

/**
 * Determines if a format is eligible for a combination of flavours.
 * All flavours must individually be eligible for the format, and mixed type
 * restrictions must be respected.
 * 
 * Eligibility Rules:
 * - All flavours must individually pass isFormatEligibleForFlavour check
 * - If flavours have different types AND format.allowMixedTypes is false: ineligible
 * - If flavours have different types AND format.allowMixedTypes is true: eligible (if all types are eligible)
 * 
 * @param format - The format to check eligibility for
 * @param flavours - Array of flavours to check against the format
 * @returns true if all flavours are eligible for this format and mixed type rules are satisfied
 * 
 * @example
 * // Format allows mixed types, both flavour types are eligible
 * const format = { 
 *   eligibleFlavourTypes: ['gelato', 'sorbet'],
 *   allowMixedTypes: true 
 * };
 * const flavours = [
 *   { type: 'gelato' },
 *   { type: 'sorbet' }
 * ];
 * isFormatEligibleForFlavours(format, flavours); // true
 * 
 * @example
 * // Format does not allow mixed types
 * const format = { 
 *   eligibleFlavourTypes: ['gelato'],
 *   allowMixedTypes: false 
 * };
 * const flavours = [
 *   { type: 'gelato' },
 *   { type: 'gelato' }
 * ];
 * isFormatEligibleForFlavours(format, flavours); // true (same type)
 * 
 * @example
 * // Format does not allow mixed types, flavours have different types
 * const format = { 
 *   eligibleFlavourTypes: ['gelato', 'sorbet'],
 *   allowMixedTypes: false 
 * };
 * const flavours = [
 *   { type: 'gelato' },
 *   { type: 'sorbet' }
 * ];
 * isFormatEligibleForFlavours(format, flavours); // false (mixed types not allowed)
 */
export function isFormatEligibleForFlavours(
  format: Pick<Format, 'eligibleFlavourTypes' | 'allowMixedTypes'>,
  flavours: Array<{ type: string }>
): boolean {
  // Check if flavours have different types
  const uniqueTypes = new Set(flavours.map(f => f.type));
  
  // If mixed types exist and format doesn't allow them, return false
  if (uniqueTypes.size > 1 && !format.allowMixedTypes) {
    return false;
  }
  
  // All flavours must individually be eligible
  return flavours.every(flavour => 
    isFormatEligibleForFlavour(format, flavour)
  );
}
