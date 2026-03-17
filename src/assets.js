// src/assets.js

import cowA from '../1x/Cow-A.png';
import cowB from '../1x/Cow-B.png';
import mibCar from '../1x/MIB - Car.png';
import mooUfo from '../1x/mooUFO.png';
import mooUfoBeam from '../1x/MooFO Beam.png';
import moon from '../1x/MooN.png';

// Background layers
import skyA from '../1x/MooFO - Sky-A.png';
import skyB from '../1x/MooFO - Sky-B.png';
import skyC from '../1x/MooFO - Sky-C.png';
import skyD from '../1x/MooFO - Sky-D.png';
import skyE from '../1x/MooFO - Sky-E.png';
import skyF from '../1x/MooFO - Sky-F.png';
import skyG from '../1x/MooFO - Sky-G.png';

import grassA from '../1x/MooFO - Grass-A.png';
import grassB from '../1x/MooFO - Grass-B.png';
import grassC_1 from '../1x/MooFO - Grass-C_1.png';
import grassC from '../1x/MooFO - Grass-C.png';
import grassD from '../1x/MooFO - Grass-D.png';
import grassE from '../1x/MooFO - Grass-E.png';
import grassF from '../1x/MooFO - Grass-F.png';
import grassG from '../1x/MooFO - Grass-G.png';

const imageUrls = {
    cowA,
    cowB,
    mibCar,
    mooUfo,
    mooUfoBeam,
    moon,
    skyA, skyB, skyC, skyD, skyE, skyF, skyG,
    grassA, grassB, grassC_1, grassC, grassD, grassE, grassF, grassG
};

export const images = {};

export function loadAssets() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalImages = Object.keys(imageUrls).length;

        for (const [key, url] of Object.entries(imageUrls)) {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                images[key] = img;
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve(images);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                reject(new Error(`Failed to load image: ${url}`));
            };
        }
    });
}
