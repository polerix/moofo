export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.justPressed = new Set();

        window.addEventListener('keydown', e => {
            // Prevent spacebar scrolling
            if (e.code === 'Space') e.preventDefault();

            if (!this.keys.has(e.code)) {
                this.justPressed.add(e.code);
            }
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', e => {
            this.keys.delete(e.code);
        });
    }

    isDown(code) {
        return this.keys.has(code);
    }

    wasJustPressed(code) {
        const pressed = this.justPressed.has(code);
        if (pressed) this.justPressed.delete(code);
        return pressed;
    }

    hasMovementInput() {
        return this.isDown('KeyW') || this.isDown('KeyA') || this.isDown('KeyS') || this.isDown('KeyD') ||
            this.isDown('ArrowUp') || this.isDown('ArrowDown') || this.isDown('ArrowLeft') || this.isDown('ArrowRight');
    }

    getMovementVector() {
        let dx = 0;
        let dy = 0;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) dx -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) dx += 1;
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) dy -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) dy += 1;

        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        return { dx, dy };
    }

    clearJustPressed() {
        this.justPressed.clear();
    }
}
