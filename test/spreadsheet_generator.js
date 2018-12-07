const fs = require('fs');
const path = require('path');

const Roll = require('../classes/Roll');

const REPEAT = 1000000;
console.log(`Repeating each roll ${REPEAT} times.`);

let csv = ['Threshold,Difficulty,Pool,Average Total Successes,Average on Success,Success Rate,Failure Rate,Botch Rate'];

for (let threshold = 0; threshold <= 3; threshold++) {
    for (let difficulty = 3; difficulty <= 10; difficulty++) {
        for (let pool = 1; pool <= 10; pool++) {
            let successCount = 0;
            let successTotal = 0;
            let failureCount = 0;
            let botchCount = 0;
            let results = [];
            for (let i = 0; i < REPEAT; i++) {
                let roll = new Roll({pool, difficulty, threshold});
                if (roll.succeeded) {
                    successCount++;
                    successTotal += roll.result;
                }
                else if (roll.failed) failureCount++;
                else if (roll.botched) botchCount++;
                else throw new Error("How did it neither succeed, nor fail, nor botch?");
                results.push(roll.result);
            }

            let averageSuccessesTotal = (successTotal / REPEAT).toFixed(2);
            let averageSuccessesOnSuccess = (successTotal / successCount).toFixed(2);
            let successPercent = (successCount / REPEAT * 100).toFixed(2);
            let failurePercent = (failureCount / REPEAT * 100).toFixed(2);
            let botchPercent = (botchCount / REPEAT * 100).toFixed(2);

            let output = [''];
            output.push(`Pool: ${pool}, Difficulty: ${difficulty}, Threshold: ${threshold}:`);
            output.push(`\tAverage Successes: ${averageSuccessesTotal}`);
            output.push(`\tSuccess Rate: ${successPercent}% (${successCount}) (Avg. ${averageSuccessesOnSuccess})`);
            output.push(`\tFailure Rate: ${failurePercent}% (${failureCount})`);
            output.push(`\tBotch Rate: ${botchPercent}% (${botchCount})`);
            console.log(output.join('\n'));

            let csvValues = [
                threshold,
                difficulty,
                pool,
                averageSuccessesTotal,
                averageSuccessesOnSuccess,
                successPercent,
                failurePercent,
                botchPercent
            ];
            csv.push(csvValues.map(cell => cell.toString()).join(','));
        }
    }
}

let filepath = path.join(__dirname, '..', 'roll-spreadsheet.csv');
console.log('\nWriting to file:', filepath);
fs.writeFile(filepath, csv.join('\n'), 'utf8', error => {
   if (error) console.error(error);
   else console.log('Done.');
});


