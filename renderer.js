const $ = require('jquery')
const exe = require('child_process').exec
const qw = require('./data/scripts/quakeworld')
const {ipcRenderer} = require('electron');
const remote = require('electron').remote


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

let closeApp = $('.closeButton')
closeApp.on('click', () => {
    ipcRenderer.send('close-me')
})

let minimizeApp = $('.minimizeButton')
minimizeApp.on('click', () => {
    ipcRenderer.send('minimize-me')
})

$(window).on("load resize ", function() {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({'padding-right':scrollWidth})
  }).resize()


let checkServer = (addre) => {

    $('.modalSvName, .modalMap, .modalSvName, .modalPlayers, .modalMapPic ').empty()
    let serverIP = addre.split(':')[0]
    let serverPort = addre.split(':')[1]
    qw(serverIP, serverPort, 'status', [31], function (err, data) {

        console.log(data)
        if (err) console.log('ERROR: ', err)
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
                `<tr>
                    <td class="serverName"><a href="${qwServers[i].address}">${qwServers[i].name}</a></td>
                    <td class="serverPing">${qwServers[i].ping}</td>
                    <td class="serverMap">${qwServers[i].map}</td>
                    <td class="serverPlayers">${qwServers[i].numplayers}/${qwServers[i].maxplayers}</td>
                </tr>`          
                $('tbody').append(oneServerPrepare)
            }
        }
    })
}

refreshMasters()