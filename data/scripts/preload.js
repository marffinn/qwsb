window.addEventListener('DOMContentLoaded', () => {

  $('.closeButton')
    .on('click', () => {
      ipcRenderer.send('close-me')
    })
  $('.minimizeButton')
    .on('click', () => {
      ipcRenderer.send('minimize-me')
    })




  $('.mainSettings')
    .on('click', () => {
      $('.settingsWindow').toggleClass('settingsActive')
      $('.mainSettings').toggleClass('settingsBtnActive')
    })





  $('.progressBar').on('click', () => {
    refreshMasters()
  })


  $('body').on('click', '.modalNav span', function (e) {
    clearInterval(inRefresh)
    $('.modal').css({
      'left': '100%'
    })
  })


  // FAVOURITES ////////////////////////////////////////////////////////////////////////////////////////////////////

  $('body').on('click', '.addFav', function (e) {
    let addressIp = $(this).attr('data-addr')
    let serverName = $(this).attr('data-name')
    let objectNew = {"name": serverName, 'address': addressIp}
    let rawdata = fs.readFileSync( 'favourites.json' )
    let favList = JSON.parse(rawdata)

    if( favList ) {
      for( f in favList ){
        console.log( favList[f].name + ' - '+ favList[f].address )
      }
      favList.push(objectNew)  
    }
    else {
      favList.push(objectNew)
    }

    let jsonToWrite = JSON.stringify( favList, null, 2)
    fs.writeFile("favourites.json", jsonToWrite, function(err) {
      if (err) {
        console.log(err)
      }
      console.log(favList)
    })

  })


  



  
  $('body').on('click', '.modalNavSpecQtv', function (e) {
    window.location = $(this).attr('data-address')
  })
  $('body').on('click', '.modalNavSpecAlert', function (e) {
    if ( awaitingSpec == false ) {
      awaitingSpec = true
      $('.modalNavSpecAlert').toggleClass( 'quee' )
    } 
    else if ( awaitingSpec == true ){
      awaitingSpec = false
      $('.modalNavSpecAlert').removeClass( 'quee' )
    }
  })
  $('body').on('click', '.modalNavSpec', function (e) {
    window.location = $(this).attr('data-address')
  })
  $('body').on('click', '.modalNavJoin', function (e) {
    window.location = $(this).attr('data-address')
  })





  $('body').on('click', '#appServers .tbl-content li', function (e) {
    e.preventDefault()
    clearInterval(inRefresh)
    let svAdress = $(this).attr('href')
    checkServer(svAdress)
  })
  $('body').on('click', '#appPlayers .tbl-content li', function (e) {
    e.preventDefault()
    clearInterval(inRefresh)
    let svAdress = $(this).attr('data-address')
    checkServer(svAdress)
  })
  $('body').on('click', '#appFavourites .tbl-content li', function (e) {
    e.preventDefault()
    clearInterval(inRefresh)
    let svAdress = $(this).attr('data-address')
    checkServer(svAdress)
  })

})
