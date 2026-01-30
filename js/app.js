$(document).ready(function () {
    console.log("Aplikace naběhla! 🎨");
    initApp();
});

function initApp() {
    console.log("Inicializuji aplikaci...");
    setupEventListeners();
    loadFromLocalStorage();
}
function setupEventListeners() {
    $('#addtextbtn').click(function () {
        console.log("Klikl jsi na Add text!");
        addTextElement();
    });
    $('#savebtn').click(function () {
        console.log("Klikl jsi na Save!");
        saveToLocalStorage();
    });
    $('#clearbtn').click(function () {
        console.log("Klikl jsi na Clear page!");
        clearCanvas();
    });
    $('#searchbtn').click(function () {
        console.log("Klikl jsi na Search!");
        searchGiphy();
    });
    $('#searchinpt').keypress(function (e) {
        if (e.which === 13) { // 13 = Enter klávesa
            searchGiphy();
        }
    });
    $('#qotdbtn').click(function () {
        console.log("Klikl jsi na QOTD!");
        addQuote();
    });
}


function addTextElement() {
    var textElement = $('<div>')
        .addClass('canvas-element text-element')
        .attr('contenteditable', 'true')  // Dá se do toho psát
        .text('Klikni a piš...')
        .css({
            left: '100px',   // Pozice zleva
            top: '100px'     // Pozice shora
        });

    $('#canvas').append(textElement);
    makeDraggable(textElement[0]);
    console.log("Přidal jsem nový text element!");
}

function makeDraggable(element) {
    interact(element)
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: dragMoveListener
            }
        });
}

