// /**
//  * playlist.js — Playlist Page Controller
//  * =========================================
//  * Renders song cards from config data.
//  * Each card links to Spotify.
//  */

// const PlaylistPage = (() => {
//   let songsContainer;
//   let entranceAnimated = false;

//   function init(contentData) {
//     songsContainer = document.getElementById("songs-container");

//     // Build song cards from config
//     const songs = (contentData && contentData.playlistSongs) || [];
//     buildSongCards(songs);

//     // Continue button
//     document.getElementById("btn-playlist-continue").addEventListener("click", () => {
//       App.navigateTo("contact");
//     });
//   }

//   /**
//    * Build song cards dynamically.
//    * @param {Array} songs - Array of song objects from config.
//    */
//   function buildSongCards(songs) {
//     songsContainer.innerHTML = "";

//     const defaultSongs = [
//       { title: "Tum Se Hi", artist: "Jab We Met", lyric: "Tera Na Hona Jaane Kyun Hona Hi Hai", spotifyUrl: "#" },
//       { title: "Nothing", artist: "Bruno Major", lyric: "Dumb conversations we lost track of time, Have I told you lately I'm grateful that you're mine", spotifyUrl: "#" },
//       { title: "I Wanna Be Yours", artist: "Arctic Monkeys", lyric: "Secrets I have held in my heart", spotifyUrl: "#" },
//       { title: "I Like Me Better", artist: "Lauv", lyric: "I like me better when I'm with you.", spotifyUrl: "#" },
//     ];

//     const songList = songs.length > 0 ? songs : defaultSongs;

//     songList.forEach((song, index) => {
//       const card = document.createElement("a");
//       card.classList.add("song-card");
//       card.href = song.spotifyUrl || "#";
//       card.target = "_blank";
//       card.rel = "noopener noreferrer";

//       card.innerHTML = `
//         <div class="song-title">${song.title}</div>
//         <div class="song-artist">${song.artist || song.movie || ""}</div>
//         <div class="song-lyric">"${song.lyric}"</div>
//       `;

//       songsContainer.appendChild(card);
//     });
//   }

//   /**
//    * Animate song cards entrance when page becomes visible.
//    * Guarded so it only ever runs once, even if the page
//    * is revisited multiple times in the same session.
//    */
//   function animateEntrance() {
//     if (entranceAnimated) return;
//     entranceAnimated = true;

//     const cards = songsContainer.querySelectorAll(".song-card");
//     gsap.fromTo(
//       cards,
//       { opacity: 0, x: -30 },
//       {
//         opacity: 1,
//         x: 0,
//         duration: 0.5,
//         stagger: 0.12,
//         ease: "power2.out",
//         overwrite: "auto",
//         clearProps: "opacity,transform",
//       }
//     );
//   }

//   return { init, animateEntrance };
// })();

/**
 * playlist.js — Playlist Page Controller
 * =========================================
 * Renders song cards from config data.
 * Clicking a card opens an embedded Spotify player
 * and seeks to that song's specific lyric timestamp.
 */

// const PlaylistPage = (() => {
//   let songsContainer;
//   let entranceAnimated = false;

//   // Spotify Embed IFrame API state
//   let spotifyApi = null;
//   let spotifyController = null;
//   let playerBar;
//   let embedContainer;
//   let pendingSeekSeconds = 0;

//   function init(contentData) {
//     songsContainer = document.getElementById("songs-container");
//     playerBar = document.getElementById("spotify-player-bar");
//     embedContainer = document.getElementById("spotify-embed-container");

//     // Build song cards from config
//     const songs = (contentData && contentData.playlistSongs) || [];
//     buildSongCards(songs);

//     // Continue button
//     document.getElementById("btn-playlist-continue").addEventListener("click", () => {
//       App.navigateTo("contact");
//     });

//     // Close button for the player bar
//     const closeBtn = document.getElementById("spotify-player-close");
//     if (closeBtn) {
//       closeBtn.addEventListener("click", closePlayer);
//     }

//     // Register the global callback the Spotify script looks for
//     window.onSpotifyIframeApiReady = (IFrameAPI) => {
//       spotifyApi = IFrameAPI;
//     };
//   }
// const PlaylistPage = (() => {
//   let songsContainer;
//   let entranceAnimated = false;

