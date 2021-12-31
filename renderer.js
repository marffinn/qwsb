const $ = require('jquery')
const exe = require('child_process').exec
const qw = require('./data/scripts/quakeworld')
const ls = require('./data/scripts/levelshots')


// event listeners ////////////////////////////////////////////////////////////////////////////

$('body').on('click', 'a', function (e) {
    e.preventDefault()
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})
$('.modalNav span').on('click', () => {
    $('.modal').animate({
        'left': '100%'
    }, 200)
})
// event listeners END ////////////////////////////////////////////////////////////////////////////

// methods ////////////////////////////////////////////////////////////////////////////
let checkServer = (addre) => {

    $('.modalSvName, .modalMap, .modalSvName, .modalPlayers, .modalMapPic ').empty()

    let serverIP = addre.split(':')[0]
    let serverPort = addre.split(':')[1]
    qw(serverIP, serverPort, 'status', [31], function (err, data) {

        console.log(data)
        if (err) console.log('ERROR: ', err)

        // console.log(data)

        $('.modal .content .modalSvName').append(data.hostname)
        $('.modal .content .modalMap').append(data.map)
        $('.modal .content .modalMapPic').append('<img src="'+__dirname+'/data/images/mapshots/'+ data.map +'.jpg" alt="data.map"></img>')
        if(data.players){
            for(let i in data.players )
            $('.modalPlayers').append(data.players[i].name + '<br>')
        }
        console.log(data.players);
        $('.modal').animate({ 'left': '0' }, 200)
    })
}

let refreshMasters = () => {
    exe('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json', function (err, data) {
        if(err) return console.error(err);
        let qwServers = JSON.parse(data)
        for (let i in qwServers) {
            if( qwServers[i].ping >= 200 || qwServers[i].map === undefined || qwServers[i].map === "?" ) continue
            else {
            let oneServerPrepare =
                `<tr data="${qwServers[i].address}">
                    <td class="qwsResultName"><a  href="${qwServers[i].address}">${qwServers[i].name}</a></td>
                    <td class="qwsResultPing">${qwServers[i].ping}</td>
                    <td class="qwsResultMap">${qwServers[i].map}</td>
                    <td class="qwsResultPlayers">${qwServers[i].numplayers}/${qwServers[i].maxplayers}</td>
                </tr>`          
                $('.serverList').append(oneServerPrepare)
            }
        }
        $('.table').show()
    })
}
////////////////////////////////////////////////////////////////////////////
// end of methods

refreshMasters()