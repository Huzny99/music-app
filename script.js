// Linked List Node Implementation
class SongNode {
  constructor(song) {
    this.song = song;
    this.next = null;
    this.previous = null;
  }
}

// Doubly Linked List ADT Implementation
class PlaylistLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  add(song) {
    const newNode = new SongNode(song);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.previous = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return true;
  }

  removeAt(index) {
    if (index < 0 || index >= this.size) return false;

    let nodeToRemove = this.getNodeAt(index);

    if (nodeToRemove === this.current) {
      this.current = nodeToRemove.next || nodeToRemove.previous;
    }

    if (nodeToRemove === this.head && nodeToRemove === this.tail) {
      this.head = null;
      this.tail = null;
    } else if (nodeToRemove === this.head) {
      this.head = nodeToRemove.next;
      this.head.previous = null;
    } else if (nodeToRemove === this.tail) {
      this.tail = nodeToRemove.previous;
      this.tail.next = null;
    } else {
      nodeToRemove.previous.next = nodeToRemove.next;
      nodeToRemove.next.previous = nodeToRemove.previous;
    }

    this.size--;
    return true;
  }

  move(fromIndex, toIndex) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.size ||
      toIndex < 0 ||
      toIndex >= this.size ||
      fromIndex === toIndex
    )
      return false;

    const song = this.getAt(fromIndex);
    this.removeAt(fromIndex);
    // Insert directly at target index; after removal, indices reflect the new list
    this.insertAt(toIndex, song);
    return true;
  }

  insertAt(index, song) {
    if (index < 0 || index > this.size) return false;

    if (index === this.size) {
      return this.add(song);
    }

    const newNode = new SongNode(song);
    const nodeAtIndex = this.getNodeAt(index);

    newNode.next = nodeAtIndex;
    newNode.previous = nodeAtIndex.previous;

    if (nodeAtIndex.previous) {
      nodeAtIndex.previous.next = newNode;
    } else {
      this.head = newNode;
    }

    nodeAtIndex.previous = newNode;
    this.size++;
    return true;
  }

  getNodeAt(index) {
    if (index < 0 || index >= this.size) return null;

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current.next;
    }
    return current;
  }

  getAt(index) {
    const node = this.getNodeAt(index);
    return node ? node.song : null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.song);
      current = current.next;
    }
    return result;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  shuffle() {
    const songs = this.toArray();

    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }

    this.clear();
    songs.forEach((song) => this.add(song));
  }

  next() {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return this.current.song;
    }
    return null;
  }

  previous() {
    if (this.current && this.current.previous) {
      this.current = this.current.previous;
      return this.current.song;
    }
    return null;
  }

  getCurrentSong() {
    return this.current ? this.current.song : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  findSong(songPath) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (current.song.path === songPath) {
        this.current = current;
        return index;
      }
      current = current.next;
      index++;
    }
    return -1;
  }
}

// Global variables
let musicLibrary = [];
let playlist = new PlaylistLinkedList();
let savedPlaylists = JSON.parse(localStorage.getItem("musicPlaylists")) || {};
let currentPlaylistId = null;
let audioPlayer = null;
let isPlaying = false;
let isRepeat = false;

// Login functionality
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "huzny" && password === "1234") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("currentUser").textContent = username;
    initializeApp();
  } else {
    document.getElementById("loginError").textContent =
      "Invalid credentials! Use huzny/1234";
  }
});

function logout() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("app").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").textContent = "";
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  isPlaying = false;
}

// Initialize the application
function initializeApp() {
  audioPlayer = document.getElementById("audioPlayer");
  setupAudioPlayer();
  setupVolumeControl();
  renderPlaylists();
  renderPlaylist();
}

// Setup audio player event listeners
function setupAudioPlayer() {
  audioPlayer.addEventListener("loadedmetadata", updateNowPlaying);
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", handleSongEnd);
  audioPlayer.addEventListener("error", handleAudioError);
}

// Setup volume control
function setupVolumeControl() {
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeValue = document.getElementById("volumeValue");

  volumeSlider.addEventListener("input", function () {
    const volume = this.value / 100;
    audioPlayer.volume = volume;
    volumeValue.textContent = this.value + "%";
  });

  // Set initial volume
  audioPlayer.volume = 0.5;
}