//   // Spotify Embed IFrame API state
//   let spotifyApi = null;
//   let spotifyController = null;
//   let playerBar;
//   let embedContainer;
//   let pendingSeekSeconds = 0;

//   // Register this at module load time — NOT inside init() — so it's
//   // ready no matter when Spotify's async script finishes loading,
//   // even if that happens before the user visits this page.
//   window.onSpotifyIframeApiReady = (IFrameAPI) => {
//     spotifyApi = IFrameAPI;
//   };

//   function init(contentData) {
//     songsContainer = document.getElementById("songs-container");
//     playerBar = document.getElementById("spotify-player-bar");
//     embedContainer = document.getElementById("spotify-embed-container");

//     const songs = (contentData && contentData.playlistSongs) || [];
//     buildSongCards(songs);

//     document.getElementById("btn-playlist-continue").addEventListener("click", () => {
//       App.navigateTo("contact");
//     });

//     const closeBtn = document.getElementById("spotify-player-close");
//     if (closeBtn) {
//       closeBtn.addEventListener("click", closePlayer);
//     }
//   }

//   // ...rest of the file stays exactly the same (extractTrackId,
//   // buildSongCards, openAtTimestamp, seekAndPlay, closePlayer, animateEntrance)

//   /**
//    * Extract a Spotify track ID from a full track URL.
//    * Returns null if no track ID is present (e.g. a bare
//    * homepage/profile link with no /track/ segment).
//    */
//   function extractTrackId(url) {
//     if (!url) return null;
//     const match = url.match(/track\/([a-zA-Z0-9]+)/);
//     return match ? match[1] : null;
//   }

//   /**
//    * Build song cards dynamically.
//    * @param {Array} songs - Array of song objects from config.
//    */
//   function buildSongCards(songs) {
//     songsContainer.innerHTML = "";

//     const defaultSongs = [
//       {
//         title: "Tum Se Hi",
//         artist: "Jab We Met",
//         lyric: "Tera Na Hona Jaane Kyun Hona Hi Hai",
//         spotifyUrl: "#",
//         lyricTimestamp: 43,
//       },
//       {
//         title: "Nothing",
//         artist: "Bruno Major",
//         lyric: "Dumb conversations we lost track of time, Have I told you lately I'm grateful that you're mine",
//         spotifyUrl: "#",
//         lyricTimestamp: 40,
//       },
//       {
//         title: "I Wanna Be Yours",
//         artist: "Arctic Monkeys",
//         lyric: "Secrets I have held in my heart",
//         spotifyUrl: "#",
//         lyricTimestamp: 45,
//       },
//       {
//         title: "I Like Me Better",
//         artist: "Lauv",
//         lyric: "I like me better when I'm with you.",
//         spotifyUrl: "#",
//         lyricTimestamp: 44,
//       },
//     ];

//     const songList = songs.length > 0 ? songs : defaultSongs;

//     songList.forEach((song) => {
//       const trackId = extractTrackId(song.spotifyUrl);
//       const timestamp = typeof song.lyricTimestamp === "number" ? song.lyricTimestamp : 0;

//       const card = document.createElement("div");
//       card.classList.add("song-card");
//       card.setAttribute("role", "button");
//       card.setAttribute("tabindex", "0");

//       card.innerHTML = `
//         <div class="song-title">${song.title}</div>
//         <div class="song-artist">${song.artist || song.movie || ""}</div>
//         <div class="song-lyric">"${song.lyric}"</div>
//       `;

//       if (trackId) {
//         // We can embed and seek to the exact lyric timestamp
//         card.addEventListener("click", () => openAtTimestamp(trackId, timestamp));
//         card.addEventListener("keydown", (e) => {
//           if (e.key === "Enter" || e.key === " ") {
//             e.preventDefault();
//             openAtTimestamp(trackId, timestamp);
//           }
//         });
//       } else {
//         // No valid track ID found in config — fall back to a normal
//         // link so the card still does *something* useful.
//         card.addEventListener("click", () => {
//           window.open(song.spotifyUrl || "https://open.spotify.com", "_blank", "noopener,noreferrer");
//         });
//       }

