export class MIBCar {
    constructor(images, canvasWidth, canvasHeight, targetX) {
        this.image = images.mibCar;
        this.width = this.image.width * 0.5;
        this.height = this.image.height * 0.5;

        this.y = canvasHeight - 80 - this.height; // approximate ground

        // Spawn offscreen either left or right depending on target
        if (targetX > canvasWidth / 2) {
            this.x = targetX + 1500;
            this.vx = -4; // drive left
        } else {
            this.x = targetX - 1500;
            this.vx = 4; // drive right
        }

        this.targetX = targetX;
        this.state = 'driving'; // driving, investigating
        this.investigateTimer = 0;
    }

    update(dt) {
        if (this.state === 'driving') {
            this.x += this.vx;
            if (Math.abs(this.x - this.targetX) < 10) {
                this.state = 'investigating';
            }
        } else if (this.state === 'investigating') {
            this.investigateTimer += dt;
            if (this.investigateTimer > 10000) { // stay for 10s
                this.state = 'leaving';
                this.vx = -this.vx; // drive away
            }
        } else if (this.state === 'leaving') {
            this.x += this.vx;
        }
    }

    draw(ctx) {
        // Basic draw
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
