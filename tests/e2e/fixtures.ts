/**
 * Shared test fixtures.
 * Authentication is handled via Playwright storageState (see auth.setup.ts).
 */
import { test as base, expect } from "@playwright/test";

export const test = base.extend({});

export { expect };