//       songsContainer.appendChild(card);
//     });
//   }

//   /**
//    * Open the embedded player bar and seek to the given
//    * timestamp (in seconds) once the track is ready.
//    */
//   function openAtTimestamp(trackId, seconds) {
//     pendingSeekSeconds = seconds;
//     const uri = `spotify:track:${trackId}`;

//     playerBar.classList.add("active");

//     if (!spotifyApi) {
//       // API script hasn't finished loading yet; try again shortly.
//       setTimeout(() => openAtTimestamp(trackId, seconds), 300);
//       return;
//     }

//     if (!spotifyController) {
//       // First time opening the player: create the controller once.
//       const options = { uri };
//       spotifyApi.createController(embedContainer, options, (controller) => {
//         spotifyController = controller;

//         spotifyController.addListener("ready", () => {
//           seekAndPlay(pendingSeekSeconds);
//         });
//       });
//     } else {
//       // Reuse the existing player, just load the new track.
//       spotifyController.loadUri(uri);
//       spotifyController.addListener("ready", () => {
//         seekAndPlay(pendingSeekSeconds);
//       });
//     }
//   }

//   function seekAndPlay(seconds) {
//     if (!spotifyController) return;
//     spotifyController.seek(seconds);
//     spotifyController.resume();
//   }

//   function closePlayer() {
//     playerBar.classList.remove("active");
//     if (spotifyController) {
//       spotifyController.pause();
//     }
//   }

//   /**
//    * Animate song cards entrance when page becomes visible.
//    * Guarded so it only ever runs once, even if the page
//    * is revisited multiple times in the same session.
//    */
//   function animateEntrance() {
//     if (entranceAnimated) return;
//     entranceAnimated = true;

//     const cards = songsContainer.querySelectorAll(".song-card");
//     gsap.fromTo(
//       cards,
//       { opacity: 0, x: -30 },
//       {
//         opacity: 1,
//         x: 0,
//         duration: 0.5,
//         stagger: 0.12,
//         ease: "power2.out",
//         overwrite: "auto",
//         clearProps: "opacity,transform",
//       }
//     );
//   }

//   return { init, animateEntrance };
// })();





/**
 * playlist.js — Playlist Page Controller
 * =========================================
 * Renders song cards from config data.
 * Clicking a card opens an embedded Spotify player
 * and seeks to that song's specific lyric timestamp.
 */