// Scan music folder (simulated - in real implementation, this would require a backend)
async function scanMusicFolder() {
  const libraryContainer = document.getElementById("songLibrary");
  libraryContainer.innerHTML =
    '<div class="loading">Scanning music folder...</div>';

  // Simulate scanning delay
  setTimeout(() => {
    // Demo songs - in real implementation, these would come from scanning ./music/ folder
    musicLibrary = [
      {
        id: 1,
        title: "Good Days",
        artist: "Aylex",
        path: "./songs/Aylex - Good Days (freetouse.com).mp3",
        duration: "1:58",
      },
      {
        id: 2,
        title: "A New Day",
        artist: "Ethan Sturock",
        path: "./songs/Ethan Sturock - A New Day (freetouse.com).mp3",
        duration: "3:22",
      },
      {
        id: 3,
        title: "November",
        artist: "Limujii",
        path: "./songs/Limujii - November (freetouse.com).mp3",
        duration: "2:47",
      },
      {
        id: 4,
        title: "Exotic",
        artist: "Luke Bergs & Lichu",
        path: "./songs/Luke Bergs & Lichu - Exotic (freetouse.com).mp3",
        duration: "2:44",
      },
      {
        id: 5,
        title: "Metropolitan",
        artist: "Moavii - Dagored",
        path: "./songs/Moavii - Dagored - Metropolitan (freetouse.com).mp3",
        duration: "1:41",
      },
      {
        id: 6,
        title: "Endless",
        artist: "Moavii",
        path: "./songs/Moavii - Endless (freetouse.com).mp3",
        duration: "2:39",
      },
      {
        id: 7,
        title: "Sonnea",
        artist: "Moavii",
        path: "./songs/Moavii - Sonnea (freetouse.com).mp3",
        duration: "1:52",
      },
      {
        id: 8,
        title: "Stadium Rock",
        artist: "Pufino",
        path: "./songs/Pufino - Stadium Rock (freetouse.com).mp3",
        duration: "1:53",
      },
      {
        id: 9,
        title: "Hawaii",
        artist: "Waesto",
        path: "./songs/Waesto - Hawaii (freetouse.com).mp3",
        duration: "3:05",
      },
      {
        id: 10,
        title: "Sunset",
        artist: "Waesto",
        path: "./songs/Waesto - Sunset (freetouse.com).mp3",
        duration: "2:14",
      },
      {
        id: 11,
        title: "Leader",
        artist: "Zambolino",
        path: "./songs/Zambolino - Leader (freetouse.com).mp3",
        duration: "1:35",
      },
      {
        id: 12,
        title: "Smooth Place",
        artist: "Zambolino",
        path: "./songs/Zambolino - Smooth Place (freetouse.com).mp3",
        duration: "1:57",
      },
    ];

    renderSongLibrary();
  }, 1000);
}

// Render song library
function renderSongLibrary() {
  const libraryContainer = document.getElementById("songLibrary");

  if (musicLibrary.length === 0) {
    libraryContainer.innerHTML =
      '<div class="loading">No songs found in ./music/ folder</div>';
    return;
  }

  libraryContainer.innerHTML = "";

  musicLibrary.forEach((song) => {
    const songElement = document.createElement("div");
    songElement.className = "song-item";
    songElement.innerHTML = `
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                        <div class="song-duration">${song.duration}</div>
                    </div>
                    <button class="add-btn" onclick="addToPlaylist(${song.id})">Add</button>
                `;
    libraryContainer.appendChild(songElement);
  });
}

// Playlist Management
function createNewPlaylist() {
  const nameInput = document.getElementById("newPlaylistName");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Please enter a playlist name");
    return;
  }

  if (savedPlaylists[name]) {
    alert("Playlist name already exists");
    return;
  }

  savedPlaylists[name] = {
    id: Date.now(),
    name: name,
    songs: [],
    created: new Date().toISOString(),
  };

  localStorage.setItem("musicPlaylists", JSON.stringify(savedPlaylists));
  nameInput.value = "";
  renderPlaylists();
}

