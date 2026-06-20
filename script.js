// ================================================================
//  CST UNCENSORED – script.js
//  Photo Album: IndexedDB storage (32GB+), password-protected upload
// ================================================================

// ============ CLASSMATES DATA ============
const classmates = [
    {
        id: 1,
        name: "ADDREERAJ DAS",
        location: "Chinsurah, Hooghly, West Bengal",
        social: { platform: "instagram", url: "https://www.instagram.com/addreeraj?igsh=MTU0eGVmY3R6aGI5Mw==", label: "@addreeraj" },
        bio: "JUST ANOTHER GUY IN A GREEN ROOM 🟢😴",
        avatar: "WhatsApp Image 2026-06-20 at 3.26.56 PM.jpeg",
        coordinates: [22.8978, 88.3950],
        city: "Chinsurah, Hooghly"
    },
    {
        id: 2,
        name: "SOM MAJHI",
        location: "Dhaniakhali, Hooghly, West Bengal",
        social: { platform: "instagram", url: "https://www.instagram.com/addreeraj?igsh=MTU0eGVmY3R6aGI5Mw==", label: "@somoneiro" },
        bio: "BOLD, BRAVE AND BEAUTIFUL 👑✨",
        avatar: "WhatsApp Image 2026-06-20 at 3.24.50 PM.jpeg",
        coordinates: [22.9670, 88.0980],
        city: "Dhaniakhali, Hooghly"
    },
    {
        id: 3,
        name: "TANMOY MAJHI",
        location: "Uttarpara, Hooghly, West Bengal",
        social: { platform: "facebook", url: "https://www.facebook.com/share/18kmw9puBQ/", label: "Tanmoy Majhi" },
        bio: "MEMER 😂🔥",
        avatar: "WhatsApp Image 2026-06-20 at 3.24.32 PM.jpeg",
        coordinates: [22.6700, 88.3480],
        city: "Uttarpara, Hooghly"
    },
    {
        id: 4,
        name: "SUMAN BHAKTA",
        location: "Mohanad, Hooghly, West Bengal",
        social: { platform: "facebook", url: "https://www.facebook.com/share/1BLyTiJxEz/", label: "ẞuman Bhakta" },
        bio: "RAM RAM 🙏🕉️",
        avatar: "WhatsApp Image 2026-06-20 at 3.23.49 PM.jpeg",
        coordinates: [22.9543, 88.1676],
        city: "Mohanad, Hooghly"
    },
    {
        id: 5,
        name: "SUBHAM BHAKTA",
        location: "Tarakeswar, Hooghly, West Bengal",
        social: { platform: "instagram", url: "https://www.instagram.com/cyclone__06?igsh=aWpwbWNnZDByaWdu", label: "@cyclone_06" },
        bio: "MAHADEV 🔱💪",
        avatar: "WhatsApp Image 2026-06-20 at 3.38.22 PM.jpeg",
        coordinates: [22.8865, 88.0160],
        city: "Tarakeswar, Hooghly"
    },
    {
        id: 6,
        name: "DEVAPRIYA PAUL KUNDU",
        location: "Khanakul, Hooghly, West Bengal",
        social: { platform: "instagram", url: "https://www.instagram.com/imdevapriyapaul?igsh=MWY2ODk4MGY1eG1kMQ==", label: "@imdevapriyapaul" },
        bio: "404 SLEEP NOT FOUND 🛌💤",
        avatar: "WhatsApp Image 2026-06-20 at 3.42.47 PM.jpeg",
        coordinates: [22.7200, 87.8600],
        city: "Khanakul, Hooghly"
    },
    {
        id: 7,
        name: "SAYAN DAS",
        location: "Howrah, West Bengal",
        social: { platform: "instagram", url: "https://www.instagram.com/sayandas.neel?igsh=MWJsdG5mNWFycW5lMQ==", label: "@sayandas.neel" },
        bio: "JOY MAA MOHUN BAGAN ⚽💚❤️",
        avatar: "WhatsApp Image 2026-06-20 at 3.32.27 PM.jpeg",
        coordinates: [22.5958, 88.2636],
        city: "Howrah"
    }
];