const PlaylistPage = (() => {
  let songsContainer;
  let entranceAnimated = false;

  // Spotify Embed IFrame API state
  let spotifyApi = null;
  let spotifyController = null;
  let playerBar;
  let embedContainer;
  let pendingSeekSeconds = 0;
  let hasSeekedForCurrentLoad = false;

  // Sparkle particles state
  let particlesContainer;
  let particleSpawnInterval = null;
  let particleCounter = 0;

  // Register this at module load time — NOT inside init() — so it's
  // ready no matter when Spotify's async script finishes loading,
  // even if that happens before the user visits this page.
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    spotifyApi = IFrameAPI;
  };

  function init(contentData) {
    songsContainer = document.getElementById("songs-container");
    playerBar = document.getElementById("spotify-player-bar");
    embedContainer = document.getElementById("spotify-embed-container");
    particlesContainer = document.getElementById("playlist-particles-container"); // ← add this line

    const songs = (contentData && contentData.playlistSongs) || [];
    buildSongCards(songs);

    document.getElementById("btn-playlist-continue").addEventListener("click", () => {
      App.navigateTo("contact");
    });

    const closeBtn = document.getElementById("spotify-player-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePlayer);
    }
  }

  // ─── Sparkle particles ──────────────────────────
  function startParticles() {
    if (!particlesContainer || particleSpawnInterval) return;
    spawnParticle();
    particleSpawnInterval = setInterval(spawnParticle, 400);
  }

  function stopParticles() {
    if (particleSpawnInterval) {
      clearInterval(particleSpawnInterval);
      particleSpawnInterval = null;
    }
    if (particlesContainer) particlesContainer.innerHTML = "";
  }

  // function spawnParticle() {
  //   if (!particlesContainer) return;
  //   const particle = document.createElement("div");
  //   particle.classList.add("particle");
  //   particle.style.left = `${Math.random() * 100}%`;
  //   particle.style.bottom = "0";
  //   particle.style.animationDelay = `${Math.random() * 0.4}s`;
  //   particlesContainer.appendChild(particle);
  //   // Clean up after its animation cycle finishes so they don't pile up
  //   setTimeout(() => particle.remove(), 6500);
  // }
    // --> that was for normal small sparkles 
    // --> below code was was samller +bigger sparkles plus some heart shapes too 
//   let particleCounter = 0;

function spawnParticle() {
  if (!particlesContainer) return;

  particleCounter++;
  const particle = document.createElement("div");

  // Guaranteed mix instead of random luck: every 4th particle is a
  // heart, the rest are dots with a size cycle (small/medium/big)
  const isHeart = particleCounter % 4 === 0;

  if (isHeart) {
    particle.classList.add("particle-heart");
    particle.textContent = "♥";
    const size = 12 + Math.random() * 14; // 12px–26px hearts
    particle.style.fontSize = `${size}px`;
  } else {
    particle.classList.add("particle");
    const sizeRoll = particleCounter % 3;
    const size = sizeRoll === 0 ? 4 + Math.random() * 2   // small: 4–6px
               : sizeRoll === 1 ? 7 + Math.random() * 3   // medium: 7–10px
               : 11 + Math.random() * 4;                  // big: 11–15px
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
  }

  particle.style.left = `${Math.random() * 100}%`;
  particle.style.bottom = "0";
  particle.style.animationDelay = `${Math.random() * 0.4}s`;
  particle.style.animationDuration = `${5 + Math.random() * 3}s`;

  particlesContainer.appendChild(particle);
  setTimeout(() => particle.remove(), 8500);
}
  /**
   * Extract a Spotify track ID from a full track URL.
   * Returns null if no track ID is present.
   */
  function extractTrackId(url) {
    if (!url) return null;
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Build song cards dynamically.
   * @param {Array} songs - Array of song objects from config.
   */
  function buildSongCards(songs) {
    songsContainer.innerHTML = "";

    const defaultSongs = [
      {
        title: "Tum Se Hi",
        artist: "Jab We Met",
        lyric: "Tera Na Hona Jaane Kyun Hona Hi Hai",
        spotifyUrl: "#",
        lyricTimestamp: 43,
      },
      {
        title: "Nothing",
        artist: "Bruno Major",
        lyric: "Dumb conversations we lost track of time, Have I told you lately I'm grateful that you're mine",
        spotifyUrl: "#",
        lyricTimestamp: 40,
      },
      {
        title: "I Wanna Be Yours",
        artist: "Arctic Monkeys",
        lyric: "Secrets I have held in my heart",
        spotifyUrl: "#",
        lyricTimestamp: 45,
      },
      {
        title: "I Like Me Better",
        artist: "Lauv",
        lyric: "I like me better when I'm with you.",
        spotifyUrl: "#",
        lyricTimestamp: 44,
      },
    ];

    const songList = songs.length > 0 ? songs : defaultSongs;

    songList.forEach((song) => {
      const trackId = extractTrackId(song.spotifyUrl);
      const timestamp = typeof song.lyricTimestamp === "number" ? song.lyricTimestamp : 0;

      const card = document.createElement("div");
      card.classList.add("song-card");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      card.innerHTML = `
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist || song.movie || ""}</div>
        <div class="song-lyric">"${song.lyric}"</div>
      `;

      if (trackId) {
        card.addEventListener("click", () => openAtTimestamp(trackId));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openAtTimestamp(trackId);
          }
        });
      } else {
        card.addEventListener("click", () => {
          window.open(song.spotifyUrl || "https://open.spotify.com", "_blank", "noopener,noreferrer");
        });
      }

      songsContainer.appendChild(card);
    });
  }

  /**
   * Open the embedded player bar and seek to the given
   * timestamp (in seconds) once the track is actually loaded.
   */
  // function openAtTimestamp(trackId, seconds) {
  //   pendingSeekSeconds = seconds;
  //   hasSeekedForCurrentLoad = false;
  //   const uri = `spotify:track:${trackId}`;

  //   playerBar.classList.add("active");

  //   if (!spotifyApi) {
  //     // API script hasn't finished loading yet; try again shortly.
  //     setTimeout(() => openAtTimestamp(trackId, seconds), 300);
  //     return;
  //   }

  //   if (!spotifyController) {
  //     // First time opening the player: create the controller once,
  //     // and attach the playback listener once.
  //     const options = { uri };
  //     spotifyApi.createController(embedContainer, options, (controller) => {
  //       spotifyController = controller;
  //       spotifyController.addListener("playback_update", handlePlaybackUpdate);
  //     });
  //   } else {
  //     // Reuse the existing player — just load the new track.
  //     // The listener attached above fires again for this new
  //     // track and handles the seek.
  //     spotifyController.loadUri(uri);
  //   }
  // }

  // /**
  //  * Fires repeatedly as the player reports state. We wait until
  //  * the track actually has a real duration (i.e. it's genuinely
  //  * loaded) before seeking — seeking too early gets silently
  //  * ignored by the player.
  //  */
  // function handlePlaybackUpdate(e) {
  //   if (hasSeekedForCurrentLoad) return;

  //   const data = e && e.data;
  //   if (data && typeof data.duration === "number" && data.duration > 0) {
  //     hasSeekedForCurrentLoad = true;
  //     spotifyController.seek(pendingSeekSeconds);
  //     spotifyController.resume();
  //   }
  // }
