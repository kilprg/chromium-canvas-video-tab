const LINKED = "_link_added_"

/**************************************************
 * Functions for adding links
 *************************************************/
// Insert link at <video>
function add_video_tag_link(nd) {
    if(!nd.classList.contains(LINKED)) {
        const a = document.createElement('a')
        a.href = nd.src
        a.target = "__blank"
        a.innerHTML = 'Open in new tab'
        a.style = 'font-size: 12pt; line-height: 10px; display: block;'
        nd.parentElement.appendChild(a)
        nd.classList.add(LINKED)
    }
}

// Insert link at inline iframe videos
function add_iframe_video_link(nd) {
    if(!nd.classList.contains(LINKED)) {
        const a = document.createElement('a')
        a.href = nd.src
        a.target = "__blank"
        a.innerHTML = 'Open in new tab'
        a.style = 'font-size: 12pt; line-height: 10px; display: block;'
        nd.parentElement.appendChild(a)
        nd.classList.add(LINKED)
    }
}

// Insert link at video gallery node
function add_gallery_link(nd) {
    if(!nd.classList.contains(LINKED)) {
        const a = document.createElement("a")
        const color = window.getComputedStyle(nd.querySelector('p.thumb_user_content')).color

        a.href = nd.closest("div#galleryGrid") ?
            a.href = nd.querySelector('a.item_link').href.replace(/\/[^\/]+$/, '') :
            a.href = nd.querySelector('a.item_link').href.replace(/^(.*?)\/playlist.*?\/([^\/]+)$/, "$1/media/$2")
        a.target = "__blank"
        a.innerHTML = "Open in new tab"
        a.style = `color: ${color}; padding-left: 5px;`
        a.innerHTML = "Open in new tab"
        nd.querySelector('div.accordion-inner').insertAdjacentElement('afterend', a)
        nd.classList.add(LINKED)
    }
}

// Insert link at playlist item (nd is player preceding title)
function add_playlist_link(nd) {
    if(!nd.classList.contains(LINKED)) {
        const a = document.createElement("a")
        a.href = document.URL.replace(/^(.*?)\/playlist.*?\/([^\/]+)$/, "$1/media/$2")
        a.target = "__blank"
        a.innerHTML = "Open in new tab"
        nd.insertAdjacentElement('afterend', a)
        nd.classList.add(LINKED)
    }
}

// Wildcard match (https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript/32402438#32402438)
function wildcardMatch(str, rule) {
    const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

/**************************************************
 * Parse page and insert links
 *************************************************/
const urls = chrome.runtime.getManifest().content_scripts[0].matches

// Parse root document and add links for iframes with src instructure.com
document.querySelectorAll('iframe')
    .forEach(nd => {
        for (const url of urls) {
            if (wildcardMatch(nd.src, url)) {
                add_iframe_video_link(nd)
                break
            }
        }
    })

// Insert gallery video links that are initially loaded
for (const nd of document.querySelectorAll('div#galleryGrid li.galleryItem', 'div#channelCarousel li.galleryItem')) {
    add_gallery_link(nd)
}

// Monitor galleries endless scroll and add links as items elements are loaded
if (document.querySelectorAll('div#galleryGrid', 'div#channelCarousel')) {
    const observer = new MutationObserver((muts, obs) => {
        for(const mut of muts) {
            if(mut.addedNodes) {
                for(const nd of mut.addedNodes) {
                    if(nd instanceof HTMLLIElement && nd.classList.contains('galleryItem')) {
                        add_gallery_link(nd)
                    }
                }
            }
        }
    })
    observer.observe(document, {
      childList: true,
      subtree: true
    })
}

// Playlists - wait for relevant elements to load
if(document.querySelector('div#mediaContainer.playlist-content')) {
    const observer = new MutationObserver((mut, obs) => {
        const nd = document.querySelector('h3.entryTitle')
        if(nd) {
            add_playlist_link(nd)
            obs.disconnect()
        }
    })

    observer.observe(document, {
      childList: true,
      subtree: true
    })
}

// Continue to observe document for all <video> elements
const video_observer = new MutationObserver((mut, obs) => {
    document.querySelectorAll(`video:not(.${LINKED})`).forEach(nd => add_video_tag_link(nd))
})

video_observer.observe(document, {
    childList: true,
    subtree: true
})
