let $ = require('jquery')
require( 'datatables.net-dt' )()

const execute = require('child_process').exec

let refreshMasters = () => {
    execute('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json', function (err, data) {
        if(err) return console.error(err);
        let qwServers = JSON.parse(data)
        for (let i in qwServers) {
            if( qwServers[i].ping >= 60 || qwServers[i].map === undefined || qwServers[i].map === "?" ) continue
            else {
                let oneServerPrepare =
                `<tr>
                    <td class="qwsResultName">${qwServers[i].name}</td>
                    <td class="qwsResultAddress">${qwServers[i].address}</td>
                    <td class="qwsResultPing">${qwServers[i].ping}</td>
                    <td class="qwsResultMap">${qwServers[i].map}</td>
                    <td class="qwsResultPlayers">${qwServers[i].numplayers}/${qwServers[i].maxplayers}</td>
                </tr>`          
                $('.serverList').append(oneServerPrepare)
            }
        }
        $('.table').DataTable( {
            stateSave: true,
            "searching": false,
            "lengthMenu": [[25, 50, -1], [25, 50, "All"]]
        } );
    })
}
let checkPing = (addre) => {
    execute(`qstat.exe -qws ${addre} -noconsole -json`, function (err, data) {
        let qsPing = JSON.parse(data)
        clientPing = qsPing[0].ping
        return clientPing
    })
}

refreshMasters()

