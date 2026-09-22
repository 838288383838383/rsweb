// Combines all shims into a single code string for injection into Luau

import { allTypeShims } from './TypesShim';
import { ServicesShim, GameShim } from './ServicesShim';
import { allShims } from './SignalShim';

export function buildRobloxShimCode(): string {
  return [
    '-- RSweb Roblox API Shim',
    '-- Simulates core Roblox APIs for in-browser execution',
    '',
    allTypeShims,
    '',
    ServicesShim,
    '',
    GameShim,
    '',
    allShims,
    '',
    '-- Shim loaded successfully',
  ].join('\n');
}
