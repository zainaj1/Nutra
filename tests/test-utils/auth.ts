/// <reference types="jest" />

import * as Clerk from '@clerk/expo';

export const loadedAuth = { isLoaded: true, isSignedIn: true };
export const signedOutAuth = { isLoaded: true, isSignedIn: false };

export function mockLoadedAuth() {
  jest.mocked(Clerk.useAuth).mockReturnValue(loadedAuth as never);
}

export function mockSignedOutAuth() {
  jest.mocked(Clerk.useAuth).mockReturnValue(signedOutAuth as never);
}