function renderPlaylists() {
  const playlistContainer = document.getElementById("playlistList");
  playlistContainer.innerHTML = "";

  const playlists = Object.values(savedPlaylists);

  if (playlists.length === 0) {
    playlistContainer.innerHTML =
      '<p style="text-align: center; color: #666;">No saved playlists</p>';
    return;
  }

  playlists.forEach((playlist) => {
    const playlistElement = document.createElement("div");
    playlistElement.innerHTML = `
                    <div class="playlist-header ${
                      currentPlaylistId === playlist.id ? "active" : ""
                    }" 
                         onclick="loadPlaylist('${playlist.name}')">
                        <div>
                            <strong>${playlist.name}</strong>
                            <div style="font-size: 0.8em; color: #666;">
                                ${playlist.songs.length} songs
                            </div>
                        </div>
                        <div class="playlist-actions" onclick="event.stopPropagation()">
                            <button class="playlist-btn edit-btn" onclick="editPlaylist('${
                              playlist.name
                            }')">Edit</button>
                            <button class="playlist-btn delete-btn" onclick="deletePlaylist('${
                              playlist.name
                            }')">Delete</button>
                            <button class="playlist-btn load-btn" onclick="loadPlaylist('${
                              playlist.name
                            }')">Load</button>
                        </div>
                    </div>
                `;
    playlistContainer.appendChild(playlistElement);
  });
}

function loadPlaylist(playlistName) {
  const playlistData = savedPlaylists[playlistName];
  if (!playlistData) return;

  currentPlaylistId = playlistData.id;
  document.getElementById("currentPlaylistName").textContent = playlistName;

  // Clear current playlist and load saved songs
  playlist.clear();
  playlistData.songs.forEach((song) => {
    playlist.add(song);
  });

  renderPlaylist();
  renderPlaylists();
}

function editPlaylist(playlistName) {
  const modal = document.getElementById("editModal");
  const input = document.getElementById("editPlaylistName");

  input.value = playlistName;
  input.dataset.originalName = playlistName;
  modal.style.display = "block";
}

