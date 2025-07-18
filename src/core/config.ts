export const CONFIG = {
    buildingWidth: 800,
    floorHeight: 80,

    elevatorWidth: 60,
    elevatorSpeedSecPerFloor: 0.6,
    doorStopMs: 1_000,

    minSpawnDelayMs: 3_000,
    maxSpawnDelayMs: 7_000,

    personWidth: 30,
    personHeight: 50,
} as const;
export type Config = typeof CONFIG;