// ================================================================
//  🔐 ALBUM PASSWORD — Change this to whatever you want!
// ================================================================
const ALBUM_PASSWORD = "cst2026";
// ================================================================

const MAX_PHOTOS_PER_UPLOAD = 500;
const MAX_FILE_SIZE_MB = 50; // Increased to 50MB per file for high-res photos

// ================================================================
//  📦 IndexedDB Storage Engine — Replaces localStorage for 32GB+ capacity
// ================================================================
const DB_NAME = 'CSTUncensoredDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) { resolve(db); return; }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function (e) {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }
        };
        request.onsuccess = function (e) {
            db = e.target.result;
            resolve(db);
        };
        request.onerror = function (e) {
            reject(new Error('Failed to open database: ' + e.target.error));
        };
    });
}

function dbGetAll() {
    return openDB().then(database => new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const idx = store.index('uploadedAt');
        const request = idx.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    }));
}

function dbPut(photo) {
    return openDB().then(database => new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(photo);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    }));
}

function dbDelete(id) {
    return openDB().then(database => new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    }));
}

function dbCount() {
    return openDB().then(database => new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }));
}

// Migrate from old localStorage if needed
async function migrateFromLocalStorage() {
    const OLD_KEY = 'cst_album_photos';
    try {
        const raw = localStorage.getItem(OLD_KEY);
        if (!raw) return;
        const oldPhotos = JSON.parse(raw);
        if (!oldPhotos || oldPhotos.length === 0) return;
        console.log(`🔄 Migrating ${oldPhotos.length} photos from localStorage to IndexedDB...`);
        for (const photo of oldPhotos) {
            await dbPut(photo);
        }
        localStorage.removeItem(OLD_KEY);
        console.log('✅ Migration complete!');
    } catch (e) {
        console.warn('Migration from localStorage skipped or failed:', e);
    }
}

// ============ ALBUM HELPERS ============
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Convert File → blob stored directly (no base64 conversion needed — IndexedDB stores Blobs natively)
function fileToEntry(file, caption) {
    return new Promise((resolve, reject) => {
        // Compress image before storing
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const MAX_DIM = 2560; // Higher quality limit
            if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) { height = (height / width) * MAX_DIM; width = MAX_DIM; }
                else { width = (width / height) * MAX_DIM; height = MAX_DIM; }
            }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => {
                if (!blob) { reject(new Error('Failed to encode image')); return; }
                resolve({
                    id: generateId(),
                    blob,                        // Store as Blob — much more efficient than base64
                    caption: caption || '',
                    uploadedAt: new Date().toISOString(),
                    filename: file.name,
                    size: blob.size
                });
            }, 'image/jpeg', 0.85);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
        img.src = url;
    });
}

// Get a displayable URL from a stored photo entry
function getPhotoURL(photo) {
    if (photo.blob instanceof Blob) {
        return URL.createObjectURL(photo.blob);
    }
    // Legacy: base64 string from old localStorage data
    return photo.src || '';
}

