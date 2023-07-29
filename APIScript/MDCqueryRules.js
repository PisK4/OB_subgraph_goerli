const axios = require('axios');
const fs = require('fs');

const dataArray = [];
//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/cabin/version/latest',{
  query: `
  {
    mdcs(where: {id: "0x09b9c0422e62b9efdbb686e6e1afe1ea7126f304"}) {
      id
      bindEBCs {
        id
        ebcList
        ebcs(
          where: {id: "0x09b9c0422e62b9efdbb686e6e1afe1ea7126f304-0x23aab544e2f2e83d9cd8ece21508f067fcbedd76"}
        ) {
          id
          latestRule {
            chain0
            chain1
            chain0Status
            chain1Status
            latestUpdateBlockNumber
            latestUpdateHash
            latestUpdateTimestamp
            latestUpdateVersion
            mdc
          }
          rulesWithRootVersion {
            root
            version
            rules {
              chain0
              chain1
              chain0Status
              chain1Status
            }
          }
        }
      }
    }
  }`
}).then((result) => {
    for (const resultGet of result.data.data.mdcs) {
        console.log(resultGet);
        dataArray.push(resultGet);
    }
    // const data = JSON.stringify(dataArray, null, 2);
    // fs.writeFile('./scriptsOutput/output.json', data, (err) => {
    //     if (err) throw err;
    // });
}).catch((error) => {
    console.log(error);
});