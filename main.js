onload = (event) => init();
var all_guess_words;
var all_guess_words_arr;
var undo_stack = [];
var undo_stack_elem = [];
var last_time = 0;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
var startseed;
var letters;
var gamemode;
var level;
var size;
var cols;
var rows;
var last_selected;
var css_transforms = new Array(7);
function init() {
    let board_div = document.querySelector("#board_div");
    board_div.onmousedown = (event) => handleClick(event);
    board_div.ontouchstart = (event) => handleClick(event);
    initSeed();
    if (!gamemode) {// try cookie
        gamemode = Number(getCookie("gamemode"));
        level = Number(getCookie("level"));
        size = getCookie("size") || "10*10";
    }
    if (isNaN(gamemode)) { // try select
        gamemode = $("#gamemode").val();
        level = $("#level").val();
        size = $("#size").val();
    }
    if (gamemode < 4)
        gamemode = 7;
    if (level < 1)
        level = 1;
    [cols, rows] = size.split('*');
    $("#gamemode").val(gamemode);
    $("#level").val(level);
    $("#size").val(size);
    setCookie("gamemode", gamemode, 730);
    setCookie("level", level, 730);
    setCookie("size", size, 730);
    $("#gamemode").on("change", changeGame);
    $("#level").on("change", changeGame);
    $("#size").on("change", changeGame);
    changeGame();
    window.onresize = function() {
        if(gamemode > 7)
            calculateCSS();
    }
}

function changeGame() {
    gamemode = Number($("#gamemode").val());
    if (gamemode > 7)
        letters = gamemode - 3;
    else
        letters = gamemode;
    setCookie("gamemode", gamemode, 730);
    level = $("#level").val();
    setCookie("level", level, 730);
    size = $("#size").val();
    setCookie("size", size, 730);
    [cols, rows] = size.split('*');
    last_time = 0;
    total_time = 0;
    games = 0;
    start_time = 0;
    setBckg();
    initGame();
}

function initGame() {
    startseed = seed;
    let seed_url;
    seed_url = gamemode + "-" + level + "-" + "-" + size + startseed;

    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    $("#seed").attr('title', startseed);
    fillBoard();
    fillWordList();
    updateStats();
    start_time = Date.now();
}

function fillWordList() {
    $('#all_words_div').empty();
    all_guess_words_arr = Array.from(all_guess_words).sort(randomsort);
    all_guess_words_arr.forEach(word => {
        let div = $('<div>');
        div.html(word)
        $('#all_words_div').append(div);
    });
}
var click_time = 0;
function handleClick(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (Date.now() - click_time < 100)
        return false;
    click_time = Date.now();
    let el = $(event.target);
    if (el.hasClass('letter')) {
        effect(el);
        if (el.hasClass('past-selected')) {
            return;
        }
        let current_index = $('.letter.selected').data('i');
        let new_index = el.data('i');
        if (new_index == current_index) {
            el.removeClass('selected');
            if (undo_stack_elem.length) {
                undo_stack.pop();
                undo_stack_elem.pop();
                last_selected = undo_stack_elem[undo_stack_elem.length - 1];
                if (last_selected)
                    last_selected.removeClass('past-selected').addClass('selected')
            }
            return;
        }
        $('.letter.selected').removeClass('selected').addClass('past-selected')
        el.addClass('selected');
        last_selected = el;
        undo_stack.push(el.data('l'));
        undo_stack_elem.push(el);
            let word = undo_stack.join('');
            if (undo_stack.length >= 4 && all_guess_words.has(word)) {
                setTimeout(() => {
                    $('.selected,.past-selected').addClass('success');
                }, 0);
                setTimeout(() => {
                    $('.selected,.past-selected').removeClass('success');
                }, 1000);
                all_guess_words.delete(word);
                let div = $('#all_words_div div').toArray().find(div => div.innerHTML == word);
                $(div).addClass('found');
                $('.selected,.past-selected').addClass('solved');
                if (all_guess_words.size == 0) {
                    setTimeout(() => {
                        $('#all_words_div > div').addClass('winner2');
                    }, 500)
                    games++;
                    last_time = Math.round((Date.now() - start_time) / 1000);
                    total_time += last_time;
                    setTimeout(initGame, 3000);
                } else {
                    setTimeout(reset, 1000);
                }
            } else if (undo_stack.length == letters) {
                setTimeout(reset, 1000);
            } else if (undo_stack.length >= 4 && all_guess_words_arr.find(w => w == word)) {
                setTimeout(() => {
                    $('.selected,.past-selected').addClass('success');
                }, 0);
                setTimeout(() => {
                    $('.selected,.past-selected').removeClass('success');
                }, 300);
            }
    }
}
function reset() {
    undo_stack = [];
    undo_stack_elem = [];
    last_selected = null;
    $('.letter').removeClass('selected').removeClass('past-selected')
}

function rand() {
    seed++;
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function initSeed() {
    if (window.location.hash) {
        let tmp = window.location.hash.substring(1).split("-");
        gamemode = Number(tmp[0])
        level = Number(tmp[1])
        size = tmp[2];
        [cols, rows] = size.split('*');
        seed = Number(tmp[3]);
        if (!isNaN(seed))
            return;
    }
    let now = new Date();
    seed = now.toISOString().replaceAll("-", "").replaceAll("T", "").replaceAll(":", "").substring(2, 12);
    seed = Number(seed + '0000');
}


var dw;
function getRandomWord() {
    if (level == 1) dw = hrdict1;
    else if (level == 2) dw = hrdict2;
    else if (level == 3) dw = hrdict3;
    else if (level == 4) dw = endict;
    let filtered = dw.filter((word) => {
        word = cdl(word);
        return word.length <= letters;
    });
    let i = Math.floor(rand() * filtered.length);
    let word = filtered[i];
    return cdl(word);
}

function setBckg() {
    var color = (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16);
    var url = "https://bg.siteorigin.com/api/image?2x=0&blend=40&color=%23" + color + "&intensity=10&invert=0&noise=0&pattern=" + g_patterns[Math.floor(Math.random() * g_patterns.length)];
    $('body').css('background-image', 'url(' + url + ')');
}

function effect(el) {
    el.addClass('effect');
    setTimeout((el) => el.removeClass('effect'), 100, el);
}

function updateStats() {
    $("#games").text(games);
    $("#last").text(last_time);
    $("#total").text(total_time);
    if (!games)
        return;
    let avg = Math.round(total_time / games);
    $("#avg").text(avg);
    let key = 'words' + games + '-' + gamemode + '-' + level;
    let best = localStorage.getItem(key);
    if (best) {
        best = Number(best);
        if (avg < best) {
            best = avg;
        }
    } else {
        best = avg;
    }
    localStorage.setItem(key, best);
    $("#best-games").text(games);
    $("#best").text(best);
}

function randomsort(a, b) {
    return Math.random() * 2 - 1;
}