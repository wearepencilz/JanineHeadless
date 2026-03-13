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