function updatePlaylistName() {
  const input = document.getElementById("editPlaylistName");
  const newName = input.value.trim();
  const originalName = input.dataset.originalName;

  if (!newName) {
    alert("Please enter a playlist name");
    return;
  }

  if (newName !== originalName && savedPlaylists[newName]) {
    alert("Playlist name already exists");
    return;
  }

  // Update playlist name
  const playlistData = savedPlaylists[originalName];
  playlistData.name = newName;

  if (newName !== originalName) {
    savedPlaylists[newName] = playlistData;
    delete savedPlaylists[originalName];

    // Update current playlist name if it's the one being edited
    if (
      document.getElementById("currentPlaylistName").textContent ===
      originalName
    ) {
      document.getElementById("currentPlaylistName").textContent = newName;
    }
  }

  localStorage.setItem("musicPlaylists", JSON.stringify(savedPlaylists));
  closeEditModal();
  renderPlaylists();
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function deletePlaylist(playlistName) {
  if (!confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

  delete savedPlaylists[playlistName];
  localStorage.setItem("musicPlaylists", JSON.stringify(savedPlaylists));

  // If deleted playlist is currently loaded, reset
  if (
    document.getElementById("currentPlaylistName").textContent === playlistName
  ) {
    document.getElementById("currentPlaylistName").textContent = "Untitled";
    currentPlaylistId = null;
  }

  renderPlaylists();
}

function saveCurrentPlaylist() {
  if (playlist.isEmpty()) {
    alert("Current playlist is empty!");
    return;
  }

  const currentName = document.getElementById(
    "currentPlaylistName"
  ).textContent;
  let playlistName = currentName;

  if (currentName === "Untitled" || !currentPlaylistId) {
    playlistName = prompt("Enter playlist name:");
    if (!playlistName) return;

    if (savedPlaylists[playlistName]) {
      if (!confirm("Playlist already exists. Overwrite?")) return;
    }
  }

  savedPlaylists[playlistName] = {
    id: currentPlaylistId || Date.now(),
    name: playlistName,
    songs: playlist.toArray(),
    created: new Date().toISOString(),
  };

  currentPlaylistId = savedPlaylists[playlistName].id;
  document.getElementById("currentPlaylistName").textContent = playlistName;

  localStorage.setItem("musicPlaylists", JSON.stringify(savedPlaylists));
  renderPlaylists();
  alert(`Playlist "${playlistName}" saved successfully!`);
}

// Add song to current playlist
function addToPlaylist(songId) {
  const song = musicLibrary.find((s) => s.id === songId);
  if (song) {
    playlist.add({ ...song });
    renderPlaylist();
  }
}

// Render current playlist
function renderPlaylist() {
  const playlistContainer = document.getElementById("playlist");
  playlistContainer.innerHTML = "";

  if (playlist.isEmpty()) {
    playlistContainer.innerHTML =
      '<p style="text-align: center; color: #666; font-style: italic;">Your playlist is empty. Add some songs!</p>';
    return;
  }

  const songs = playlist.toArray();
  const currentSong = playlist.getCurrentSong();

  songs.forEach((song, index) => {
    const isCurrentlyPlaying =
      currentSong && currentSong.path === song.path && isPlaying;
    const songElement = document.createElement("div");
    songElement.className = `playlist-item ${
      isCurrentlyPlaying ? "playing" : ""
    }`;
    songElement.innerHTML = `
                    <div class="song-info" onclick="playSongAt(${index})" style="cursor: pointer;">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist} • ${
      song.duration
    }</div>
                    </div>
                    <div class="playlist-controls-item">
                        ${
                          index > 0
                            ? `<button class="control-btn move-btn" onclick="moveUp(${index})">↑</button>`
                            : ""
                        }
                        ${
                          index < songs.length - 1
                            ? `<button class="control-btn move-btn" onclick="moveDown(${index})">↓</button>`
                            : ""
                        }
                        <button class="control-btn remove-btn" onclick="removeFromPlaylist(${index})">Remove</button>
                    </div>
                `;
    playlistContainer.appendChild(songElement);
  });
}

// Audio player functions
function playSongAt(index) {
  const song = playlist.getAt(index);
  if (!song) return;

  // Set current song in playlist
  playlist.current = playlist.getNodeAt(index);

  // Load and play the audio
  audioPlayer.src = song.path;
  audioPlayer.load();

  audioPlayer
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayButton();
      renderPlaylist();
      updateNowPlaying();
    })
    .catch((error) => {
      console.error("Error playing audio:", error);
      alert(
        `Error playing "${song.title}". File may not exist at ${song.path}`
      );
    });
}

function togglePlayPause() {
  if (!playlist.getCurrentSong()) {
    alert(
      "No song selected. Click on a song in the playlist to start playing."
    );
    return;
  }

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
  } else {
    audioPlayer
      .play()
      .then(() => {
        isPlaying = true;
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
        const currentSong = playlist.getCurrentSong();
        alert(
          `Error playing "${currentSong.title}". File may not exist at ${currentSong.path}`
        );
      });
  }

  updatePlayButton();
  renderPlaylist();
}

function updatePlayButton() {
  const playBtn = document.getElementById("playBtn");
  playBtn.textContent = isPlaying ? "⏸️ Pause" : "▶️ Play";
}

function nextSong() {
  const nextSong = playlist.next();
  if (nextSong) {
    audioPlayer.src = nextSong.path;
    audioPlayer.load();

    if (isPlaying) {
      audioPlayer.play().catch((error) => {
        console.error("Error playing next song:", error);
      });
    }

    renderPlaylist();
    updateNowPlaying();
  } else if (isRepeat && !playlist.isEmpty()) {
    // Loop to beginning
    playlist.current = playlist.head;
    const firstSong = playlist.getCurrentSong();
    audioPlayer.src = firstSong.path;
    audioPlayer.load();

    if (isPlaying) {
      audioPlayer.play().catch((error) => {
        console.error("Error playing first song:", error);
      });
    }

    renderPlaylist();
    updateNowPlaying();
  }
}

