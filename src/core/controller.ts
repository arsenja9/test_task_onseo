import { Building } from './building';
import type { UIElements } from './types';

export class Controller {
    private building: Building | null = null;

    constructor(private ui: UIElements) {
        (document.getElementById('startBtn') as HTMLButtonElement).onclick = () =>
            this.init();
        (document.getElementById('resetBtn') as HTMLButtonElement).onclick = () =>
            this.reset();

        window.addEventListener('DOMContentLoaded', () =>
            setTimeout(() => this.init(), 300)
        );
    }

    init() {
        const floorInput = document.getElementById(
            'floorCount'
        ) as HTMLInputElement;
        const capacityInput = document.getElementById(
            'elevatorCapacity'
        ) as HTMLInputElement;

        const floors = Math.max(4, Math.min(+floorInput.value || 7, 10));
        const capacity = Math.max(2, Math.min(+capacityInput.value || 3, 4));

        this.ui.gameCanvas.innerHTML = '';
        ['currentFloor', 'passengerCount', 'transportedCount'].forEach((id) => {
            this.ui[id as keyof UIElements].textContent = '0';
        });
        this.ui.direction.textContent = 'СТОП';
        this.ui.nextFloor.textContent = this.ui.elevatorPassengers.textContent = '-';

        this.ui.statusMessage.textContent = `Старт: ${floors} поверхів, місткість ${capacity}`;
        this.ui.statusMessage.className = 'status-message success';

        this.building = new Building(floors, capacity, this.ui);
        this.building.startSpawning();
    }

    reset() {
        this.ui.statusMessage.textContent = 'Симуляцію зупинено.';
        this.ui.statusMessage.className = 'status-message';
        if (this.building) {
            this.building.stopSpawning();
            this.ui.gameCanvas.innerHTML = '';
        }
        this.building = null;
        ['currentFloor', 'passengerCount', 'transportedCount'].forEach((id) => {
            this.ui[id as keyof UIElements].textContent = '0';
        });
        this.ui.direction.textContent = 'СТОП';
        this.ui.nextFloor.textContent = this.ui.elevatorPassengers.textContent = '-';
    }
}
