const border_light_color = 'var(--border-light-color)';
const directions = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
]
const all_leters = cdl("ABCČĆDDŽĐEFGHIJKLLJMNNJOPRSŠTUVZŽ");
var grid;
function fillBoard() { //instantiator object for making gameboards
    all_guess_words = new Set()
    $('#board_div').empty();
    grid = new Array(rows); //create 2 dimensional array for letter grid
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            grid[i][j] = '';
        }
    }
    let word;
    let tries = 0;
    while (tries < 100) {
        let word;
        while (true) {
            word = getRandomWord();
            if (!all_guess_words.has(word.join('')))
                break;
        }
        tries = tries + placeWord(word);
    }
    calculateCSS();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            let l = grid[i][j];
            let div = $('<div>');
            if (l == '')
                l = all_leters[Math.floor(rand() * 30) + 1];
            div.html(l);
            div.addClass('letter');
            div.data('i', i * cols + j)
            div.data('l', l)
            $('#board_div').append(div);
        }
    }
    console.table(grid);
}

function placeWord(word, xf, yf) { // return 0 on success, 1 on failure to place word
    let best_score = -1;
    let best_coord = { x: 0, y: 0, dir: null };
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            let score, dir;
            let offset = Math.floor(rand() * 8);
            for (var k = 0; k < directions.length; k++) {
                score = 0;
                dir = directions[(k * 47 + offset) % 8];
                for (let i = 0; i < word.length; i++) {
                    let c = word[i];
                    let xx = x + i * dir.x;
                    let yy = y + i * dir.y;
                    if (xx < 0 || xx >= cols || yy < 0 || yy >= rows) {
                        score = -1;
                        break;
                    }
                    if (grid[yy][xx] == c) {
                        score++;
                    } else if (grid[yy][xx] != '') { // clash with another word
                        score = -1;
                        break;
                    }
                }
                if (score > best_score) {
                    best_score = score;
                    best_coord.x = x;
                    best_coord.y = y;
                    best_coord.dir = dir;

                }
            }
        }
    }

    if (!best_coord.dir)
        return 1;
    else {
        all_guess_words.add(word.join(''));
    }
    for (let i = 0; i < word.length; i++) {
        c = word[i];
        grid[best_coord.y + i * best_coord.dir.y][best_coord.x + i * best_coord.dir.x] = c;
    }
    return 0;
}

function calculateCSS() {
    let width = Math.floor(window.innerWidth / (Number(cols) + 1));
    if (width > 80)
        width = 80;
    $('#board_div').css("grid-template-columns", "repeat(" + cols + ", " + width + "px)");
    $('#board_div').css("grid-template-rows", "repeat(" + rows + ", " + width + "px)");
    $('#board_div').css("font-size", width / 2 + "px");
}