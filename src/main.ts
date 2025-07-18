import { Controller } from './core/controller';
import type { UIElements } from './core/types';

window.addEventListener('DOMContentLoaded', () => {
    const ui: UIElements = {
        currentFloor: document.getElementById('currentFloor') as HTMLDivElement,
        nextFloor: document.getElementById('nextFloor') as HTMLDivElement,
        passengerCount: document.getElementById('passengerCount') as HTMLDivElement,
        transportedCount: document.getElementById('transportedCount') as HTMLDivElement,
        elevatorPassengers: document.getElementById('elevatorPassengers') as HTMLDivElement,
        direction: document.getElementById('direction') as HTMLDivElement,
        statusMessage: document.getElementById('statusMessage') as HTMLDivElement,
        gameCanvas: document.getElementById('gameCanvas') as HTMLDivElement,
    };

    new Controller(ui);
});
