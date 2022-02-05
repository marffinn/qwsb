const $                 = require('jquery')

const util              = require('util')
const fs                = require('fs')
const fsp               = util.promisify(fs.readFile)

const { spawn, exec }   = require('child_process')
const { ipcRenderer }   = require('electron')
const { webContents }   = require('electron/main')
const { webFrame }      = require('electron/renderer');
const { parseJSON }     = require('jquery');

const qwm_1 = 'qwmaster.ocrana.de:27000'
const qwm_2 = 'master.quakeservers.net:27000'
const qwm_3 = 'qwmaster.fodquake.net:27000'

const masterServers = [qwm_1, qwm_2, qwm_3]


let inRefresh = null

$('body').on('click', 'tbody tr', function (e) {
    e.preventDefault()
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})

$('.mainSettings').on('click', () => {
    $('.settingsWindow').toggleClass('settingsActive')
    $('.mainSettings').toggleClass('settingsBtnActive')
})

$('.refreshTopMaster').on('click', () => {
    refreshMasters()
})

$('.refreshTopServer').on('click', () => {
    refreshServers()
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

$('.modalNav span').on('click', () => {
    clearInterval(inRefresh)
    $('.modal').css({ 'left': '100%' })
})

let checkServer = (addre) => {

    $('.modal').css({ 'left': '0' })

    let getInfo = function () {
        $('.modalSvName, .modalMap, .modalSvName, .modalPlayers, .modalStatus').empty()
        exec(`qstat -qws ${addre} -nh -P -R -pa -json"`, (err, stdout) => {
            if (err) { console.error(err) }
            let outInfo = JSON.parse(stdout)
            $('.modalSvName').html(outInfo[0].name)
            $('.modalMap').htmml(outInfo[0].map)
            $('.modalOther').html(outInfo[0].rules.status)
            if (outInfo[0].players) {
                for (let i in outInfo[0].players) {
                    if (outInfo[0].players[i].score === (-9999) ) {
                        $('.modalPlayers').append(`<div class="team1" data-team="${outInfo[0].players[i].team}" data-score="0" ><span class="pName spec"> ${outInfo[0].players[i].name}</span><span class="pFragsSpec spec">${outInfo[0].players[i].score}</span></div>`)
                    } else {
                        $('.modalPlayers').prepend(`<div class="team1" data-team="${outInfo[0].players[i].team}" data-score="${outInfo[0].players[i].score}" ><span class="pName">${outInfo[0].players[i].name}</span><span class="pFrags">${outInfo[0].players[i].score}</span></div>`)
                    }
                }   
            }
        })
    }

    let getInfoCycler = function () {
        $('.modalMap, .modalPlayers, .modalStatus').empty()
        exec(`qstat -qws ${addre} -retry 1 -nh -P -R -pa -json"`, (err, stdout) => {
            if (err) { console.error(err) }
            let outInfo = JSON.parse(stdout)
            $('.modalSvName').html(outInfo[0].name)
            $('.modalMap').html(outInfo[0].map)
            $('.modalOther').html(outInfo[0].rules.status)
            if (outInfo[0].players) {
                for (let i in outInfo[0].players) {
                    if (outInfo[0].players[i].score === (-9999) ) {
                        $('.modalPlayers').append(`<div class="team1" data-team="${outInfo[0].players[i].team}" data-score="0" ><span class="pName spec"> ${outInfo[0].players[i].name}</span><span class="pFragsSpec spec">SPEC</span></div>`) 
                    } else {
                        $('.modalPlayers').prepend(`<div class="team1" data-team="${outInfo[0].players[i].team}" data-score="${outInfo[0].players[i].score}" ><span class="pName">${outInfo[0].players[i].name}</span><span class="pFrags">${outInfo[0].players[i].score}</span></div>`)
                    }
                }   
            }
        })
    }
    getInfoCycler()
    inRefresh = setInterval( getInfoCycler, 3000)

}

let refreshMasters = () => {

    $('.progressBar').animate({ height: "25px" }, 'fast' )
    $('.progressBar span').css('width', '0%')
    
    const ls = spawn('qstat.exe', [ "-qwm", masterServers[0] , "-retry", "1", "-nh", "-progress", "-u", "-sort", "p", "-json", "-of", "servers.json" ])
    
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
        }, 'fast', refreshServers )
    })
    
}

let getStuff = function() {
    return fsp('servers.json');
}

let refreshServers = () => {

    getStuff().then( data => {
        $('tbody').empty()
        let serverList = JSON.parse( data.toString() )
        for (let s in serverList) {
            if( serverList[s].ping >= 110 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
            else {
                const ls = spawn('qstat', [ "-qws", `${serverList[s].address}`, "-nh", "-progress", "-json" ])
                ls.stdout.on('data', (data) => {
                    let we = JSON.parse( data.toString() )
                    let oneServerPrepare =
                    // HTML START ////////////////////////////////////////////////////////////////////
                        `<tr href="${we[0].address}">
                            <td class="serverName"><a href="${we[0].address}">${we[0].name}</a></td>
                            <td class="serverPing">${we[0].ping}</td>
                            <td class="serverMap">${we[0].map}</td>
                            <td class="serverPlayers">${we[0].numplayers}/${we[0].maxplayers}</td>
                        </tr>`
                    // HTML END //////////////////////////////////////////////////////////////////////
                    $('tbody').append(oneServerPrepare)
                })
            }
        }
    })


}

let onStartRefreshServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync('servers.json');
    let serverList = JSON.parse(rawdata);
    for (let s in serverList) {
        if( serverList[s].ping >= 65 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
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

let sortTable =  function (n) {
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

$(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    })
})

$('.closeButton').on('click', () => {
    ipcRenderer.send('close-me')
})

$('.minimizeButton').on('click', () => {
    ipcRenderer.send('minimize-me')
})

onStartRefreshServers()