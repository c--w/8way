# Osmosmjerka (Word Search Game)

## Description
Osmosmjerka is a classic word search game where players find hidden words within a grid of letters. Words can be placed horizontally, vertically, or diagonally, in any of the eight directions. The game offers various customization options to tailor the gameplay experience.

## How to Play
1.  **Open `index.html` in your web browser.**
2.  **Configure Game Options:**
    *   **Word Length/Gamemode:** Choose the maximum length of words to search for (e.g., "4 slova" for words with 4 letters, "do 7 slova" for words up to 7 letters).
    *   **Level:** Select the difficulty or language. Levels 1-3 use Croatian dictionaries (`hrdict1.js`, `hrdict2.js`, `hrdict3.js`), while "Eng. riječi" uses an English dictionary (`endict.js`).
    *   **Size:** Define the dimensions of the word search grid (e.g., 7x7, 10x10, 20x20).
3.  **Find Words:**
    *   Scan the grid for words matching the current settings.
    *   Click and drag (or click sequential letters) to select a word.
    *   Selected letters will be highlighted.
    *   If a correct word is found, it will be marked as solved in the word list and on the grid.
4.  **Game Completion:** The game is won when all words are found. Statistics like time taken will be displayed.

## Features
*   Multiple game modes based on word length.
*   Different levels, including Croatian and English word sets.
*   Selectable grid sizes for varying difficulty.
*   Tracks game statistics: number of games played, time for the last game, total time, average time, and best average time for the current configuration.
*   Shareable game sessions: A unique URL can be generated for each game configuration and seed, allowing players to challenge friends with the same puzzle.
*   Dynamic background patterns.
*   Responsive design for different screen sizes.

## Technologies Used
*   HTML
*   CSS
*   JavaScript
*   jQuery
*   Bootstrap

## File Structure
*   `index.html`: The main entry point of the game.
*   `main.js`: Contains the core game logic, including board generation, word finding, and UI interactions.
*   `crossword.js`: Likely handles the logic for placing words onto the grid and generating the puzzle.
*   `cookie.js`: Manages saving and retrieving user preferences (like game mode, level, size) using browser cookies.
*   `utils.js`: Contains utility functions used across the application.
*   `*.js` (e.g., `endict.js`, `hrdict1.js`, `hrdict2.js`, `hrdict3.js`): Dictionary files containing word lists for different languages/levels.
*   `main.css`: Custom styles for the game.
*   `bootstrap.min.css`, `bootstrap.min.js`: Bootstrap framework files for UI components and styling.
*   `fonts/`: Contains font files, likely for Bootstrap icons.
*   Images (`*.png`, `favicon.ico`): Various icons and assets for the web application.
*   `manifest.json`: Web app manifest for PWA capabilities.

## How to Run
1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, Safari, Edge).
3.  The game will load, and you can start playing.

## Customization

### Adding New Dictionaries

To add a new word dictionary (e.g., for a new language or a custom word list):

1.  **Create the Dictionary File:**
    *   Create a new JavaScript file in the root directory (e.g., `mydict.js`).
    *   Inside this file, define an array of words. The words should generally be in uppercase, following the convention of existing dictionaries.
        ```javascript
        // Example content for mydict.js
        const myCustomWords = [
          "EXAMPLE",
          "CUSTOM",
          "DICTIONARY"
        ];
        ```

2.  **Include the Dictionary in `index.html`:**
    *   Open `index.html`.
    *   Add a `<script>` tag to load your new dictionary file. This should be placed preferably before `main.js` and alongside other dictionary script tags:
        ```html
        <script src="hrdict3.js"></script> <!-- Existing dictionary -->
        <script src="mydict.js"></script>   <!-- Your new dictionary -->
        <script src="cookie.js"></script>
        ```

3.  **Add a Level Option in `index.html`:**
    *   Still in `index.html`, find the `<select id="level">` element.
    *   Add a new `<option>` for your dictionary. Choose a unique `value` for it.
        ```html
          <select id="level" class="form-select" name="level">
            <option value="1">Nivo 1</option>
            <option value="2">Nivo 2</option>
            <option value="3">Nivo 3</option>
            <option value="4">Eng. riječi</option>
            <option value="5">My Custom Dictionary</option> <!-- Your new option -->
          </select>
        ```

4.  **Modify `setup_dw()` in `main.js`:**
    *   Open `main.js`.
    *   Locate the `setup_dw()` function.
    *   Add an `else if` condition to handle the new level value you defined in `index.html`. This condition should assign your dictionary's word array to the global `dw` variable.
        ```javascript
        function setup_dw() {
            if (level == 1) dw = hrdict1;
            else if (level == 2) dw = hrdict2;
            else if (level == 3) dw = hrdict3;
            else if (level == 4) dw = endict;
            else if (level == 5) dw = myCustomWords; // Your new condition
        }
        ```
    *   Ensure the `level` variable in `main.js` is correctly capturing the value from the dropdown. The existing `resolve('level', true);` and `level = $("#level").val();` should handle this.

After these changes, when you select "My Custom Dictionary" (or whatever you named your new level) from the dropdown, the game should use the words from `mydict.js`.

### Changing Themes/Styles
*   Modify `main.css` to change colors, fonts, and layout.
*   The game uses dynamic background patterns from `bg.siteorigin.com`. You can change the `g_patterns` array in `crossword.js` (if that's where it's defined, or `main.js`) or the logic in `setBckg()` in `main.js` to use different patterns or a static background.
