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
          'height': window.innerHeight - 78
        })
      $('.tbl-content')
        .css({
          'height': window.innerHeight - 101
        })
      $('#playerList')
        .css({
          'height': window.innerHeight - 101
        })
    })


  $('.mainSettings')
    .on('click', () => {
      $('.settingsWindow')
        .toggleClass('settingsActive')
      $('.mainSettings')
        .toggleClass('settingsBtnActive')
    })

  $('.refreshTopServer')
    .on('click', () => {
      $('.appPlayers')
        .removeClass('activeTab')
    })

  $('.refreshTopFavs')
    .on('click', () => {
      $(this)
        .addClass("topTabActive")
    })

  $('.progressBar')
    .on('click', () => {
      refreshMasters()
    })

  $('.refreshTopPlayer')
    .on('click', () => {
      readPlayers()
      $(this)
        .toggleClass("topTabActive")
      $('.appPlayers')
        .toggleClass('activeTab')
    })

  $('body')
    .on('click', '.modalNav span', function (e) {
      clearInterval(inRefresh)
      $('.modal')
        .css({
          'left': '100%'
        })
    })

  $('body')
    .on('click', '.modalNavSpecQtv', function (e) {
      window.location = $(this)
        .attr('data-address')
    })

  $('body')
    .on('click', '.modalNavSpec', function (e) {
      window.location = $(this)
        .attr('data-address')
    })

  $('body')
    .on('click', '.modalNavJoin', function (e) {
      window.location = $(this)
        .attr('data-address')
    })

  $('body')
    .on('click', '#properTable li', function (e) {
      e.preventDefault()
      clearInterval(inRefresh)
      let svAdress = $(this)
        .attr('href')
      checkServer(svAdress)
    })

  $('body')
    .on('click', '#playerList li', function (e) {
      e.preventDefault()
      clearInterval(inRefresh)
      let svAdress = $(this)
        .attr('data-address')
      checkServer(svAdress)
    })

})
