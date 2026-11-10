// Reusable garden monitor. Only supported YouTube URLs are embedded.
window.GardenCamera = (() => {
    const statuses = new Set(['LIVE', 'DEMO', 'OFFLINE']);

    function localized(value, language, fallback) {
        return typeof value === 'string' ? value : value?.[language] || fallback;
    }

    function getEmbedUrl(videoUrl) {
        if (typeof videoUrl !== 'string' || !videoUrl.trim()) return null;

        try {
            const url = new URL(videoUrl);
            if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

            const host = url.hostname.toLowerCase();
            let id = null;
            if (host === 'youtu.be' || host === 'www.youtu.be') {
                id = url.pathname.slice(1);
            } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)) {
                const parts = url.pathname.split('/').filter(Boolean);
                id = parts[0] === 'watch' ? url.searchParams.get('v')
                    : ['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : null;
            }

            if (!/^[a-zA-Z0-9_-]{11}$/.test(id || '')) return null;
            return `https://www.youtube-nocookie.com/embed/${id}?loop=1&playlist=${id}&playsinline=1`;
        } catch (_) {
            return null;
        }
    }

    function render(container, {
        videoUrl, title, cameraId = 'CAM-01', farmName, location,
        status = 'OFFLINE', language = 'VI'
    } = {}) {
        if (!container) return;

        const isEnglish = language === 'EN';
        const requestedStatus = statuses.has(status) ? status : 'OFFLINE';
        const embedUrl = getEmbedUrl(videoUrl);
        const displayStatus = requestedStatus === 'OFFLINE' || !embedUrl ? 'OFFLINE' : requestedStatus;
        const videoTitle = localized(title, language, isEnglish ? 'Durian orchard' : 'Vườn sầu riêng');

        const card = document.createElement('section');
        card.className = 'max-w-5xl mx-auto bg-durian-dark border border-durian-lighter rounded-xl overflow-hidden shadow-2xl';

        const heading = document.createElement('div');
        heading.className = 'p-4 sm:px-6 bg-durian-light flex flex-wrap items-center justify-between gap-3 border-b border-durian-lighter';

        const identity = document.createElement('div');
        identity.className = 'flex items-center gap-3 min-w-0';

        const cameraSymbol = document.createElement('span');
        cameraSymbol.className = 'w-10 h-10 shrink-0 rounded-lg bg-durian flex items-center justify-center text-durian-gold text-xl border border-durian-lighter';
        cameraSymbol.textContent = '◉';
        cameraSymbol.setAttribute('aria-hidden', 'true');

        const nameGroup = document.createElement('div');
        nameGroup.className = 'min-w-0';

        const idElement = document.createElement('span');
        idElement.className = 'block text-[10px] font-bold tracking-[0.18em] text-durian-gold';
        idElement.textContent = cameraId;

        const titleElement = document.createElement('h2');
        titleElement.className = 'font-serif text-lg sm:text-xl text-white leading-tight';
        titleElement.textContent = videoTitle;

        nameGroup.append(idElement, titleElement);
        identity.append(cameraSymbol, nameGroup);

        const controls = document.createElement('div');
        controls.className = 'flex flex-wrap items-center gap-2';

        if (displayStatus !== 'DEMO') {
            const badge = document.createElement('span');
            badge.className = 'text-[10px] sm:text-xs font-bold tracking-wider rounded-full px-3 py-1.5 border';
            badge.className += displayStatus === 'LIVE'
                ? ' text-red-300 border-red-400/50 bg-red-900/30'
                : ' text-durian-accent border-durian-lighter bg-durian';
            badge.textContent = displayStatus;
            controls.appendChild(badge);
        }
        heading.append(identity, controls);
        card.appendChild(heading);

        const media = document.createElement('div');
        media.className = 'relative w-full aspect-video bg-black';

        if (displayStatus === 'OFFLINE') {
            media.className += ' flex items-center justify-center p-6 text-center';
            const fallback = document.createElement('p');
            fallback.className = 'text-durian-accent text-sm sm:text-base';
            fallback.textContent = isEnglish ? 'Garden video is unavailable right now.' : 'Hiện chưa có video khu vườn.';
            media.appendChild(fallback);
        } else {
            const iframe = document.createElement('iframe');
            iframe.className = 'absolute inset-0 w-full h-full';
            iframe.src = embedUrl;
            iframe.title = videoTitle;
            iframe.loading = 'lazy';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            media.appendChild(iframe);

            const fullscreen = document.createElement('button');
            fullscreen.type = 'button';
            fullscreen.className = 'text-xs font-semibold text-durian-accent border border-durian-lighter rounded-md px-3 py-1.5 hover:text-white hover:border-durian-gold transition-colors';
            fullscreen.textContent = isEnglish ? 'Fullscreen' : 'Toàn màn hình';
            fullscreen.setAttribute('aria-label', isEnglish ? `Fullscreen ${cameraId}` : `Xem toàn màn hình ${cameraId}`);
            fullscreen.addEventListener('click', () => {
                if (iframe.requestFullscreen) iframe.requestFullscreen().catch(() => {});
            });
            controls.appendChild(fullscreen);
        }
        card.appendChild(media);

        const details = document.createElement('div');
        details.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 sm:px-6 py-4 border-t border-durian-lighter text-sm';
        const fields = [
            [isEnglish ? 'Farm' : 'Nông trại', localized(farmName, language, 'Durapure')],
            [isEnglish ? 'Video location' : 'Vị trí video', localized(location, language, isEnglish ? 'Unverified' : 'Chưa xác minh')]
        ];
        fields.forEach(([label, value]) => {
            const field = document.createElement('div');
            const fieldLabel = document.createElement('span');
            fieldLabel.className = 'block text-[10px] uppercase tracking-wider text-durian-accent/60 mb-1';
            fieldLabel.textContent = label;
            const fieldValue = document.createElement('span');
            fieldValue.className = 'text-white font-semibold';
            fieldValue.textContent = value;
            field.append(fieldLabel, fieldValue);
            details.appendChild(field);
        });
        card.appendChild(details);

        container.replaceChildren(card);
    }

    return { render, getEmbedUrl };
})();
