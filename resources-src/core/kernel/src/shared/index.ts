/**
 * Core Kernel - Shared Definitions
 *
 * This file contains constants, types, and logic that are safely executable
 * on both the server and the client environments.
 */

export const KERNEL_RESOURCE_NAME = 'core-kernel';

export interface KernelServiceManifest {
  name: string;
  version: string;
  ready: boolean;
}