function previousSong() {
  const prevSong = playlist.previous();
  if (prevSong) {
    audioPlayer.src = prevSong.path;
    audioPlayer.load();

    if (isPlaying) {
      audioPlayer.play().catch((error) => {
        console.error("Error playing previous song:", error);
      });
    }

    renderPlaylist();
    updateNowPlaying();
  } else if (isRepeat && !playlist.isEmpty()) {
    // Loop to end
    playlist.current = playlist.tail;
    const lastSong = playlist.getCurrentSong();
    audioPlayer.src = lastSong.path;
    audioPlayer.load();

    if (isPlaying) {
      audioPlayer.play().catch((error) => {
        console.error("Error playing last song:", error);
      });
    }

    renderPlaylist();
    updateNowPlaying();
  }
}

function shufflePlaylist() {
  if (playlist.isEmpty()) {
    alert("Add some songs to the playlist first!");
    return;
  }

  playlist.shuffle();
  renderPlaylist();
  updateNowPlaying();
  alert("Playlist shuffled!");
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = event.target;
  btn.style.background = isRepeat ? "#28a745" : "#ffc107";
  btn.textContent = isRepeat ? "🔁 Repeat: ON" : "🔁 Repeat";
}

// Remove song from current playlist
function removeFromPlaylist(index) {
  playlist.removeAt(index);
  renderPlaylist();
  updateNowPlaying();
}

// Move song up in playlist
function moveUp(index) {
  if (index > 0) {
    playlist.move(index, index - 1);
    renderPlaylist();
  }
}

// Move song down in playlist
function moveDown(index) {
  if (index < playlist.size - 1) {
    playlist.move(index, index + 1);
    renderPlaylist();
  }
}

// Clear entire playlist
function clearPlaylist() {
  if (
    !playlist.isEmpty() &&
    !confirm("Are you sure you want to clear the current playlist?")
  ) {
    return;
  }

  playlist.clear();
  audioPlayer.pause();
  audioPlayer.src = "";
  isPlaying = false;
  updatePlayButton();
  renderPlaylist();
  updateNowPlaying();

  // Reset playlist name if it's not saved
  if (!currentPlaylistId) {
    document.getElementById("currentPlaylistName").textContent = "Untitled";
  }
}

// Update now playing display
function updateNowPlaying() {
  const currentSong = playlist.getCurrentSong();
  const nowPlayingElement = document.getElementById("currentSong");

  if (currentSong) {
    nowPlayingElement.innerHTML = `
                    <strong>${currentSong.title}</strong><br>
                    <span style="color: #666;">${currentSong.artist}</span><br>
                    <small style="color: #888;">${currentSong.path}</small>
                `;
  } else {
    nowPlayingElement.textContent = "No song selected";
  }
}

// Progress bar functionality
function updateProgress() {
  if (!audioPlayer.duration) return;

  const progressFill = document.getElementById("progressFill");
  const songTime = document.getElementById("songTime");

  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressFill.style.width = progress + "%";

  const currentTime = formatTime(Math.floor(audioPlayer.currentTime));
  const totalTime = formatTime(Math.floor(audioPlayer.duration));
  songTime.textContent = `${currentTime} / ${totalTime}`;
}

function seekTo(event) {
  if (!audioPlayer.duration) return;

  const progressBar = document.getElementById("progressBar");
  const rect = progressBar.getBoundingClientRect();
  const clickPosition = (event.clientX - rect.left) / rect.width;
  const newTime = clickPosition * audioPlayer.duration;

  audioPlayer.currentTime = newTime;
}

function handleSongEnd() {
  if (isRepeat) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  } else {
    nextSong();
    if (!playlist.getCurrentSong()) {
      // End of playlist
      isPlaying = false;
      updatePlayButton();
      renderPlaylist();
    }
  }
}

function handleAudioError(event) {
  console.error("Audio error:", event);
  const currentSong = playlist.getCurrentSong();
  if (currentSong) {
    console.error(`Failed to load: ${currentSong.path}`);
  }
}

// Utility functions
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("editModal");
  if (event.target === modal) {
    closeEditModal();
  }
};
