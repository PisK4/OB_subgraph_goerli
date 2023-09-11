const axios = require('axios');
const fs = require('fs');

const dataArray = [];

//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/cabin/version/latest',{
    query: `
    {
      mdcs (where: {owner: "0x15962f38e6998875f9f75acdf8c6ddc743f11041"}){
        id
        owner
        mapping{
          dealerMapping{
            id
            dealerAddr
            dealerIndex
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