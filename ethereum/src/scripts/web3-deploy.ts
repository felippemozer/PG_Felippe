// Use Right click -> "Run" from context menu of the file to run the script. Shortcut: Ctrl+Shift+S

import { deploy } from './web3-lib';
import { data } from '../data/feeds.json';

/**
 * Get some random data feeds hash in the feeds.json file
 * @returns Some of the data feeds hashes to be included in the contract
 */
function getRandomHash() {
    const props = Object.getOwnPropertyNames(data.rinkeby.hashes);
    const index = Math.floor(Math.random() * props.length);
    const propName = props[index];
    const someHash = data.rinkeby.hashes[propName];

    return [propName, someHash];
}

const hash = getRandomHash();

(async () => {
    try {
        console.log(`Calling PriceConsumer to ${hash[0]}`);
        const result = await deploy('PriceConsumer', [hash[1]]);
        console.log(result);
    } catch (e) {
        console.log(e.message);
    }
})()
