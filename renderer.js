const $ = require('jquery')
const { spawn, exec } = require('child_process')
const fs = require('fs')
const { ipcRenderer } = require('electron')


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

    exec(`qstat -qws ${addre} -nh -P -json"`, (err, stdout) => {

        if (err) {
            console.error(err)
        }
        let inGameArray = []
        let outInfo = JSON.parse(stdout)

        $('.modalSvName').append(outInfo[0].name)
        $('.modalMap').append(outInfo[0].map)
        if (outInfo[0].players) {
            for (let i in outInfo[0].players) {
                if (outInfo[0].players[i].name === '[ServeMe]') {
                    $('.modalPlayers').append(`<div class="team1"><span class="pName">${outInfo[0].players[i].name}</span><span class="pFragsSpec">SPEC</span></div>`)
                    
                } else {
                    inGameArray.push(outInfo[0].players[i])
                }
            }   
        }
        for (let p in inGameArray) {
            $('.modalPlayers').prepend(`<div class="team1"><span class="pName">${outInfo[0].players[p].name}</span><span class="pFrags">${outInfo[0].players[p].score}</span></div>`)
        }
        $('.modal').css({
            'left': '0'
        })
    })
}

let refreshMasters = () => {

    $('.progressBar').animate({
        height: "25px"
    }, 'fast' )

    $('.progressBar span').css('width','0%')
    const ls = spawn('qstat.exe', [ "-qwm","qwmaster.fodquake.net:27000", "-nh", "-progress", "-u", "-sort", "p", "-json", "-of", "servers.json" ])
    ls.stderr.on('data', (data) => {

        let progress = data.toString()
        let bar = progress.substring(0, progress.indexOf(' ('))

        var fields = bar.split('/')
        var currentNum = ( 100 / fields[1] )
        var barPercent = parseInt( fields[0] * currentNum )
        $('.progressBar span').css('width', barPercent +'%')
        $('.progressBar b').html( progress )
    })
    ls.on('close', () => {
        $('.progressBar').animate({
            height: "0px"
        }, 'fast' )
    })
    
}

let refreshServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync('servers.json');
    let serverList = JSON.parse(rawdata);
    
    for (let s in serverList) {
        if( serverList[s].ping >= 60 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
        else {
            exec(`qstat -qws ${serverList[s].address} -nh -progress -json"`, (err, stdout) => {
                if (err) {
                    console.error(err)
                    return
                }
                let sep = JSON.parse(stdout)
                let oneServerPrepare =
                                `<tr href="${sep[0].address}">
                                <td class="serverName"><a href="${sep[0].address}">${sep[0].name}</a></td>
                                <td class="serverPing">${sep[0].ping}</td>
                                <td class="serverMap">${sep[0].map}</td>
                                <td class="serverPlayers">${sep[0].numplayers}/${sep[0].maxplayers}</td>
                            </tr>`
                $('tbody').append(oneServerPrepare)
            })
        }
    }
}
let onStartRefreshServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync('servers.json'); // make so than when no file present perform master refresh
    let serverList = JSON.parse(rawdata);
        for (let s in serverList) {
            if( serverList[s].ping >= 60 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
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