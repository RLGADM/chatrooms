import { GameParameters, GameState, Phase, Round } from '@/types/interfaces';

export function createNewRound(roundIndex: number): Round {
  return {
    roundIndex,
    phases: [],
    currentPhase: 0,
  };
}

export function createPhaseFromParameters(phaseIndex: number): Phase {
  return {
    phaseIndex,
    status: 'waiting',
    timer: 0,
  };
}

export function createInitialGameState(params: GameParameters): GameState {
  return {
    status: 'waiting',
    currentRound: 0,
    rounds: [],
    spectators: [],
    teams: {
      red: { score: 0, sage: null, disciples: [] },
      blue: { score: 0, sage: null, disciples: [] },
    },
    gameParameters: params, // ici on insère les choix de la page d’accueil
  };
}
