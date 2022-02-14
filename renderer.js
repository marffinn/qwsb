const $                 = require('jquery')
const fs                = require('fs')
const path              = require('path')
const { spawn, exec }   = require('child_process')
const { ipcRenderer }   = require('electron')
const { webContents }   = require('electron/main')
const { webFrame }      = require('electron/renderer')
const notifier          = require('node-notifier')

const main_setup        = require('./settings.json')

let inRefresh           = null
let cycleEvery = main_setup.sb.inServerRefreshRate * 1000

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i
}

let refreshMasters = () => {
    $('.progressBar').animate({ height: "15px" }, 'fast' )
    $('.progressBar span').css('width', '0%')
    const ls = spawn('qstat.exe', [ "-qwm", main_setup.masters.ocrana , "-retry", main_setup.retries , "-nh", "-R", "-progress", "-u", "-sort", "n", "-json", "-of", "servers.json" ])
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
        let d = new Date()
        let h = addZero(d.getHours())
        let m = addZero(d.getMinutes())
        let resultInfo = `Last refresh: ${h}:${m}`
        $('.progressBar b').html(resultInfo)

        notifier.notify(
            {
                title: 'Server refresh',
                message: resultInfo,
                icon: path.join(__dirname, './data/icons/Quake-icon.png'), // Absolute path (doesn't work on balloons)
                sound: 'Funk', // Only Notification Center or Windows Toasters
                wait: true, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                appID: "QW-SB"
            },
            function (err, response, metadata) {
              // Response is response from notification
              // Metadata contains activationType, activationAt, deliveredAt
            }
          );
          
          notifier.on('click', function (notifierObject, options, event) {
            // Triggers if `wait: true` and user clicks notification
          });
          
          notifier.on('timeout', function (notifierObject, options) {
            // Triggers if `wait: true` and notification closes
          });

    })
}
let in_server_status = (data) => {
    let status = data
    if(status === 'Standby'){
        status = `<div class="modalOther orange_txt">${status}</div>`
    } else if (status === undefined) {
        status = `<div class="modalOther red_txt">no status</div>`
    } else {
        status = `<div class="modalOther green_txt">${status}</div>`
    }
    return status
}
let in_server_team = (team, score) => {
    let teams = team
    let scrbd = score
    if (teams && scrbd !== (-9999)) {
        teams = `<span class="pTeam">${teams}</span>`
    } else{
        teams = `<span class="pTeamSpec">${teams}</span>`
    }
    return teams
}
let checkServer = (addre) => {
    $('.modal').css({ 'left': '0' })
    let getInfoUpdate = function () {
        exec(`qstat -qws ${addre} -retry 1 -nh -P -R -sort F -noconsole  -json"`, (err, stdout) => {
            if (err) { console.error(err) }
            let outInfo = JSON.parse(stdout) 
            let svname = $('.modalSvName').html(outInfo[0].name)
            let svmap = $('.modalMap').html(`<span>${outInfo[0].map}</span>`)
            let svother = in_server_status(outInfo[0].rules.status)
            let closebtn = "<div class='modalNav'><span></span></div>"

            let joinbtn = 
            `
            <div class="servBtnHolder">
                <div class="modalNavJoin" data-address="qw://${addre}/join">join</div>
                <div class="modalNavSpec" data-address="qw://${addre}/observe">spectate</div>
                <div class="modalNavSpecQtv" data-address="qw://2@${addre}/qtvplay">QTV</div>
            </div>
            `

            let updatedInfo = () => {
                let $div = $("<div>", {"class": "modalPlayers"})
                if (outInfo[0].players) {
                    for (let i in outInfo[0].players) {
                        if (outInfo[0].players[i].score === (-9999) ) {
                            $div.append(`<div class="teamSpec" data-team="${outInfo[0].players[i].team}">${in_server_team (outInfo[0].players[i].team, outInfo[0].players[i].score )}<span class="pName spec">${outInfo[0].players[i].name}</span><span class="pFragsSpec spec">${outInfo[0].players[i].score}</span></div>`) 
                        } else {
                            $div.append(`<div class="team1" data-team="${outInfo[0].players[i].team}">${in_server_team (outInfo[0].players[i].team, outInfo[0].players[i].score )}<span class="pName">${outInfo[0].players[i].name}</span><span class="pFrags">${outInfo[0].players[i].score}</span></div>`)
                        }
                    }   
                }
                return $div
            }
            $('.content').html(updatedInfo)
            $('.content').prepend(svname)
            $('.content').prepend(svmap)
            $('.content').prepend(svother)
            $('.content').append(closebtn)
            $('.content').append(joinbtn)
        })
    }
    getInfoUpdate()
    // inRefresh = setInterval( getInfoUpdate, cycleEvery)
}
let readServers = () => {
    $('#properTable').empty()
    let rawdata = fs.readFileSync( path.join(__dirname, 'servers.json') )
    let serverList = JSON.parse(rawdata)
    for (let s in serverList) {
        if( serverList[s].ping >= 80 || serverList[s].map === undefined || serverList[s].map === "?" ) continue
        else {
            let oneServerPrepare =
                `<li href="${serverList[s].address}" data-name="${serverList[s].name}" data-ping="${serverList[s].ping}" data-playerno="${serverList[s].numplayers}">
                    <span class="serverName"><a href="${serverList[s].address}">${serverList[s].name}</a></span>
                    <span class="serverPing">${serverList[s].ping}</span>
                    <span class="serverMap">${serverList[s].map}</span>
                    <span class="serverPlayers">${serverList[s].numplayers}/${serverList[s].maxplayers}</span>
                </li>`
            $('#properTable').append(oneServerPrepare)
        }
    }
}
let readPlayers = () => {
    $('.appPlayers').empty()
    let rawdata = fs.readFileSync( path.join(__dirname, 'servers.json') )
    let serverList = JSON.parse(rawdata);

    for (let s in serverList) {
        if( serverList[s].map === undefined || serverList[s].map === "?" || serverList[s].numplayers == 0 || serverList[s].numspectacors === "undefined" ) continue
        else {
            let player =
                `<li data-spectacors="${ serverList[s].numspectacors }" data-address="${serverList[s].address}" >${ serverList[s].numplayers } / ${ serverList[s].maxplayers }  - ${serverList[s].address} / ${serverList[s].name} </li>`
            $('.appPlayers ul').append(player)
        }
    }
}
function comparator_name(a, b) {
    if (a.dataset.name < b.dataset.name) return -1
    if (a.dataset.name > b.dataset.name) return 1
    return 0;
}
function sort_by_name() {
    let subjects = document.querySelectorAll("[data-name]")
    let subjectsArray = Array.from(subjects)
    let sorted = subjectsArray.sort(comparator_name)
    $("#properTable").empty()
    sorted.forEach( e => document.querySelector("#properTable").appendChild(e) )
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
    $("#properTable").empty()
    sorted.forEach( e => document.querySelector("#properTable").appendChild(e) )
}
function sort_by_players() {
    readServers()
}
$(window).on("load resize", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    })

    $('.appMain').css({
        'height': window.innerHeight - 80
    })
    $('.tbl-content').css({
        'height': window.innerHeight - 103
    })
})
$('body').on('click', '#properTable li', function (e) {
    e.preventDefault()
    clearInterval(inRefresh)
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
})
$('.mainSettings').on('click', () => {
    $('.settingsWindow').toggleClass('settingsActive')
    $('.mainSettings').toggleClass('settingsBtnActive')
})
$('.refreshTopServer').on('click', () => {
    refreshMasters()
})
$('.progressBar').on('click', () => {
    refreshMasters()
})
$('.refreshTopPlayer').on('click', () => {
    readPlayers()
    $('.appPlayers').toggleClass('activeTab')
})
$('body').on('click', '.modalNav span', function (e) {
    clearInterval(inRefresh)
    $('.modal').css({ 'left': '100%' })
})

$('body').on('click', '.modalNavSpecQtv', function (e) {
    window.location = $(this).attr('data-address')
})
$('body').on('click', '.modalNavSpec', function (e) {
    window.location = $(this).attr('data-address')
})
$('body').on('click', '.modalNavJoin', function (e) {
    window.location = $(this).attr('data-address')
})
// WINDOW Mainframe buttons ////////////////////////////
$('.closeButton').on('click', () => {
    ipcRenderer.send('close-me')
})
$('.minimizeButton').on('click', () => {
    ipcRenderer.send('minimize-me')
})
///////////////////////////////////////////////////////
// SORTING FUNCTIONS ////////////////////////////////////
$('.headServerName').on('click', () => {
    sort_by_name()
})
$('.headServerPing').on('click', () => {
    sort_by_ping()
})
$('.headServerPlayers').on('click', () => {
    sort_by_players()
})
/////////////////////////////////////////////////////////
readServers()