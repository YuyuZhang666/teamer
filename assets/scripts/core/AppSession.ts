import type { AppPhase } from './AppPhase.ts';

export interface AppSessionSnapshot {
  phase: AppPhase;
  error: string | undefined;
}

export class AppSession {
  private currentPhase: AppPhase = 'cold';
  private currentError: string | undefined;

  get phase(): AppPhase {
    return this.currentPhase;
  }

  start(): void {
    this.transition('booting', ['cold']);
  }

  ready(): void {
    this.transition('ready', ['booting']);
  }

  fail(message: string): void {
    this.transition('failed', ['cold', 'booting']);
    this.currentError = message || 'Unknown startup failure';
  }

  snapshot(): Readonly<AppSessionSnapshot> {
    return Object.freeze({
      phase: this.currentPhase,
      error: this.currentError,
    });
  }

  private transition(nextPhase: AppPhase, allowedPhases: AppPhase[]): void {
    if (!allowedPhases.includes(this.currentPhase)) {
      throw new Error(`Cannot transition from ${this.currentPhase} to ${nextPhase}`);
    }

    this.currentPhase = nextPhase;
  }
}
