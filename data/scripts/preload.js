window.addEventListener('DOMContentLoaded', () => {

$('.closeButton')
  .on('click', () => {
    ipcRenderer.send('close-me')
  })
$('.minimizeButton')
  .on('click', () => {
    ipcRenderer.send('minimize-me')
  })

$(window)
  .on("load resize", function () {
    var scrollServers = $('.tbl-content')
      .width() - $('.tbl-content .properTable')
      .width();
    $('.tbl-header')
      .css({
        'padding-right': scrollServers
      })
    $('.appMain')
      .css({
        'height': window.innerHeight - 73
      })
    $('.tbl-content')
      .css({
        'height': window.innerHeight - 104
      })
    $('#playerList')
      .css({
        'height': window.innerHeight - 104
      })
  })


$('.mainSettings')
  .on('click', () => {
    $('.settingsWindow').toggleClass('settingsActive')
    $('.mainSettings').toggleClass('settingsBtnActive')
  })

$('.refreshTopServer').on('click', () => {
  $(".topTabActive").removeClass("topTabActive");
  $('.refreshTopServer').toggleClass("topTabActive")

  $('.appPlayers').removeClass('activeTab')
})

$('.refreshTopFavs').on('click', () => {
  readFavourites()
  $(".topTabActive").removeClass("topTabActive");
  $('.refreshTopFavs').toggleClass("topTabActive")


  $('#myFavourites').toggleClass('activeTab')
})



$('.progressBar').on('click', () => {
  refreshMasters()
})

$('.refreshTopPlayer').on('click', () => {
  readPlayers()
  $(".topTabActive").removeClass("topTabActive");
  $('.refreshTopPlayer').toggleClass("topTabActive")


  $('.appPlayers').toggleClass('activeTab')
})

$('body').on('click', '.modalNav span', function (e) {
  clearInterval(inRefresh)
  $('.modal').css({
    'left': '100%'
  })
})





// FAVOURITES ////////////////////////////////////////////////////////////////////////////////////////////////////

$('body').on('click', '.addFav', function (e) {

// declare variables for append operation
  let addressIp = $(this).attr('data-addr')
  let serverName = $(this).attr('data-name')
  let objectNew = {"name": serverName, 'address': addressIp}

  // read json file
  let rawdata = fs.readFileSync( 'favourites.json' )
  let favList = JSON.parse(rawdata)

  if( favList ) {
    // check if server already on the list / if not push to array, else .continue
    for( f in favList ){
      console.log( favList[f].name + ' - '+ favList[f].address )
    }
    // push new server to list
    favList.push(objectNew)  
  }
  else {
    // push new server to list
    favList.push(objectNew)
  }
  

  
  // convert to array from JSON
  let jsonToWrite = JSON.stringify( favList, null, 2)

// append to existing json file
  fs.writeFile("favourites.json", jsonToWrite, function(err) {
    if (err) {
      console.log(err)
    }
    console.log(favList)
  })

})

// END OF FAVOURITES //////////////////////////////////////////////////////////////////////////////////////////////




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
 
  
  console.log( $(this).attr('data-address') + `  [${awaitingSpec}]` ) 
})

$('body').on('click', '.modalNavSpec', function (e) {
  window.location = $(this).attr('data-address')
})

$('body').on('click', '.modalNavJoin', function (e) {
  window.location = $(this).attr('data-address')
})






$('body').on('click', '#properTable li', function (e) {
  e.preventDefault()
  clearInterval(inRefresh)
  let svAdress = $(this).attr('href')
  checkServer(svAdress)
})

$('body').on('click', '#playerList li', function (e) {
  e.preventDefault()
  clearInterval(inRefresh)
  let svAdress = $(this).attr('data-address')
  checkServer(svAdress)
})

$('body').on('click', '#favouritesTable li', function (e) {
  e.preventDefault()
  clearInterval(inRefresh)
  let svAdress = $(this).attr('data-address')
  checkServer(svAdress)
})

})
