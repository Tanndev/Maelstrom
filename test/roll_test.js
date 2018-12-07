/*
 * Copyright (c) 2018 James Tanner
 */

const Roll = require('../classes/Roll');

const REPEAT = 1000000;
console.log(`Repeating each roll ${REPEAT} times.`);

const difficulty = 6;
for (let pool = 2; pool <= 8; pool++){
    let successCount = 0;
    let successTotal = 0;
    let failureCount = 0;
    let botchCount = 0;
    let results = [];
    for (let i = 0; i < REPEAT; i++){
        let roll = new Roll({pool, difficulty});
        if (roll.succeeded){
            successCount++;
            successTotal += roll.result;
        }
        else if (roll.failed) failureCount++;
        else if (roll.botched) botchCount++;
        else throw new Error("How did it neither succeed, nor fail, nor botch?");
        results.push(roll.result);

        console.log(roll.toString());
    }

    let successAverage =  (successTotal / successCount).toFixed(2);
    let successPercent = (successCount / REPEAT * 100).toFixed(2);
    let failurePercent = (failureCount / REPEAT * 100).toFixed(2);
    let botchPercent = (botchCount / REPEAT * 100).toFixed(2);

    let output = [''];
    output.push(`Pool: ${pool}, Difficulty: ${difficulty}:`);
    output.push(`\tSuccesses: ${successCount} (${successPercent}%) (Avg. ${successAverage})`);
    output.push(`\tFailures: ${failureCount} (${failurePercent}%)`);
    output.push(`\tBotches: ${botchCount} (${botchPercent}%)`);
    console.log(output.join('\n'));
}
