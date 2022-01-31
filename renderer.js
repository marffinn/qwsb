const $ = require('jquery')
const exe = require('child_process').exec
const qw = require('./data/scripts/quakeworld')
const {ipcRenderer} = require('electron');
const remote = require('electron').remote


$('body').on('click', 'tbody tr', function (e) {
    e.preventDefault()
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})
$('.modalNav span').on('click', () => {
    $('.modal').animate({
        'left': '100%'
    }, 200)
})

let refreshTopServer = $('.refreshTopServer')
refreshTopServer.on('click', () => {
    refreshMasters()
})

let closeApp = $('.closeButton')
closeApp.on('click', () => {
    ipcRenderer.send('close-me')
})

let minimizeApp = $('.minimizeButton')
minimizeApp.on('click', () => {
    ipcRenderer.send('minimize-me')
})

$('.headServerName').on('click', ()=>{
    sortTable(0)
})

$('.headServerPing').on('click', ()=>{
    sortTable(1)
})
$('.headServerPlayers').on('click', ()=>{
    sortTable(3)
})


$(window).on("load resize ", function() {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({'padding-right':scrollWidth})
  })


let checkServer = (addre) => {

    $('.modalSvName, .modalMap, .modalSvName, .modalPlayers, .modalStatus').empty()
    let serverIP = addre.split(':')[0]
    let serverPort = addre.split(':')[1]
    qw(serverIP, serverPort, 'status', [31], function (err, data) {

        console.log(data);

        let inGameArray = []

        if (err) console.log('ERROR: ', err)
        $('.modalSvName').append(data.hostname)
        $('.modalMap').append(data.map)
        if(data.players){
            for(let i in data.players )

            if( data.players[i].frags ==='S' ){
                $('.modalPlayers').append(`<div class="onePlayer">${data.players[i].name}<span class="player_spectacor">SPEC</span></div>`)
            } else {
                inGameArray.push(data.players[i])
            }
        }
        for( let p in inGameArray ){
            $('.modalStatus').append(`<div class="team1"><span class="pName">${data.players[p].name}</span><span class="pFrags">${data.players[p].frags}</span></div>`)
        }

        $('.modal').animate({ 'left': '0' }, 'fast')
    })
}

let refreshMasters = () => {

    $('tbody').empty()

    exe('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -u -sort p -json', function (err, data) {
        if(err) return console.error(err);
        let qwServers = JSON.parse(data)
        for (let i in qwServers) {
            if( qwServers[i].ping >= 70 || qwServers[i].map === undefined || qwServers[i].map === "?" ) continue
            else {
            
            let oneServerPrepare =
                `<tr href="${qwServers[i].address}">
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


/////////////////////////////////////////////////////////////////////// table sort
function sortTable(n) {
    console.log('aasdasdasd');
    var table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
    table = document.getElementById("properTable");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 0; i < rows.length - 1; i++) { //Change i=0 if you have the header th a separate table.
        //start by saying there should be no switching:
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
            }
        } else if (dir == "desc") {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
            }
        }
        }
        if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
        } else {
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
        }
    }
    }