// function openAtTimestamp(trackId, seconds) {
//   pendingSeekSeconds = seconds;
//   hasSeekedForCurrentLoad = false;
//   const uri = `spotify:track:${trackId}`;

//   playerBar.classList.add("active");
//   startParticles(); // ← sparkles begin when a song opens

//   if (!spotifyApi) {
//     setTimeout(() => openAtTimestamp(trackId, seconds), 300);
//     return;
//   }

//   if (!spotifyController) {
//     // First time opening the player: create the controller once,
//     // attach the listener once, and kick off playback right away.
//     const options = { uri };
//     spotifyApi.createController(embedContainer, options, (controller) => {
//       spotifyController = controller;
//       spotifyController.addListener("playback_update", handlePlaybackUpdate);
//       spotifyController.play();
//     });
//   } else {
//     // Reuse the existing player — load the new track and play it.
//     spotifyController.loadUri(uri);
//     spotifyController.play();
//   }
// }
function openAtTimestamp(trackId) {
  const uri = `spotify:track:${trackId}`;

  playerBar.classList.add("active");
  startParticles();

  if (!spotifyApi) {
    setTimeout(() => openAtTimestamp(trackId), 300);
    return;
  }

  if (!spotifyController) {
    const options = { uri };
    spotifyApi.createController(embedContainer, options, (controller) => {
      spotifyController = controller;
      spotifyController.play();
    });
  } else {
    spotifyController.loadUri(uri);
    spotifyController.play();
  }
}

/**
 * Fires repeatedly as the player reports state. We wait until
 * playback has genuinely started (not paused, real duration
 * known) before seeking — seeking too early gets ignored.
 */
// function handlePlaybackUpdate(e) {
//   if (hasSeekedForCurrentLoad) return;

//   const data = e && e.data;
//   if (data && !data.isPaused && typeof data.duration === "number" && data.duration > 0) {
//     hasSeekedForCurrentLoad = true;
//     spotifyController.seek(pendingSeekSeconds);
//   }
// }
  function closePlayer() {
    playerBar.classList.remove("active");
    stopParticles(); // ← sparkles stop when player closes
    if (spotifyController) {
      spotifyController.pause();
    }
  }

  /**
   * Animate song cards entrance when page becomes visible.
   */
  function animateEntrance() {
    if (entranceAnimated) return;
    entranceAnimated = true;

    const cards = songsContainer.querySelectorAll(".song-card");
    gsap.fromTo(
      cards,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "opacity,transform",
      }
    );
  }

  return { init, animateEntrance };
})();