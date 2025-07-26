import * as PIXI from 'pixi.js';
import { CONFIG } from './config';
import { createTween } from './animation';
import type { Direction, PersonState } from './types';
import type { Building } from './building';

export class Person {
    readonly id: number;
    readonly startFloor: number;
    readonly targetFloor: number;
    readonly direction: Direction;
    state: PersonState = 'waiting';
    currentFloor: number;

    private readonly view: PIXI.Container<any>

    constructor(id: number, start: number, target: number, private building: Building) {
        this.id = id;
        this.startFloor = start;
        this.currentFloor = start;
        this.targetFloor = target;
        this.direction = target > start ? 'up' : 'down';

        this.view = new PIXI.Container();

        const body = new PIXI.Graphics()
            .fill({ color: this.direction === 'up' ? 0x4facfe : 0x00c9a7 })
            .roundRect(0, 0, CONFIG.personWidth, CONFIG.personHeight, 5)
            .fill();
        this.view.addChild(body);

        const label = new PIXI.Text(String(target + 1), {
            fontSize: 16,
            fill: 0xffffff,
            fontWeight: 'bold',
        });
        label.anchor.set(0.5);
        label.position.set(CONFIG.personWidth / 2, CONFIG.personHeight / 2);
        this.view.addChild(label);

        building.placePerson(this, start);
    }

    moveToElevator() {
        if (this.state !== 'waiting') return;
        this.state = 'walking';

        this.building.elevator.enqueuePassenger(this);


        const idx = this.building.getQueueIndex(this.currentFloor);
        const targetX = this.building.queueX(idx);

        createTween(this.view.position)
            .to({ x: targetX }, 1_200)
            .onComplete(() => {
                this.state = 'waiting';
                this.building.shiftQueue(this.currentFloor);
            })
            .start();
    }

    enterElevator() {
        this.state = 'in';
        this.view.visible = false;
    }

    leaveElevator() {
        this.state = 'out';
        this.view.visible = true;
        this.view.position.set(
            CONFIG.elevatorWidth + 20,
            this.building.getFloorY(this.currentFloor)
        );

        createTween(this.view.position)
            .to({ x: CONFIG.buildingWidth - CONFIG.personWidth - 20 }, 2_000)
            .onComplete(() => this.building.removePerson(this))
            .start();
    }

    get pixi(): PIXI.Container<any> {
        return this.view;
    }
}