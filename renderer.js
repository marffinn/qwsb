let $ = require('jquery')

const execute = require('child_process').exec
const qw = require('./utils/quakeworld')
const fs = require('fs')


fs.readFile('data/servers.json', (err, data) => {
    if (err) throw err
    let qwServers = JSON.parse(data)
    let clientPing = null
    $('.serverList').empty()

    for (let i in qwServers) {
        let serverAddress = qwServers[i].address
        execute(`qstat.exe -qws ${serverAddress} -noconsole -json`, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                qstatPing = JSON.parse(data)
                clientPing = qstatPing[0].ping
            }
        })

        let serverIP = serverAddress.split(':')[0]
        let serverPort = serverAddress.split(':')[1]

        qw(serverIP, serverPort, 'status', [31], function (err, data) {
            if (err) console.log('ERROR: ', err)
            let oneServerPrepare =
                `<tr>
                    <td>${data.hostname}</td>
                    <td>${clientPing}</td>
                    <td>${data.map}</td>
                    <td>${data.players.length}/${data.maxclients}</td>
                </tr>`          
            $('.serverList').append(oneServerPrepare)
        })
    }
});

let refreshMasters = () => {
    execute('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json -of data/servers.json', function (err, data) {
        console.log(err)
        console.log(data.toString())
    });
}
let checkPing = (addre) => {
    execute(`qstat.exe -qws ${addre} -noconsole -json`, function (err, data) {
        if (err) {
            console.log(err)
        } else {
            let qsPing = JSON.parse(data)
            clientPing = qsPing[0].ping
        }
    })
}