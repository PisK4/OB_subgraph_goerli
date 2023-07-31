const axios = require('axios');
const fs = require('fs');

const dataArray = [];

//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/obcabin/version/latest',{
    query: `
    {
      mdcs {
        bindChainIds {
          chainIdList
          chainIdMapping(where: {chainId: "324"}) {
            chainIdIndex
          }
        }
        bindDealers {
          dealerList
          dealerMapping(where: {dealerAddr: "0xab8483f64d9c6d1ecf9b849ae677dd3315835cb2"}) {
            dealerIndex
          }
        }
        bindEBCs {
          ebcList
          ebcMapping(where: {ebcAddr: "0x75b34c59e4de3a3ea506c8f8a2133a994d8974dc"}) {
            ebcIndex
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