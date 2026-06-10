export const MU = [0.42, 0.4] as const;
export const BETA = [0.62, 0.52] as const;
export const BRANCHING = [
  [0.6, 0.02],
  [0.038, 0.6],
] as const;
export const ALPHA = [
  [BRANCHING[0][0] * BETA[0], BRANCHING[0][1] * BETA[1]],
  [BRANCHING[1][0] * BETA[0], BRANCHING[1][1] * BETA[1]],
] as const;
export const BRANCHING_RATIO = 0.62;
export const LAMBDA_CAP = 12;
export const WINDOW = 20;
export const LOOKAHEAD = 2;
export const START_TIME = 22;
export const SEED = 0x51ab1e;

export type Tier = { hz: number; smear: boolean; cursor: boolean };
export const tiers: Record<"full" | "mini", Tier> = {
  full: { hz: 60, smear: true, cursor: true },
  mini: { hz: 30, smear: false, cursor: false },
};