function dragMoveListener(event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

<!-- GIPHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY-->
function searchGiphy() {
    var query = $('#searchinpt').val(); 

    if (query === '') {
        alert('Napiš něco do vyhledávání!');
        return;
    }

    console.log("Hledám nálepky pro: " + query);

    var apiKey = 'p9YyjKfe2qOIOcCsodFX0RWFWtIPUXeJ'; 
    var apiUrl = 'https://api.giphy.com/v1/stickers/search';

    $.ajax({
        url: apiUrl,
        method: 'GET',
        data: {
            api_key: apiKey,
            q: query,
            limit: 20,
            rating: 'g',
            lang: 'cs' // Podpora češtiny při vyhledávání
        },
        success: function (response) {
            console.log("GIPHY data dorazila!");
            displayGiphyResults(response.data);
        },
        error: function (error) {
            console.error("Chyba při komunikaci s GIPHY:", error);
            alert('GIPHY API má asi špatný den. Zkus to znovu.');
        }
    });
}

// Zobrazíme výsledky z GIPHY
function displayGiphyResults(stickers) {
    var resultsDiv = $('#searchresults');
    resultsDiv.empty();  // Smažeme předchozí výsledky

    if (stickers.length === 0) {
        resultsDiv.html('<p>Nic jsem nenašel 😢</p>');
        return;
    }

    // Pro každý sticker vytvoříme obrázek
    stickers.forEach(function (sticker) {
        var img = $('<img>')
            .attr('src', sticker.images.fixed_height_small.url)
            .attr('alt', sticker.title)
            .click(function () {
                // Když klikneš na sticker, přidá se na canvas
                addStickerToCanvas(sticker.images.original.url);
            });

        resultsDiv.append(img);
    });

    console.log("Zobrazil jsem " + stickers.length + " stickerů");
}

// Přidání stickeru na canvas
function addStickerToCanvas(imageUrl) {
    var stickerElement = $('<div>')
        .addClass('canvas-element sticker-element')
        .html('<img src="' + imageUrl + '" alt="sticker">')
        .css({
            left: '200px',
            top: '200px'
        });

    $('#canvas').append(stickerElement);
    makeDraggable(stickerElement[0]);

    console.log("Přidal jsem sticker na canvas!");
}

// ===================================
// QUOTE OF THE DAY
// ===================================
function addQuote() {
    console.log("Načítám citát z API Ninjas...");

    var apiKey = 'J4o2qlvndMx94OgjJ7Yuap8YGShT5eUFeDbNksGA'; 
    var apiUrl = 'https://api.api-ninjas.com/v1/quotes';

    $.ajax({
        method: 'GET',
        url: apiUrl,
        headers: { 'X-Api-Key': apiKey },
        contentType: 'application/json',
        success: function(result) {
            var quoteData = result[0];
            var quoteText = '"' + quoteData.quote + '"\n— ' + quoteData.author;

            // ZEPTÁME SE UŽIVATELE:
            // confirm() zobrazí okno s tlačítky OK a Zrušit
            var userWantsIt = confirm("Líbí se ti tento citát? Potvrď tlačítkem *OK* a vloží se na tvou stránku \n\n" + quoteText);

            if (userWantsIt) {
                // Pokud klikne na OK, vytvoříme element
                var quoteElement = $('<div>')
                    .addClass('canvas-element text-element')
                    .text(quoteText)
                    .css({
                        left: '100px',
                        top: '150px',
                        fontStyle: 'italic',
                        fontSize: '22px',
                        padding: '15px',
                        maxWidth: '300px',
                        lineHeight: '1.4'
                    });

                $('#canvas').append(quoteElement);
                makeDraggable(quoteElement[0]);
                console.log("Citát přidán na plochu.");
            } else {
                console.log("Uživatel citát odmítl.");
            }
        },
        error: function(jqXHR) {
            console.error('Chyba API:', jqXHR.responseText);
            alert('Chyba při volání API Ninjas.');
        }
    });
}
    
// ===================================
// CLEAR CANVAS
// ===================================
function clearCanvas() {
    if (confirm('Opravdu chceš smazat všechno?')) {
        $('#canvas').empty();  // Smaže všechny elementy
        console.log("Canvas vyčištěn!");
    }
}

// ===================================
// LOCAL STORAGE - ukládání dat
// ===================================
function saveToLocalStorage() {
    console.log("Ukládám do localStorage...");

    // Pole pro uložení všech elementů
    var elementsData = [];

    // Projdeme všechny elementy na canvasu
    $('.canvas-element').each(function () {
        var element = $(this);

        // Zjistíme typ elementu
        var isText = element.hasClass('text-element');
        var isSticker = element.hasClass('sticker-element');

        // Získáme pozici
        var x = parseFloat(element.attr('data-x')) || 0;
        var y = parseFloat(element.attr('data-y')) || 0;

        // Vytvoříme objekt s daty
        var elementData = {
            type: isText ? 'text' : 'sticker',
            x: x,
            y: y,
            left: element.css('left'),
            top: element.css('top')
        };

        // Podle typu přidáme specifická data
        if (isText) {
            elementData.content = element.text();
            elementData.fontSize = element.css('font-size');
        } else if (isSticker) {
            elementData.imageUrl = element.find('img').attr('src');
        }

        elementsData.push(elementData);
    });

    // Převedeme pole objektů na JSON string
    var jsonString = JSON.stringify(elementsData);

    // Uložíme do localStorage
    localStorage.setItem('journalData', jsonString);

    console.log("Uloženo! Data:", elementsData);
    alert('Uloženo! ✓');
}

// Načtení dat z localStorage
function loadFromLocalStorage() {
    console.log("Načítám z localStorage...");

    // Získáme JSON string z localStorage
    var jsonString = localStorage.getItem('journalData');

    if (!jsonString) {
        console.log("Žádná uložená data");
        return;
    }

    // Převedeme JSON string zpět na pole objektů
    var elementsData = JSON.parse(jsonString);

    console.log("Načtená data:", elementsData);

    // Pro každý element vytvoříme znovu element na canvasu
    elementsData.forEach(function (data) {
        var element;

        if (data.type === 'text') {
            element = $('<div>')
                .addClass('canvas-element text-element')
                .attr('contenteditable', 'true')
                .text(data.content)
                .css({
                    left: data.left,
                    top: data.top,
                    fontSize: data.fontSize
                });
        } else if (data.type === 'sticker') {
            element = $('<div>')
                .addClass('canvas-element sticker-element')
                .html('<img src="' + data.imageUrl + '" alt="sticker">')
                .css({
                    left: data.left,
                    top: data.top
                });
        }

        // Nastavíme pozici z drag & drop
        element.attr('data-x', data.x);
        element.attr('data-y', data.y);
        element.css('transform', 'translate(' + data.x + 'px, ' + data.y + 'px)');

        $('#canvas').append(element);
        makeDraggable(element[0]);
    });

    console.log("Načteno " + elementsData.length + " elementů!");

}






