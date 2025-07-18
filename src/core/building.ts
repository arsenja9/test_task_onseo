import * as PIXI from 'pixi.js';
import {CONFIG} from './config';
import {tweenGroup, createTween} from './animation';
import {Person} from './person';
import {Elevator} from './elevator';
import type {UIElements} from './types';

export class Building {
    readonly app: PIXI.Application;
    elevator: Elevator;
    readonly floors: number;

    private floorStorage: { persons: Person[] }[] = [];
    private nextPersonId = 1;
    private simulationRunning = false;

    constructor(floors: number, capacity: number, public ui: UIElements) {
        this.floors = floors;
        this.floorStorage = Array.from({length: floors}, () => ({persons: []}));

        this.app = new PIXI.Application();
        this.app
            .init({
                width: CONFIG.buildingWidth,
                height: CONFIG.floorHeight * floors,
                background: 0x1a1a2e,
                antialias: true,
            } as unknown as Partial<PIXI.ApplicationOptions>)
            .then(() => {
                ui.gameCanvas.appendChild(this.app.canvas);
                this.drawStaticGraphics();

                this.elevator = new Elevator(this, capacity);

                this.app.ticker.add(() => tweenGroup.update());
            });
    }

    startSpawning() {
        if (!this.simulationRunning) {
            this.simulationRunning = true;
            this.loopSpawn();
        }
    }

    stopSpawning() {
        this.simulationRunning = false;
    }

    getFloorY(floor: number): number {
        return (this.floors - 1 - floor) * CONFIG.floorHeight;
    }

    placePerson(person: Person, floor: number) {
        person.pixi.position.set(
            CONFIG.buildingWidth - CONFIG.personWidth - 20,
            this.getFloorY(floor) + (CONFIG.floorHeight - CONFIG.personHeight) / 2
        );
        this.floorStorage[floor].persons.push(person);
        this.app.stage.addChild(person.pixi);
    }

    removePerson(person: Person) {
        const arr = this.floorStorage[person.currentFloor].persons;
        arr.splice(arr.indexOf(person), 1);
        this.app.stage.removeChild(person.pixi);
    }

    removePersonFromFloor(person: Person) {
        const arr = this.floorStorage[this.elevator.currentFloor].persons;
        arr.splice(arr.indexOf(person), 1);
        this.updateFloorLayout(this.elevator.currentFloor);
    }

    getPersonsAtFloor(floor: number) {
        return this.floorStorage[floor].persons;
    }

    private updateFloorLayout(floor: number) {
        const arr = this.floorStorage[floor].persons;
        if (!arr.length) return;
        createTween(arr[0].pixi.position)
            .to(
                {
                    x: CONFIG.buildingWidth - CONFIG.personWidth - 20,
                    y: this.getFloorY(floor) + (CONFIG.floorHeight - CONFIG.personHeight) / 2,
                },
                400
            )
            .start();
    }

    private spawnPerson() {
        const startFloor = Math.floor(Math.random() * this.floors);
        if (this.floorStorage[startFloor].persons.length) return;

        let targetFloor: number;
        do {
            targetFloor = Math.floor(Math.random() * this.floors);
        } while (targetFloor === startFloor);

        const person = new Person(
            this.nextPersonId++,
            startFloor,
            targetFloor,
            this
        );
        setTimeout(() => person.moveToElevator(), 900);
    }

    private loopSpawn() {
        if (!this.simulationRunning) return;

        this.spawnPerson();
        setTimeout(
            () => this.loopSpawn(),
            Math.random() * (CONFIG.maxSpawnDelayMs - CONFIG.minSpawnDelayMs) +
            CONFIG.minSpawnDelayMs
        );
    }

    private drawStaticGraphics() {
        for (let i = 0; i < this.floors; i++) {
            const y = (i + 1) * CONFIG.floorHeight;
            this.app.stage.addChild(
                new PIXI.Graphics()
                    .stroke({width: 2, color: 0x3498db, alpha: 0.4})
                    .moveTo(0, y)
                    .lineTo(CONFIG.buildingWidth, y)
            );

            const label = new PIXI.Text(String(this.floors - i), {
                fontSize: 16,
                fill: 0xecf0f1,
            });
            label.position.set(10, i * CONFIG.floorHeight + 10);
            this.app.stage.addChild(label);
        }

        this.app.stage.addChild(
            new PIXI.Graphics()
                .stroke({width: 3, color: 0x7f8c8d})
                .moveTo(CONFIG.elevatorWidth + 40, 0)
                .lineTo(CONFIG.elevatorWidth + 40, this.floors * CONFIG.floorHeight)
        );
    }
}
