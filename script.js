// Initialize Wavesurfer
const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'rgba(138, 43, 226, 0.5)',
    progressColor: 'rgba(0, 255, 255, 0.75)',
    cursorColor: '#8a2be2',
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 1,
    height: 120,
    barGap: 2,
    responsive: true,
    backend: 'WebAudio',
    interact: false
});

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const btnPlay = document.getElementById('btnPlay');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnShuffle = document.getElementById('btnShuffle');
const btnRepeat = document.getElementById('btnRepeat');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal');
const recentTracks = document.getElementById('recentTracks');
const recommendedTracks = document.getElementById('recommendedTracks');
const nowPlaying = document.getElementById('nowPlaying');
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');

// Sample Track Data
const tracks = [
    {
        id: 1,
        title: "Midnight City",
        artist: "M83",
        duration: "4:03",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        plays: 1245,
        liked: false
    },
    {
        id: 2,
        title: "Redbone",
        artist: "Childish Gambino",
        duration: "5:27",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        plays: 892,
        liked: true
    },
    {
        id: 3,
        title: "Blinding Lights",
        artist: "The Weeknd",
        duration: "3:20",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        plays: 1567,
        liked: false
    },
    {
        id: 4,
        title: "Levitating",
        artist: "Dua Lipa",
        duration: "3:23",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        plays: 987,
        liked: true
    },
    {
        id: 5,
        title: "Stay",
        artist: "The Kid LAROI, Justin Bieber",
        duration: "2:21",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        plays: 1342,
        liked: false
    },
    {
        id: 6,
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        duration: "2:58",
        artwork: "assets/placeholder-artwork.jpg",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        plays: 1103,
        liked: true
    }
];

// Player State
let currentTrack = null;
let isPlaying = false;
let isShuffled = false;
let isRepeating = false;

// Initialize the App
function init() {
    renderTrackLists();
    setupEventListeners();
    wavesurfer.load(audioPlayer);
}

// Render Track Lists
function renderTrackLists() {
    // Sort tracks by plays (descending) for "Recently Played"
    const recentSorted = [...tracks].sort((a, b) => b.plays - a.plays);
    
    // Render Recent Tracks
    recentTracks.innerHTML = recentSorted.slice(0, 6).map(track => `
        <div class="track-card" data-id="${track.id}">
            <div class="track-card-img">
                <img src="${track.artwork}" alt="${track.title}">
                <button class="btn-play-sm"><i class="fas fa-play"></i></button>
            </div>
            <div class="track-card-info">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
                <div class="track-stats">
                    <span><i class="fas fa-play"></i> ${track.plays.toLocaleString()}</span>
                    <span><i class="fas fa-clock"></i> ${track.duration}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Shuffle for Recommended
    const recommended = [...tracks].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Render Recommended Tracks
    recommendedTracks.innerHTML = recommended.map(track => `
        <div class="track-card" data-id="${track.id}">
            <div class="track-card-img">
                <img src="${track.artwork}" alt="${track.title}">
                <button class="btn-play-sm"><i class="fas fa-play"></i></button>
            </div>
            <div class="track-card-info">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
                <div class="track-stats">
                    <span><i class="fas fa-play"></i> ${track.plays.toLocaleString()}</span>
                    <span><i class="fas fa-clock"></i> ${track.duration}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Play/Pause Button
    btnPlay.addEventListener('click', togglePlay);
    
    // Track Cards
    document.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-play-sm')) {
                const trackId = parseInt(this.getAttribute('data-id'));
                const track = tracks.find(t => t.id === trackId);
                playTrack(track);
            }
        });
    });
    
    // Progress Bar
    progressBar.addEventListener('click', (e) => {
        const percent = e.offsetX / progressBar.offsetWidth;
        seekAudio(percent);
    });
    
    // Volume Control
    volumeBar.addEventListener('click', (e) => {
        const percent = e.offsetX / volumeBar.offsetWidth;
        setVolume(percent);
    });
    
    // Player Controls
    btnPrev.addEventListener('click', playPrevious);
    btnNext.addEventListener('click', playNext);
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);
    
    // Audio Player Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleTrackEnd);
}

// Play Track
function playTrack(track) {
    currentTrack = track;
    audioPlayer.src = track.file;
    wavesurfer.load(track.file);
    
    // Update UI
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    document.querySelector('.album-art').src = track.artwork;
    
    // Play the track
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
            nowPlaying.style.display = 'flex';
            
            // Update plays count
            track.plays += 1;
            renderTrackLists();
        })
        .catch(error => {
            console.error('Playback failed:', error);
        });
}

// Toggle Play/Pause
function togglePlay() {
    if (!currentTrack) {
        playTrack(tracks[0]);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        wavesurfer.pause();
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        wavesurfer.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

// Update Progress Bar
function updateProgress() {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${percent}%`;
    timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    wavesurfer.seekTo(percent / 100);
}

// Seek Audio
function seekAudio(percent) {
    const seekTime = percent * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

// Set Volume
function setVolume(percent) {
    audioPlayer.volume = percent;
    volumeFill.style.width = `${percent * 100}%`;
}

// Update Duration
function updateDuration() {
    timeTotal.textContent = formatTime(audioPlayer.duration);
}

// Format Time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Play Next Track
function playNext() {
    if (!currentTrack) return;
    
    let nextIndex = tracks.findIndex(t => t.id === currentTrack.id) + 1;
    if (nextIndex >= tracks.length) nextIndex = 0;
    
    playTrack(tracks[nextIndex]);
}

// Play Previous Track
function playPrevious() {
    if (!currentTrack) return;
    
    let prevIndex = tracks.findIndex(t => t.id === currentTrack.id) - 1;
    if (prevIndex < 0) prevIndex = tracks.length - 1;
    
    playTrack(tracks[prevIndex]);
}

// Handle Track End
function handleTrackEnd() {
    if (isRepeating) {
        playTrack(currentTrack);
    } else {
        playNext();
    }
}

// Toggle Shuffle
function toggleShuffle() {
    isShuffled = !isShuffled;
    btnShuffle.style.color = isShuffled ? '#00ffff' : '#e0e0e0';
    // In a full app, you would implement shuffle logic here
}

// Toggle Repeat
function toggleRepeat() {
    isRepeating = !isRepeating;
    btnRepeat.style.color = isRepeating ? '#00ffff' : '#e0e0e0';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);