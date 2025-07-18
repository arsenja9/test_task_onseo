import { Group, Tween } from '@tweenjs/tween.js';

export const tweenGroup = new Group();

export function createTween<T>(target: T) {
    return new Tween<T>(target, tweenGroup);
}
