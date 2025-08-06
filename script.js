const playlist = document.getElementById('playlist');
const player = document.getElementById('player');

function uploadSong() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    if (!file) return;

    const songElement = document.createElement('div');
    songElement.className = 'song';
    songElement.textContent = file.name;
    songElement.onclick = () => {
        player.src = URL.createObjectURL(file);
        player.play();
    };
    playlist.appendChild(songElement);
}