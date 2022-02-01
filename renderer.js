const $ = require('jquery')
const exe = require('child_process').exec
const qw = require('./data/scripts/quakeworld')
const fs = require('fs')
const { ipcRenderer} = require('electron')
const remote = require('electron').remote



const { spawn } = require('child_process');




$('body').on('click', 'tbody tr', function (e) {
    e.preventDefault()
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})
$('.modalNav span').on('click', () => {
    $('.modal').css({
        'left': '100%'
    })
})
let refreshTopMaster = $('.refreshTopMaster')
refreshTopMaster.on('click', () => {
    refreshMasters()
})
let refreshTopServer = $('.refreshTopServer')
refreshTopServer.on('click', () => {
    refreshServers()
})
let closeApp = $('.closeButton')
closeApp.on('click', () => {
    ipcRenderer.send('close-me')
})
let minimizeApp = $('.minimizeButton')
minimizeApp.on('click', () => {
    ipcRenderer.send('minimize-me')
})
$('.headServerName').on('click', () => {
    sortTable(0)
})
$('.headServerPing').on('click', () => {
    sortTable(1)
})
$('.headServerPlayers').on('click', () => {
    sortTable(3)
})


$(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    })
})


let checkServer = (addre) => {
    $('.modalSvName, .modalMap, .modalSvName, .modalPlayers, .modalStatus').empty()
    let serverIP = addre.split(':')[0]
    let serverPort = addre.split(':')[1]
    qw(serverIP, serverPort, 'status', [31], function (err, data) {
        console.log(data)
        let inGameArray = []
        if (err) console.log('ERROR: ', err)
        $('.modalSvName').append(data.hostname)
        $('.modalMap').append(data.map)
        if (data.players) {
            for (let i in data.players) {
                if (data.players[i].frags === 'S') {
                    $('.modalPlayers').append(`<div class="team1"><span class="pName">${data.players[i].name}</span><span class="pFrags">${data.players[i].frags}</span></div>`)
                } else {
                    inGameArray.push(data.players[i])
                }
            }
            for (let p in inGameArray) {
                $('.modalPlayers').prepend(`<div class="team1"><span class="pName">${data.players[p].name}</span><span class="pFrags">${data.players[p].frags}</span></div>`)
            }
        }
        $('.modal').css({
            'left': '0'
        })
    })
}

let refreshMasters = () => {

    // $('tbody').empty()
    // exe('qstat.exe -qwm qwmaster.fodquake.net:27000 -nh -progress -u -sort p -json -of servers.json')

    const ls = spawn('qstat.exe', ["-qwm qwmaster.fodquake.net:27000", "-nh", "-progress", "-u", "-sort p", "-json", "-of servers.json"] )
    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
    })
}

let refreshServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync('servers.json');
    let serverList = JSON.parse(rawdata);
    
        for (let s in serverList) {
            if( serverList[s].ping >= 55 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
            else {
                exe(`qstat.exe -qws ${serverList[s].address} -nh -json`, function (err, data) {
                    if (err) console.log('ERROR: ', err)
                    else {

                        let sep = JSON.parse(data)
                        let oneServerPrepare =
                                `<tr href="${sep[0].address}">
                                    <td class="serverName"><a href="${sep[0].address}">${sep[0].name}</a></td>
                                    <td class="serverPing">${sep[0].ping}</td>
                                    <td class="serverMap">${sep[0].map}</td>
                                    <td class="serverPlayers">${sep[0].numplayers}/${sep[0].maxplayers}</td>
                                </tr>`
                        $('tbody').append(oneServerPrepare)
                    }
                })
            }
        }
}
let onStartRefreshServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync('servers.json'); // make so than when no file present perform master refresh
    let serverList = JSON.parse(rawdata);
    // console.log( serverList );
    
        for (let s in serverList) {
            if( serverList[s].ping >= 55 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
            else {
                let oneServerPrepare =
                        `<tr href="${serverList[s].address}">
                            <td class="serverName"><a href="${serverList[s].address}">${serverList[s].name}</a></td>
                            <td class="serverPing">${serverList[s].ping}</td>
                            <td class="serverMap">${serverList[s].map}</td>
                            <td class="serverPlayers">${serverList[s].numplayers}/${serverList[s].maxplayers}</td>
                        </tr>`
                $('tbody').append(oneServerPrepare)        
                    
            }
        }
}

onStartRefreshServers()


/////////////////////////////////////////////////////////////////////// table sort
function sortTable(n) {
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
        for (i = 0; i < rows.length - 1; i++) {
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
/////////////////////////////////////////////////////////////////////// end of table sort