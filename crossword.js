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
var grid;
var letter_count;
function fillBoard() { //instantiator object for making gameboards
    all_guess_words = new Set();
    grid = new Array(rows); //create 2 dimensional array for letter grid
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            grid[i][j] = '';
        }
    }
    letter_count = rows * cols;
    let word;
    let tries = 0;
    while (tries < 1000) {
        let word;
        while (true) {
            if (letter_count < 20 || tries > 100) {
                word = getRandomWord(4);
            } else
                word = getRandomWord();
            if (!all_guess_words.has(word.join('')))
                break;
        }
        tries = tries + placeWord(word);
        if (letter_count < 8)
            break;
    }
    calculateCSS();
    let solution;
    if (letter_count > 3) {
        if (letter_count < 8) {
            solution = getRandomWord(letter_count);
            $('#solution').html(solution.join(''));
        } else {
            let num = Math.floor(letter_count / 2);
            let word1 = getRandomWord(num);
            let word2 = getRandomWord(letter_count - num);
            $('#solution').html(word1.join('') + ' ' + word2.join(''))
            word1.push(...word2);
            solution = word1;
        }
    } else {
        solution = cdl("Bravo!");
        $('#solution').html(solution.join(''));
    }
    $('#loading').hide();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            let l = grid[i][j];
            let div = $('<div>');
            if (l == '') {
                l = solution.splice(0, 1)[0];
                div.addClass("solution");
            }
            div.html(l);
            div.addClass('letter');
            div.data('i', i * cols + j);
            div.data('x', j);
            div.data('y', i);
            div.data('l', l);
            $('#board_div').append(div);
        }
    }
    if (window.location.hostname == 'localhost')
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
        let x = best_coord.x + i * best_coord.dir.x;
        let y = best_coord.y + i * best_coord.dir.y;
        if (!grid[y][x])
            letter_count--;
        grid[y][x] = c;
    }
    return 0;
}

function calculateCSS() {
    let width = Math.floor(window.innerWidth / (Number(cols) + 1));
    if (width > 80)
        width = 80;
    $('#board_div').css("grid-template-columns", "repeat(" + cols + ", " + width + "px)");
    $('#board_div').css("grid-template-rows", "repeat(" + rows + ", " + width + "px)");
    $('#board_div').css("font-size", width / 1.6 + "px");
}

