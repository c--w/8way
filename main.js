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
const VERSION = "v1.3";

function init() {
    $('#version').text(VERSION);
    let board_div = document.querySelector("#board_div");
    board_div.onclick = (event) => handleClick(event);

    initSeed();
    resolve('gamemode', true);
    resolve('level', true);
    resolve('size');
    console.log(size);
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
    window.onresize = function () {
        if (gamemode > 7)
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
    setup_dw();
    setCookie("level", level, 730);
    size = $("#size").val();
    setCookie("size", size, 730);
    [cols, rows] = size.split('*');
    [cols, rows] = [Number(cols), Number(rows)];
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
    $('#loading').css('display', 'flex');
    $('#board_div').empty();
    setTimeout(() => {
        fillBoard();
        fillWordList();
    })
    updateStats();
    start_time = Date.now();
}

function fillWordList() {
    $('#all_words_div').empty();
    all_guess_words_arr = Array.from(all_guess_words).sort();
    all_guess_words_arr.forEach(word => {
        let div = $('<div>');
        div.html(word)
        $('#all_words_div').append(div);
    });
}
var click_time = 0;
function handleClick(event) {
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
        if (!isStraight(el))
            return;
        $('.letter.selected').removeClass('selected').addClass('past-selected');
        el.addClass('selected');
        isWholeWordSelected(el);
        last_selected = el;
        undo_stack.push(el.data('l'));
        undo_stack_elem.push(el);
        let word = undo_stack.join('');
        if (undo_stack.length >= 4 && all_guess_words.has(word)) {
            setTimeout(() => {
                $('.selected,.past-selected').addClass('success');
            }, 0);
            all_guess_words.delete(word);
            let div = $('#all_words_div div').toArray().find(div => div.innerHTML == word);
            $(div).addClass('found');
            $('.selected,.past-selected').addClass('solved');
            setTimeout(() => {
                $('.selected,.past-selected').removeClass('success');
                $('.selected,.past-selected').removeClass('selected past-selected');
            }, 1000);
            if (all_guess_words.size == 0) {
                setTimeout(() => {
                    $('.solution').addClass('winner');
                }, 1000)
                games++;
                last_time = Math.round((Date.now() - start_time) / 1000);
                total_time += last_time;
                $('#solution').css('display', 'flex');
                setTimeout(() => {
                    $('#solution').hide();
                }, 4000)
                setTimeout(reset, 2000);
                setTimeout(initGame, 4000);
            } else {
                setTimeout(reset, 1000);
            }
        } else if (undo_stack.length == letters) {
            setTimeout(reset, 1000);
        }
    }
}

function isStraight(el) {
    let len = undo_stack.length;
    if (len < 2)
        return true;
    let dxp = undo_stack_elem[len - 1].data('x') - undo_stack_elem[len - 2].data('x');
    let dyp = undo_stack_elem[len - 1].data('y') - undo_stack_elem[len - 2].data('y');
    let dx = el.data('x') - undo_stack_elem[len - 1].data('x');
    let dy = el.data('y') - undo_stack_elem[len - 1].data('y');
    if (dxp != dx || dyp != dy)
        return false;
    return true;
}

function isWholeWordSelected(el) {
    let len = undo_stack.length;
    if (len < 1)
        return;
    let dx = el.data('x') - undo_stack_elem[len - 1].data('x');
    let dy = el.data('y') - undo_stack_elem[len - 1].data('y');
    if (!(Math.abs(dx) > 1 && dy == 0 || dx == 0 && Math.abs(dy) > 1 || Math.abs(dx) == Math.abs(dy)))
        return;
    dx = Math.sign(dx);
    dy = Math.sign(dy);
    let start_x = undo_stack_elem[len - 1].data('x') + dx;
    let start_y = undo_stack_elem[len - 1].data('y') + dy;
    let end_x = el.data('x');
    let end_y = el.data('y');
    var all_divs = $('.letter').toArray();
    while (start_x != end_x || start_y != end_y) {
        let ind = start_y * cols + start_x;
        let current = $(all_divs[ind]);
        current.addClass('past-selected');
        undo_stack.push(current.data('l'));
        undo_stack_elem.push(current);
        start_x += dx;
        start_y += dy;
    }
}
function reset() {
    undo_stack = [];
    undo_stack_elem = [];
    last_selected = null;
    $('.letter').removeClass('selected past-selected');
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
function setup_dw() {
    if (level == 1) dw = hrdict1;
    else if (level == 2) dw = hrdict2;
    else if (level == 3) dw = hrdict3;
    else if (level == 4) dw = endict;
}
function getRandomWord(length) {
    let filtered = dw.filter((word) => {
        word = cdl(word);
        if (length)
            return word.length == length;
        else
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

function resolve(prop, num) {
    let value = window[prop];
    if (typeof value == 'undefined') {
        value = getCookie(prop);
        if (!value) {
            value = $('#' + prop).val();
            window[prop] = value;
            return;
        }
    }
    let options = $('#' + prop + ' option');
    let values = $.map(options, function (option) {
        return option.value;
    });
    if (values.indexOf("" + value) == -1) {
        value = values[0];
    }
    if (num)
        value = Number(value);
    window[prop] = value;
    $('#' + prop).val(value);
    setCookie(prop, value, 730);
}