export class Cow {
    constructor(images, x, canvasHeight) {
        this.images = [images.cowA, images.cowB];
        this.image = this.images[Math.floor(Math.random() * this.images.length)];

        // Scale cow image
        this.width = this.image.width * 0.5;
        this.height = this.image.height * 0.5;

        this.groundY = canvasHeight - 70 - this.height; // Estimate ground line
        this.x = x;
        this.y = this.groundY;

        this.state = 'wandering'; // 'wandering', 'abducting', 'falling', 'dead', 'abducted'
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = 0;
        this.gravity = 0.15;
        this.highestY = this.y;
        this.deadTimer = 0;
    }

    update(player, dt) {
        if (this.state === 'dead' || this.state === 'abducted') return;

        if (this.state === 'wandering') {
            this.x += this.vx;

            if (Math.random() < 0.01) {
                this.vx = (Math.random() - 0.5) * 0.6;
            }

            if (player.isBeaming && player.beamHeight > 0) {
                const bx = player.x + player.width / 2 - player.beamWidth / 2;
                const beamRight = bx + player.beamWidth;
                const cowCenterX = this.x + this.width / 2;

                if (cowCenterX > bx && cowCenterX < beamRight) {
                    this.state = 'abducting';
                    this.highestY = this.y;
                }
            }
        } else if (this.state === 'abducting') {
            const bx = player.x + player.width / 2 - player.beamWidth / 2;
            const beamRight = bx + player.beamWidth;
            const cowCenterX = this.x + this.width / 2;

            if (!player.isBeaming || cowCenterX < bx || cowCenterX > beamRight) {
                this.state = 'falling';
                this.vy = 0;
            } else {
                this.y -= 2.0; // lift speed
                this.x += (player.x + player.width / 2 - cowCenterX) * 0.05; // center in beam slowly

                if (this.y < this.highestY) this.highestY = this.y;

                // Fully abducted threshold
                const abductY = player.y + player.height * 0.6;
                if (this.y < abductY) {
                    this.state = 'abducted';
                }
            }
        } else if (this.state === 'falling') {
            this.vy += this.gravity;
            this.y += this.vy;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                const dropDist = this.groundY - this.highestY;
                if (dropDist > player.canvasHeight * 0.20) {
                    this.state = 'dead';
                    this.justExploded = true;
                } else {
                    this.state = 'wandering';
                    this.highestY = this.y;
                }
            }
        }
    }

    draw(ctx) {
        if (this.state === 'abducted') return;

        if (this.state === 'dead') {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - this.deadTimer / 60);
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
            this.deadTimer++;
            return;
        }

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
