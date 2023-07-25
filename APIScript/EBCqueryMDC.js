const axios = require('axios');
const fs = require('fs');

const dataArray = [];

axios.post('https://api.studio.thegraph.com/query/49058/obcabin/version/latest',{
    query: `
    {
        ebcmanagers {
          id
          ebcCounts
          ebcs {
            id
            mdcList {
              id
              owner
            }
            statuses
          }
        }
      }`
}).then((result) => {
    for (const resultGet of result.data.data.ebcmanagers) {
        console.log(resultGet);
        dataArray.push(resultGet);
    }
    const data = JSON.stringify(dataArray, null, 2);
    // fs.writeFile('./scriptsOutput/output.json', data, (err) => {
    //     if (err) throw err;
    // });
}).catch((error) => {
    console.log(error);
});