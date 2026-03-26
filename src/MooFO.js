export class moofo {
    constructor(images, canvasWidth, canvasHeight) {
        this.image = images.mooUfo;
        this.beamImage = images.mooUfoBeam;

        // Size relative to some standard or fixed
        this.width = this.image.width * 0.5; // Scale down
        this.height = this.image.height * 0.5;

        this.x = canvasWidth / 2 - this.width / 2;
        this.y = 100; // Start near top

        this.vx = 0;
        this.vy = 0;

        this.speed = 0.8;
        this.friction = 0.92;
        this.gravity = 0.08; // light gravity / drift

        this.isBeaming = false;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Beam properties
        this.beamWidth = this.beamImage.width * 0.5;
        this.beamHeight = 0;
        this.maxBeamHeight = canvasHeight; // Beam reaches the ground
    }

    update(input, dt) {
        // Check if beam should be toggled
        if (input.wasJustPressed('Space')) {
            this.isBeaming = !this.isBeaming;
        }

        // If beaming, check if user tries to move to cancel beam
        if (this.isBeaming && input.hasMovementInput()) {
            this.isBeaming = false;
        }

        if (!this.isBeaming) {
            // Normal movement
            const move = input.getMovementVector();
            this.vx += move.dx * this.speed;
            this.vy += move.dy * this.speed;
        }

        // Apply gravity continuously (drift down)
        this.vy += this.gravity;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundaries constraints
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
            this.vx = 0;
        }

        // Y bounds
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }
        // Ground collision approx (assuming ground is bottom 100px)
        const groundLevel = this.canvasHeight - 100;
        if (this.y + this.height > groundLevel) {
            this.y = groundLevel - this.height;
            this.vy = 0;
        }

        // Update beam height if beaming (animate down to ground)
        if (this.isBeaming) {
            const targetHeight = this.canvasHeight - (this.y + this.height * 0.8);
            this.beamHeight += (targetHeight - this.beamHeight) * 0.2; // ease out
        } else {
            this.beamHeight = 0;
        }
    }

    draw(ctx) {
        // Draw beam behind the UFO if active
        if (this.isBeaming && this.beamHeight > 0) {
            // Center beam below the UFO
            const bx = this.x + this.width / 2 - this.beamWidth / 2;
            const by = this.y + this.height * 0.6; // slightly inside bottom of UFO
            ctx.drawImage(this.beamImage, bx, by, this.beamWidth, this.beamHeight);
        }

        // Draw moofo
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
