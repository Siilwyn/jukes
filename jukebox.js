const Nightmare = require('nightmare');
const nightmare = Nightmare();
const spiritAnimals = require('spirit-animals');

module.exports = {
  init: function () {
    const randomName = spiritAnimals.one().toLowerCase().replace('-');
    const roomUrl = 'http://jukebox.today/' + randomName;
    console.log(roomUrl);

    return nightmare
      .goto(roomUrl)
      .wait('.js-setup-privacy[data-privacy="private"]')
      // Allow website JS to bind to DOM
      .wait(1000)
      .click('.js-setup-privacy[data-privacy="private"]')
      // Inject depency directly because crossing the PIC is limited
      .inject('js', './node_modules/shuffle-array/dist/shuffle-array.min.js')
      .wait('.load-complete')
      .then(function () {
        return roomUrl;
      })
      .catch(function (error) {
        return 'Setting up the room failed :( ' + error;
      })
  },

  play: function () {
    return nightmare
      .evaluate(function () {
        sendRpc('play', {});
      })
      .then(function () {
        return 'Funky!';
      })
      .catch(function (error) {
        return 'Something is wrong with the connection...'
      })
  },

  pause: function () {
    return nightmare
      .evaluate(function () {
        sendRpc('pause', {});
      })
      .then(function () {
        return 'Paused.';
      })
      .catch(function (error) {
        return 'Something is wrong with the connection...'
      })
  },

  shuffle: function () {
    return nightmare
      .evaluate(function () {
        const songs = App.room._songs.models;

        // Get current playing song index
        const currentSongIndex = songs.findIndex(function (element) {
          return App.room.getCurrentSong() === element;
        });
        // Shuffle only the songs after the current playing song
        const shuffledSongs = shuffle(songs.slice(currentSongIndex + 1));

        // Concat the shuffled and original songs
        newSongs = songs.slice(0, currentSongIndex + 1).concat(shuffledSongs);

        // Clear the room of songs
        sendRpc('clear');

        // Add songs in the new order
        newSongs.forEach(function (song) {
          sendRpc('addSong', {
            song: song
          })
        });

        // Start playing the song that was active before shuffling
        sendRpc("goToIndex", {
          index: currentSongIndex
        });
      })
      .then(function () {
        return 'every day I\'m shufflin\'';
      })
      .catch(function (error) {
        return 'Have you got enough songs to shuffle?';
      });
  }
};