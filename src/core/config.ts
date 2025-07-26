export const CONFIG = {
    buildingWidth: 800,
    floorHeight: 80,

    elevatorWidth: 60,
    elevatorSpeedSecPerFloor: 0.6,
    doorStopMs: 1_000,

    minSpawnDelayMs: 1_000,
    maxSpawnDelayMs: 4_000,

    personWidth: 30,
    personHeight: 50,

    queueGap: 8,
    queueMargin: 12,

    maxQueuePerFloor: 5,
} as const;
export type Config = typeof CONFIG;
