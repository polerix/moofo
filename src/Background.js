export class Background {
    constructor(images) {
        let skies = [
            { img: images.skyA, speed: 0.05, type: 'sky' },
            { img: images.skyB, speed: 0.08, type: 'sky' },
            { img: images.skyC, speed: 0.12, type: 'sky' },
            { img: images.skyD, speed: 0.16, type: 'sky' },
            { img: images.skyE, speed: 0.20, type: 'sky' },
            { img: images.skyF, speed: 0.25, type: 'sky' },
            { img: images.skyG, speed: 0.30, type: 'sky' }
        ];

        let moon = [{ img: images.moon, speed: 0.35, isObject: true, type: 'moon' }];

        let grasses = [
            { img: images.grassA, speed: 0.40, type: 'grass' },
            { img: images.grassB, speed: 0.50, type: 'grass' },
            { img: images.grassC_1, speed: 0.55, type: 'grass' },
            { img: images.grassC, speed: 0.60, type: 'grass' },
            { img: images.grassD, speed: 0.70, type: 'grass' },
            { img: images.grassE, speed: 0.80, type: 'grass' },
            { img: images.grassF, speed: 0.90, type: 'grass' },
            { img: images.grassG, speed: 1.00, type: 'grass' }
        ];

        // Ensure we pass index and total for vertical spreading
        skies = skies.filter(l => l.img).map((l, i, arr) => new Layer({ ...l, index: i, total: arr.length }));
        moon = moon.filter(l => l.img).map(l => new Layer({ ...l, index: 0, total: 1 }));
        grasses = grasses.filter(l => l.img).map((l, i, arr) => new Layer({ ...l, index: i, total: arr.length }));

        this.layers = [...skies, ...moon, ...grasses];
    }

    update(scrollOffsetX) {
        this.layers.forEach(layer => layer.update(scrollOffsetX));
    }

    draw(ctx, canvasWidth, canvasHeight) {
        // Draw solid backdrop for grass to ensure no black canvas background is visible behind all grass layers
        ctx.fillStyle = '#0a1a0a'; // Very dark deep green
        const skySectionHeight = canvasHeight * 0.6;
        const overlapHeight = canvasHeight * 0.2;
        const grassStartY = skySectionHeight - overlapHeight;
        ctx.fillRect(0, grassStartY, canvasWidth, canvasHeight - grassStartY);

        this.layers.forEach(layer => layer.draw(ctx, canvasWidth, canvasHeight));
    }
}

class Layer {
    constructor({ img, speed, isObject = false, type = 'sky', index = 0, total = 1 }) {
        this.image = img;
        this.speedModifier = speed;
        this.isObject = isObject;
        this.type = type;
        this.index = index;
        this.total = total;
        this.width = 0;
        this.x = 0;
    }

    update(scrollOffsetX) {
        this.scrollOffsetX = scrollOffsetX;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        let drawHeight;
        let drawYs = [];

        if (this.type === 'moon') {
            drawHeight = 200;
            this.width = drawHeight * (this.image.width / this.image.height);
            drawYs.push(50);
        } else if (this.type === 'sky') {
            const sectionHeight = canvasHeight * 0.6;
            drawHeight = (sectionHeight + 100 * (this.total - 1)) / this.total;
            this.width = drawHeight * (this.image.width / this.image.height);

            const spacing = drawHeight - 100;
            let currentY = this.index * spacing;
            drawYs.push(currentY);

        } else if (this.type === 'grass') {
            const skySectionHeight = canvasHeight * 0.6;
            const overlapHeight = canvasHeight * 0.2; // 20% overlap

            // Grass needs to cover the bottom 40% + the 20% overlap = 60% of canvas
            const sectionHeight = (canvasHeight * 0.4) + overlapHeight;

            drawHeight = (sectionHeight + 100 * (this.total - 1)) / this.total;
            // Maintain original aspect ratio, do not squish
            this.width = drawHeight * (this.image.width / this.image.height);

            const spacing = drawHeight - 100;

            // Grass starts higher up, pushing into the sky section by `overlapHeight`
            let currentY = (skySectionHeight - overlapHeight) + (this.index * spacing);
            drawYs.push(currentY);
        }

        if (this.isObject) {
            let drawX = (canvasWidth / 2) - (this.scrollOffsetX * this.speedModifier) - (this.width / 2);
            ctx.drawImage(this.image, drawX, drawYs[0], this.width, drawHeight);
            return;
        }

        // Tiling logic:
        // We shift the world left by (scrollOffsetX * speedModifier).
        let rawX = -(this.scrollOffsetX * this.speedModifier);

        let startX = rawX % this.width;
        if (startX > 0) startX -= this.width; // Ensure we always start drawing offscreen to the left

        // Draw extra tiles to the left to ensure the right edge of offscreen tiles and offset copies
        // cover any transparent left-edge padding of the first on-screen tile.
        startX -= this.width * 2;

        for (let drawY of drawYs) {
            let currentX = startX;
            while (currentX < canvasWidth) {
                // Draw normal tile
                ctx.drawImage(this.image, currentX, drawY, this.width, drawHeight);
                // Draw a shifted horizontal copy to double the amount of grass and cover transparent space
                if (this.type === 'grass') {
                    ctx.drawImage(this.image, currentX + (this.width / 2), drawY, this.width, drawHeight);
                }
                currentX += this.width;
            }
        }
    }
}
