let $ = require('jquery')
const execute = require('child_process').exec
const qw = require('./node_modules/quakeworld/quakeworld')
const fs = require('fs')

let qwServers = null


let checkPing = (addre) => {
    let svAddr = addre
    let pingX = null
    execute(`qstat.exe -qws ${svAddr} -old`, function (err, data) {
        if (err) {
            console.log(err)
        } else {
            pingX = data.toString()
            console.log(pingX);
            console.log(pingX);
        }
    })
}
checkPing("dm6.uk:27500")
// fs.readFile('servers.json', (err, data) => {
//     if (err) throw err
//     qwServers = JSON.parse(data)

//     for (let i in qwServers) {

//         let serverAddress = qwServers[i].address
//         // let serverPing = checkPing(serverAddress)

//         let serverIP = serverAddress.split(':')[0]
//         let serverPort = serverAddress.split(':')[1]

//         qw(serverIP, serverPort, 'status', [31], function (err, data) {
//             if (err) console.log('ERROR: ', err)
//             let oneServerPrepare =
//                 `<tr>
//                             <td>${data.hostname}</td>
//                             <td>${serverPing}</td>
//                             <td>${data.map}</td>
//                             <td>${data.players.length}/${data.maxclients}</td>
//                         </tr>`
//             $('.serverList').append(oneServerPrepare)
//             console.log(data)
//         })


//     }
// });

let refreshMasters = () => {
    execute('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json -of data/servers.json', function (err, data) {
        console.log(err)
        console.log(data.toString())
    });
}