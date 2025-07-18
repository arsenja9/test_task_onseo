import * as PIXI from 'pixi.js';
import { CONFIG } from './config';
import { createTween } from './animation';
import type { Direction } from './types';
import type { Person } from './person';
import type { Building } from './building';

export class Elevator {
    currentFloor = 0;
    direction: Direction = 'stop';
    nextFloor: number | null = null;

    private readonly passengers: Person[] = [];
    private boardingQueue: Person[] = [];
    private isMoving = false;

    private readonly view: PIXI.Container<any>;
    private readonly doorLeft: PIXI.Graphics;
    private readonly doorRight: PIXI.Graphics;
    private readonly indicator: PIXI.Text;

    constructor(private building: Building, private capacity: number) {
        this.view = new PIXI.Container();

        const cab = new PIXI.Graphics()
            .fill({ color: 0xff6b6b })
            .roundRect(0, 0, CONFIG.elevatorWidth, CONFIG.floorHeight - 2, 5)
            .fill();
        this.view.addChild(cab);

        this.doorLeft = new PIXI.Graphics()
            .fill({ color: 0xe74c3c })
            .rect(0, 0, CONFIG.elevatorWidth / 2, CONFIG.floorHeight - 2)
            .fill();
        this.doorRight = new PIXI.Graphics()
            .fill({ color: 0xe74c3c })
            .rect(CONFIG.elevatorWidth / 2, 0, CONFIG.elevatorWidth / 2, CONFIG.floorHeight - 2)
            .fill();
        this.view.addChild(this.doorLeft, this.doorRight);

        this.view.position.set(20, building.getFloorY(0));
        building.app.stage.addChild(this.view);

        this.indicator = new PIXI.Text('1', {
            fontSize: 18,
            fill: 0xffffff,
            fontWeight: 'bold',
        });
        this.indicator.anchor.set(0.5);
        this.indicator.position.set(CONFIG.elevatorWidth / 2, -20);
        this.view.addChild(this.indicator);
    }

    enqueuePassenger(person: Person) {
        if (!this.boardingQueue.includes(person)) this.boardingQueue.push(person);

        if (this.direction === 'stop' && !this.isMoving) this.updateDirection();
    }

    private updateUI() {
        const ui = this.building.ui;
        ui.nextFloor.textContent =
            this.nextFloor !== null ? String(this.nextFloor + 1) : '-';
        ui.passengerCount.textContent = String(this.passengers.length);
        ui.elevatorPassengers.textContent =
            this.passengers.map((p) => p.targetFloor + 1).join(', ') || '-';
    }

    private hasActionOnFloor(floor: number): boolean {
        const somebodyExits = this.passengers.some((p) => p.targetFloor === floor);
        const somebodyWaits = this.building
            .getPersonsAtFloor(floor)
            .some(
                (p) =>
                    p.state === 'waiting' &&
                    (this.passengers.length ? p.direction === this.direction : true)
            );
        return somebodyExits || somebodyWaits;
    }

    private chooseNextFloor(): number | null {
        if (this.hasActionOnFloor(this.currentFloor)) return this.currentFloor;

        const step = this.direction === 'up' ? 1 : -1;
        for (
            let f = this.currentFloor + step;
            f >= 0 && f < this.building.floors;
            f += step
        )
            if (this.hasActionOnFloor(f)) return f;

        this.direction = this.direction === 'up' ? 'down' : 'up';
        this.building.ui.direction.textContent =
            this.direction === 'up' ? 'ВГОРУ' : 'ВНИЗ';

        const reverseStep = this.direction === 'up' ? 1 : -1;
        for (
            let f = this.currentFloor + reverseStep;
            f >= 0 && f < this.building.floors;
            f += reverseStep
        )
            if (this.hasActionOnFloor(f)) return f;

        this.direction = 'stop';
        this.building.ui.direction.textContent = 'СТОП';
        return null;
    }

    private updateDirection() {
        if (!this.passengers.length && this.boardingQueue.length) {
            this.direction = this.boardingQueue[0].direction;
        } else if (this.direction === 'stop' && this.passengers.length) {
            this.direction =
                this.passengers[0].targetFloor > this.currentFloor ? 'up' : 'down';
        }

        this.nextFloor = this.chooseNextFloor();
        this.updateUI();
        if (this.nextFloor !== null && !this.isMoving) this.travel();
    }

    private travel() {
        if (this.nextFloor === null) {
            this.updateUI();
            return;
        }
        if (this.nextFloor === this.currentFloor) {
            this.stopAtFloor();
            return;
        }

        this.isMoving = true;
        this.building.ui.direction.textContent =
            this.direction === 'up' ? 'ВГОРУ' : 'ВНИЗ';
        this.building.ui.currentFloor.textContent = String(this.nextFloor + 1);

        const durationMs =
            Math.abs(this.nextFloor - this.currentFloor) *
            CONFIG.elevatorSpeedSecPerFloor *
            1_000;

        createTween(this.view.position)
            .to({ y: this.building.getFloorY(this.nextFloor) }, durationMs)
            .onComplete(() => {
                this.currentFloor = this.nextFloor!;
                this.isMoving = false;
                this.stopAtFloor();
            })
            .start();

        createTween({})
            .to({}, durationMs)
            .onUpdate(() => {
                this.indicator.text = String(this.currentFloor + 1);
            })
            .start();
    }

    private stopAtFloor() {
        this.passengers
            .filter((p) => p.targetFloor === this.currentFloor)
            .forEach((p) => this.exitPassenger(p));

        const waiting = this.building
            .getPersonsAtFloor(this.currentFloor)
            .filter(
                (p) =>
                    p.state === 'waiting' &&
                    (this.passengers.length ? p.direction === this.direction : true)
            );

        waiting
            .slice(0, this.capacity - this.passengers.length)
            .forEach((p) => this.enterPassenger(p));

        if (!this.hasActionOnFloor(this.currentFloor)) {
            this.nextFloor = this.chooseNextFloor();
            this.updateUI();
            this.travel();
            return;
        }

        this.openDoors();
        this.updateUI();
        setTimeout(() => {
            this.closeDoors();
            setTimeout(() => {
                this.nextFloor = this.chooseNextFloor();
                this.updateUI();
                this.travel();
            }, 300);
        }, CONFIG.doorStopMs);
    }

    private enterPassenger(person: Person) {
        this.passengers.push(person);
        this.boardingQueue = this.boardingQueue.filter((p) => p.id !== person.id);
        this.building.removePersonFromFloor(person);
        person.enterElevator();
    }

    private exitPassenger(person: Person) {
        this.passengers.splice(this.passengers.indexOf(person), 1);
        person.currentFloor = this.currentFloor;
        person.leaveElevator();
        this.building.ui.transportedCount.textContent = String(
            +this.building.ui.transportedCount.textContent + 1
        );
    }

    private openDoors() {
        createTween(this.doorLeft.position)
            .to({ x: -CONFIG.elevatorWidth / 2 }, 300)
            .start();
        createTween(this.doorRight.position)
            .to({ x: CONFIG.elevatorWidth / 2 }, 300)
            .start();
    }

    private closeDoors() {
        createTween(this.doorLeft.position).to({ x: 0 }, 300).start();
        createTween(this.doorRight.position)
            .to({ x: CONFIG.elevatorWidth / 2 }, 300)
            .start();
    }
}