// Format bytes into human-readable
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ================================================================
//  MAIN INIT
// ================================================================
document.addEventListener('DOMContentLoaded', async function () {

    // ---- DOM refs ----
    const themeToggle      = document.getElementById('themeToggle');
    const membersGrid      = document.getElementById('membersGrid');
    const searchInput      = document.getElementById('searchInput');
    const lightbox         = document.getElementById('lightbox');
    const lightboxImg      = document.getElementById('lightboxImg');
    const lightboxCaption  = document.getElementById('lightboxCaption');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    const locationLegend   = document.getElementById('locationLegend');

    // Album
    const albumGrid        = document.getElementById('albumGrid');
    const albumEmpty       = document.getElementById('albumEmpty');
    const albumCount       = document.getElementById('albumCount');
    const openUploadModal  = document.getElementById('openUploadModal');
    const uploadModal      = document.getElementById('uploadModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    const stepPassword     = document.getElementById('stepPassword');
    const stepUpload       = document.getElementById('stepUpload');
    const albumPassword    = document.getElementById('albumPassword');
    const verifyPassword   = document.getElementById('verifyPassword');
    const pwError          = document.getElementById('pwError');
    const togglePw         = document.getElementById('togglePw');
    const fileDropArea     = document.getElementById('fileDropArea');
    const fileInput        = document.getElementById('fileInput');
    const photoCaption     = document.getElementById('photoCaption');
    const previewStrip     = document.getElementById('previewStrip');
    const confirmUpload    = document.getElementById('confirmUpload');
    const uploadError      = document.getElementById('uploadError');

    // Delete modal
    const deleteModal      = document.getElementById('deleteModal');
    const deletePassword   = document.getElementById('deletePassword');
    const confirmDelete    = document.getElementById('confirmDelete');
    const cancelDelete     = document.getElementById('cancelDelete');
    const deleteError      = document.getElementById('deleteError');
    const lbDeleteBtn      = document.getElementById('lbDeleteBtn');

    // State
    let pendingFiles      = [];
    let photoToDelete     = null;
    let lightboxCurrentId = null;
    let lightboxCurrentURL = null; // Track blob URLs to revoke

    // ---- Init DB & migrate ----
    try {
        await openDB();
        await migrateFromLocalStorage();
    } catch (e) {
        console.error('IndexedDB init failed:', e);
    }

    // ============ THEME TOGGLE ============
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // ============ RENDER MEMBERS ============
    function renderMembers(members) {
        membersGrid.innerHTML = '';
        members.forEach(function (member, index) {
            const card = document.createElement('div');
            card.className = 'member-card glass-card';
            card.setAttribute('data-name', member.name.toLowerCase());
            card.style.animationDelay = (index * 0.1) + 's';
            const isHooghly = member.location.includes('Hooghly');
            card.innerHTML = `
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar"
                     onerror="this.src='https://via.placeholder.com/400x400?text=${member.name.charAt(0)}'">
                <h3 class="member-name">${member.name}</h3>
                <div class="member-info">
                    <i class="fas fa-map-marker-alt"></i><span>${member.location}</span>
                </div>
                <a href="${member.social.url}" target="_blank" class="social-link">
                    <i class="fab fa-${member.social.platform}"></i> ${member.social.label}
                </a>
                <div class="member-bio">
                    <i class="fas fa-quote-left"></i> ${member.bio}
                </div>
                ${isHooghly
                    ? '<div style="margin-top:12px;font-size:0.8rem;color:var(--accent2);">Hooghly</div>'
                    : '<div style="margin-top:12px;font-size:0.8rem;color:var(--accent);">Howrah</div>'}
            `;
            membersGrid.appendChild(card);
        });
    }

    // ============ SEARCH ============
    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.member-card').forEach(function (card) {
            const name = card.getAttribute('data-name');
            card.classList.toggle('hidden', !name.includes(term));
        });
    });

    // ============ MAP ============
    function initMap() {
        const map = L.map('map').setView([22.8, 88.2], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);

        const hooghlyIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background:#ffd700;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(255,215,0,0.6);'></div>",
            iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -20]
        });
        const howrahIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background:#ff6b6b;width:35px;height:35px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(255,107,107,0.6);'></div>",
            iconSize: [35, 35], iconAnchor: [17, 17], popupAnchor: [0, -20]
        });

        const markersArray = [];
        classmates.forEach(function (member) {
            const isHooghly = member.location.includes('Hooghly');
            const icon = isHooghly ? hooghlyIcon : howrahIcon;
            const marker = L.marker(member.coordinates, { icon }).addTo(map);
            markersArray.push(marker);
            marker.bindPopup(`
                <div style="text-align:center;padding:5px;">
                    <strong style="color:${isHooghly ? '#ffd700' : '#ff6b6b'};font-size:16px;">${member.name}</strong><br>
                    <span style="font-size:13px;">📍 ${member.city}</span><br>
                    <span style="font-size:11px;">${member.bio}</span><br>
                    <span style="font-size:10px;color:${isHooghly ? '#ffd700' : '#ff6b6b'};font-weight:bold;">
                        ${isHooghly ? 'Hooghly District' : 'Howrah'}
                    </span>
                </div>
            `);
        });

        if (markersArray.length > 0) {
            const group = new L.featureGroup(markersArray);
            map.fitBounds(group.getBounds().pad(0.2));
        }
        return map;
    }

    // ============ LOCATION LEGEND ============
    function renderLocationLegend() {
        locationLegend.innerHTML = '';
        classmates.forEach(function (member) {
            const card = document.createElement('div');
            card.className = 'location-card glass-card';
            const isHooghly = member.location.includes('Hooghly');
            card.innerHTML = `
                <div class="location-icon"><i class="fas ${isHooghly ? 'fa-map-pin' : 'fa-location-dot'}" style="font-size:1.8rem;color:var(--accent);"></i></div>
                <h3 class="location-name">${member.name}</h3>
                <p class="location-city">${member.city}</p>
                <p class="location-coords">${member.location}</p>
                <p style="font-size:0.85rem;color:var(--text-secondary);margin:5px 0;">${member.bio}</p>
            `;
            card.addEventListener('click', function () {
                document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
            });
            locationLegend.appendChild(card);
        });
    }

    // ================================================================
    //  PHOTO ALBUM — IndexedDB backed
    // ================================================================

    // Track blob URLs to avoid memory leaks
    const blobURLs = new Map(); // photoId → objectURL

    function getOrCreateBlobURL(photo) {
        if (blobURLs.has(photo.id)) return blobURLs.get(photo.id);
        const url = getPhotoURL(photo);
        if (url) blobURLs.set(photo.id, url);
        return url;
    }

    function revokeBlobURL(photoId) {
        if (blobURLs.has(photoId)) {
            URL.revokeObjectURL(blobURLs.get(photoId));
            blobURLs.delete(photoId);
        }
    }

    async function updateStorageIndicator(photos) {
        // Calculate total size
        let totalBytes = 0;
        for (const p of photos) {
            if (p.blob instanceof Blob) totalBytes += p.blob.size;
            else if (p.src) totalBytes += Math.round(p.src.length * 0.75); // base64 estimate
        }
        albumCount.textContent = `${photos.length} photo${photos.length !== 1 ? 's' : ''} · ${formatBytes(totalBytes)} used`;
    }

    async function renderAlbum() {
        // Clear existing photo cards
        Array.from(albumGrid.children).forEach(child => {
            if (child !== albumEmpty) child.remove();
        });

        let photos;
        try {
            photos = await dbGetAll();
        } catch (e) {
            console.error('Failed to load photos:', e);
            photos = [];
        }

        if (photos.length === 0) {
            albumEmpty.style.display = 'block';
            albumCount.textContent = '0 photos';
            return;
        }

        albumEmpty.style.display = 'none';
        updateStorageIndicator(photos);

        // Render in chunks for performance with many photos
        const CHUNK_SIZE = 30;
        let currentIndex = 0;

        function renderChunk() {
            const chunk = photos.slice(currentIndex, currentIndex + CHUNK_SIZE);

            chunk.forEach(function (photo) {
                const card = document.createElement('div');
                card.className = 'photo-card';
                card.dataset.id = photo.id;

                const blobUrl = getOrCreateBlobURL(photo);

                card.innerHTML = `
                    <img src="${blobUrl}" alt="${photo.caption || 'Memory photo'}" loading="lazy">
                    <div class="photo-overlay">
                        <span class="photo-caption-text">${photo.caption || ''}</span>
                        <button class="photo-delete-btn" data-id="${photo.id}" title="Delete photo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                card.querySelector('img').addEventListener('click', function () {
                    openLightbox(photo, blobUrl);
                });

                card.querySelector('.photo-delete-btn').addEventListener('click', function (e) {
                    e.stopPropagation();
                    openDeleteModal(photo.id);
                });

                albumGrid.appendChild(card);
            });

            currentIndex += CHUNK_SIZE;
            if (currentIndex < photos.length) {
                requestAnimationFrame(renderChunk);
            }
        }

        renderChunk();
    }

    // ---- Upload Modal ----
    function openUploadModalFn() {
        stepPassword.classList.remove('hidden');
        stepUpload.classList.add('hidden');
        albumPassword.value = '';
        pwError.textContent = '';
        photoCaption.value = '';
        previewStrip.innerHTML = '';
        pendingFiles = [];
        uploadError.textContent = '';
        uploadModal.classList.add('active');
        setTimeout(() => albumPassword.focus(), 100);
    }

    function closeUploadModalFn() {
        uploadModal.classList.remove('active');
        pendingFiles = [];
        previewStrip.innerHTML = '';
    }

    openUploadModal.addEventListener('click', openUploadModalFn);
    closeUploadModal.addEventListener('click', closeUploadModalFn);

    uploadModal.addEventListener('click', function (e) {
        if (e.target === uploadModal) closeUploadModalFn();
    });

    togglePw.addEventListener('click', function () {
        const type = albumPassword.type === 'password' ? 'text' : 'password';
        albumPassword.type = type;
        togglePw.innerHTML = type === 'password'
            ? '<i class="fas fa-eye"></i>'
            : '<i class="fas fa-eye-slash"></i>';
    });

    albumPassword.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') verifyPassword.click();
    });

    verifyPassword.addEventListener('click', function () {
        const entered = albumPassword.value.trim();
        if (!entered) { pwError.textContent = '⚠️ Please enter the password.'; return; }
        if (entered !== ALBUM_PASSWORD) {
            pwError.textContent = '❌ Wrong password. Try again!';
            albumPassword.value = '';
            albumPassword.focus();
            return;
        }
        pwError.textContent = '';
        stepPassword.classList.add('hidden');
        stepUpload.classList.remove('hidden');
    });

    // ---- File Selection ----
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(f => {
            if (!f.type.startsWith('image/')) return false;
            const sizeMB = f.size / (1024 * 1024);
            if (sizeMB > MAX_FILE_SIZE_MB) {
                uploadError.textContent = `⚠️ "${f.name}" is too large (${sizeMB.toFixed(1)}MB). Max: ${MAX_FILE_SIZE_MB}MB`;
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            uploadError.textContent = `⚠️ Please select valid image files under ${MAX_FILE_SIZE_MB}MB.`;
            return;
        }
        if (validFiles.length > MAX_PHOTOS_PER_UPLOAD) {
            uploadError.textContent = `⚠️ Maximum ${MAX_PHOTOS_PER_UPLOAD} photos per batch. You selected ${validFiles.length}.`;
            return;
        }

        uploadError.textContent = '';
        pendingFiles = validFiles;

        // Preview strip
        previewStrip.innerHTML = '';
        const MAX_PREVIEW = 50;
        const toPreview = validFiles.slice(0, MAX_PREVIEW);

        toPreview.forEach(file => {
            const url = URL.createObjectURL(file);
            const img = document.createElement('img');
            img.src = url;
            img.className = 'preview-thumb';
            img.title = file.name;
            img.onload = () => URL.revokeObjectURL(url);
            img.onerror = () => URL.revokeObjectURL(url);
            previewStrip.appendChild(img);
        });

        if (validFiles.length > MAX_PREVIEW) {
            const more = document.createElement('div');
            more.className = 'preview-more';
            more.textContent = `+${validFiles.length - MAX_PREVIEW} more`;
            previewStrip.appendChild(more);
        }

        // Update drop area text to show count
        const countBadge = fileDropArea.querySelector('.selected-count');
        if (countBadge) countBadge.remove();
        const badge = document.createElement('p');
        badge.className = 'selected-count';
        badge.style.cssText = 'color:var(--accent);font-weight:600;margin-top:8px;';
        badge.textContent = `✅ ${validFiles.length} file${validFiles.length > 1 ? 's' : ''} selected`;
        fileDropArea.appendChild(badge);
    }

    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) handleFiles(this.files);
    });

    fileDropArea.addEventListener('click', function (e) {
        if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    fileDropArea.addEventListener('dragover', function (e) {
        e.preventDefault(); e.stopPropagation();
        fileDropArea.classList.add('drag-over');
    });
    fileDropArea.addEventListener('dragleave', function (e) {
        e.preventDefault(); e.stopPropagation();
        fileDropArea.classList.remove('drag-over');
    });
    fileDropArea.addEventListener('drop', function (e) {
        e.preventDefault(); e.stopPropagation();
        fileDropArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });

    // ---- Confirm Upload ----
    confirmUpload.addEventListener('click', async function () {
        if (pendingFiles.length === 0) {
            uploadError.textContent = '⚠️ No photos selected yet!';
            return;
        }

        confirmUpload.disabled = true;
        const originalText = confirmUpload.innerHTML;
        uploadError.textContent = '';

        const caption = photoCaption.value.trim();
        let successCount = 0;
        let errorCount = 0;

        try {
            const BATCH_SIZE = 5; // Smaller batches for large files
            for (let i = 0; i < pendingFiles.length; i += BATCH_SIZE) {
                const batch = pendingFiles.slice(i, i + BATCH_SIZE);
                confirmUpload.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving... (${Math.min(i + BATCH_SIZE, pendingFiles.length)}/${pendingFiles.length})`;

                const results = await Promise.allSettled(
                    batch.map(file => fileToEntry(file, caption))
                );

                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        try {
                            await dbPut(result.value);
                            successCount++;
                        } catch (dbErr) {
                            console.error('DB write failed:', dbErr);
                            errorCount++;
                        }
                    } else {
                        errorCount++;
                        console.error('File processing failed:', result.reason);
                    }
                }

                // Yield to UI
                await new Promise(r => setTimeout(r, 0));
            }
        } catch (err) {
            uploadError.textContent = '❌ Upload failed. Try fewer files.';
            confirmUpload.disabled = false;
            confirmUpload.innerHTML = originalText;
            return;
        }

        confirmUpload.disabled = false;
        confirmUpload.innerHTML = originalText;

        if (errorCount > 0 && successCount === 0) {
            uploadError.textContent = `❌ All ${errorCount} photos failed.`;
        } else if (errorCount > 0) {
            uploadError.textContent = `✅ ${successCount} saved, ⚠️ ${errorCount} failed.`;
        }

        if (successCount > 0) {
            closeUploadModalFn();
            await renderAlbum();
        }
    });

    // ================================================================
    //  DELETE FLOW
    // ================================================================
    function openDeleteModal(photoId) {
        photoToDelete = photoId;
        deletePassword.value = '';
        deleteError.textContent = '';
        deleteModal.classList.add('active');
        setTimeout(() => deletePassword.focus(), 100);
    }

    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        photoToDelete = null;
        deletePassword.value = '';
        deleteError.textContent = '';
    }

    cancelDelete.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) closeDeleteModal();
    });
    deletePassword.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmDelete.click();
    });

    confirmDelete.addEventListener('click', async function () {
        const entered = deletePassword.value.trim();
        if (!entered) { deleteError.textContent = '⚠️ Please enter the password.'; return; }
        if (entered !== ALBUM_PASSWORD) {
            deleteError.textContent = '❌ Wrong password!';
            deletePassword.value = '';
            deletePassword.focus();
            return;
        }

        try {
            await dbDelete(photoToDelete);
            revokeBlobURL(photoToDelete);
        } catch (e) {
            deleteError.textContent = '❌ Failed to delete. Try again.';
            return;
        }

        if (lightboxCurrentId === photoToDelete) closeLightboxFn();

        closeDeleteModal();
        await renderAlbum();
    });

    // ================================================================
    //  LIGHTBOX
    // ================================================================
    function openLightbox(photo, blobUrl) {
        lightboxCurrentId = photo.id;
        lightboxCurrentURL = blobUrl;
        lightboxImg.src = blobUrl;
        lightboxCaption.textContent = photo.caption || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightboxFn() {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
        lightboxCaption.textContent = '';
        lightboxCurrentId = null;
        lightboxCurrentURL = null;
        document.body.style.overflow = 'auto';
    }

    closeLightboxBtn.addEventListener('click', closeLightboxFn);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightboxFn();
    });
    lbDeleteBtn.addEventListener('click', function () {
        if (lightboxCurrentId) openDeleteModal(lightboxCurrentId);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('active')) closeLightboxFn();
            if (uploadModal.classList.contains('active')) closeUploadModalFn();
            if (deleteModal.classList.contains('active')) closeDeleteModal();
        }
    });

    // ============ INITIALIZE ALL ============
    initTheme();
    renderMembers(classmates);
    const map = initMap();
    renderLocationLegend();
    await renderAlbum();

    setTimeout(function () { map.invalidateSize(); }, 100);
    window.addEventListener('resize', function () { map.invalidateSize(); });

    console.log('✅ CST UNCENSORED loaded!');
    console.log('📦 Storage: IndexedDB (supports 32GB+)');
    console.log('👥 Members:', classmates.length);
});