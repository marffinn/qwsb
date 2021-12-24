let $ = require('jquery')
require( 'datatables.net-dt' )()
require( './node_modules/overlayscrollbars/js/jquery.overlayScrollbars' )()
const execute = require('child_process').exec

$('body').overlayScrollbars({
    className: "os-theme-dark",
  });

let tableHeader = ` <table class="table hover row-border">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>Ping</th>
                                <th>Map</th>
                                <th>Players</th>
                            </tr>
                        </thead>
                        <tbody class="serverList">
                        <!-- here list of servers  -->
                        </tbody>
                    </table>`

let refreshMasters = () => {
    execute('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json', function (err, data) {
        if(err) return console.error(err);
        let qwServers = JSON.parse(data)

        $('.container').append(tableHeader)
        for (let i in qwServers) {
            if( qwServers[i].ping >= 60 || qwServers[i].map === undefined || qwServers[i].map === "?" ) continue
            else {
            let oneServerPrepare =
                `<tr data="${qwServers[i].address}">
                    <td class="qwsResultName"><a href="qw://${qwServers[i].address}">${qwServers[i].name}</a></td>
                    <td class="qwsResultPing">${qwServers[i].ping}</td>
                    <td class="qwsResultMap">${qwServers[i].map}</td>
                    <td class="qwsResultPlayers">${qwServers[i].numplayers}/${qwServers[i].maxplayers}</td>
                </tr>`          
                $('.serverList').append(oneServerPrepare)
            }
        }
        $('.table').DataTable( {
            stateSave: true,
            searching: false,
            paging: false
        });
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

$('body').on('click', 'a', function (e) {
    e.preventDefault()
    console.log( $(this).attr('href') )
})