const axios = require('axios');
const fs = require('fs');

const dataArray = [];

//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/obcabin/version/latest',{
    query: `
    {
      mdcs {
        ebc {
          id
        }
        dealer {
          id
        }
        ebcSnapshot {
          latestUpdateTimestamp
          ebcMapping {
            ebcAddr
            ebcIndex
          }
        }
        ruleSnapshot(where: {ebc_: {id: "0xb3d1b704dd7f7acf9fddcee2868388838f859e0f"}}) {
          latestUpdateTimestamp
          latestUpdateHash
          root
          version
          rules {
            chain0
            chain1
          }
        }
      }
    }`
}).then((result) => {
    for (const resultGet of result.data.data.mdcs) {
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