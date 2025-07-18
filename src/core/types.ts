export type Direction = 'up' | 'down' | 'stop';
export type PersonState = 'waiting' | 'walking' | 'in' | 'out';

export interface UIElements {
    currentFloor: HTMLDivElement;
    nextFloor: HTMLDivElement;
    passengerCount: HTMLDivElement;
    transportedCount: HTMLDivElement;
    elevatorPassengers: HTMLDivElement;
    direction: HTMLDivElement;
    statusMessage: HTMLDivElement;
    gameCanvas: HTMLDivElement;
}
