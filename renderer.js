const $                 = require('jquery')

const fs                = require('fs')
const path              = require('path')

const { spawn, exec }   = require('child_process')
const { ipcRenderer }   = require('electron')
const { webContents }   = require('electron/main')
const { webFrame }      = require('electron/renderer')

const qwm_1             = 'qwmaster.ocrana.de:27000'
const qwm_2             = 'master.quakeservers.net:27000'
const qwm_3             = 'qwmaster.fodquake.net:27000'

const masterServers     = [qwm_1, qwm_2, qwm_3]

let inRefresh           = null  // interval For in server updates/
let cycleEvery          = 3000

$('body').on('click', 'tbody tr', function (e) {
    e.preventDefault()
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})
$('.mainSettings').on('click', () => {
    $('.settingsWindow').toggleClass('settingsActive')
    $('.mainSettings').toggleClass('settingsBtnActive')
})
$('.headServerName').on('click', () => {
    sort_by_name()
})
$('.headServerPing').on('click', () => {
    sort_by_ping()
})
$('.headServerPlayers').on('click', () => {
    sort_by_players()
})


$('.refreshTopServer').on('click', () => {
    refreshMasters()
})
$('.modalNav span').on('click', () => {
    clearInterval(inRefresh)
    $('.modal').css({ 'left': '100%' })
})

let checkServer = (addre) => {
    $('.modal').css({ 'left': '0' })
    let getInfoCycler = function () {
        $('.modalMap, .modalPlayers, .modalStatus').empty()
        exec(`qstat -qws ${addre} -retry 1 -nh -P -R -sort F -noconsole  -json"`, (err, stdout) => {
            if (err) { console.error(err) }
            let outInfo = JSON.parse(stdout)

            // console.log(outInfo);

            $('.modalSvName').html(outInfo[0].name)
            $('.modalMap').html(outInfo[0].map)
            $('.modalOther').html(outInfo[0].rules.status)
            if (outInfo[0].players) {
                for (let i in outInfo[0].players) {
                    if (outInfo[0].players[i].score === (-9999) ) {
                        $('.modalPlayers').append(`<div class="team1" data-team="${outInfo[0].players[i].team}"><span class="pName spec"> ${outInfo[0].players[i].name}</span><span class="pFragsSpec spec">SPEC</span></div>`) 
                    } else {
                        $('.modalPlayers').append(`<div class="team1" data-team="${outInfo[0].players[i].team}"><span class="pName">${outInfo[0].players[i].name}</span><span class="pFrags">${outInfo[0].players[i].score}</span></div>`)
                    }
                }   
            }
        })
    }
    getInfoCycler()
    inRefresh = setInterval( getInfoCycler, cycleEvery)
}
let refreshMasters = () => {
    $('.progressBar').animate({ height: "25px" }, 'fast' )
    $('.progressBar span').css('width', '0%')
    const ls = spawn('qstat.exe', [ "-qwm", masterServers[0] , "-retry", "1", "-nh", "-R", "-progress", "-u", "-sort", "n", "-json", "-of", "servers.json" ])
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
        readServers()
        $('.progressBar').animate({
            height: "0px"
        }, 'fast')
    })
}
let readServers = () => {
    $('tbody').empty()
    let rawdata = fs.readFileSync( path.join(__dirname, 'servers.json') )
    let serverList = JSON.parse(rawdata);
    for (let s in serverList) {
        if( serverList[s].ping >= 65 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
        else {
            let oneServerPrepare =
                `<tr href="${serverList[s].address}" data-name="${serverList[s].name}" data-ping="${serverList[s].ping}" data-playerno="${serverList[s].numplayers}">
                    <td class="serverName"><a href="${serverList[s].address}">${serverList[s].name}</a></td>
                    <td class="serverPing">${serverList[s].ping}</td>
                    <td class="serverMap">${serverList[s].map}</td>
                    <td class="serverPlayers">${serverList[s].numplayers}/${serverList[s].maxplayers}</td>
                </tr>`
            $('tbody').append(oneServerPrepare)
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
readServers()

function comparator_name(a, b) {
    if (a.dataset.name < b.dataset.name) return -1
    if (a.dataset.name > b.dataset.name) return 1
    return 0;
}
function sort_by_name() {
    let subjects = document.querySelectorAll("[data-name]")
    let subjectsArray = Array.from(subjects)
    let sorted = subjectsArray.sort(comparator_name)
    $(".row_results").empty()
    sorted.forEach( e => document.querySelector(".row_results").appendChild(e) )
}

function comparator_ping(a, b) {
    if (a.dataset.ping < b.dataset.ping) return -1
    if (a.dataset.ping > b.dataset.ping) return 1
    return 0;
}
function sort_by_ping() {
    let subjects = document.querySelectorAll("[data-ping]")
    let subjectsArray = Array.from(subjects)
    let sorted = subjectsArray.sort(comparator_ping)
    $(".row_results").empty()
    sorted.forEach( e => document.querySelector(".row_results").appendChild(e) )
}

function comparator_playerno(a, b) {
    if (a.dataset.playerno < b.dataset.playerno) return -1
    if (a.dataset.playerno > b.dataset.playerno) return 1
    return 0;
}
function sort_by_players() {
    let subjects = document.querySelectorAll("[data-playerno]")
    let subjectsArray = Array.from(subjects)
    let sorted = subjectsArray.sort(comparator_playerno)
    $(".row_results").empty()
    sorted.forEach( e => document.querySelector(".row_results").appendChild(e) )
}