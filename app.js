// -------------------------------------------------------------------------------
// POOR MAN'S TRIVIA (API: https://the-trivia-api.com/docs/)
// -------------------------------------------------------------------------------

let $body = $("body"); // Retrieve the body element from HTML

let difficulty = ""; // Declare a difficulty variable which will hold the difficulty choosen by the player
let categoryArray = []; // Declare a category array which will hold all the categories choosen by the player
let category = ""; // Declare a category string which will be used to hold the element from the Category Array in a single string for the API query
 
let questionTimer; // Will be the timer for each question (using setInterval method)
let questionArray = []; // Store the question IDs for all retrieved questions to ensure no duplicate questions in the same game

let score = 0;  // Keep track of the player's score, +1 for every question that is right
let lifeLineCounter = 0; // Keep track of the number of Life-Lines that has been used thus far

let $themeMusic = document.getElementById("themeAudio"); // Retrieve the audio element from HTML that is holding the theme music path
$themeMusic.loop = true; // Makes sure the music loops when done
let $thinkingMusic = document.getElementById("thinkingAudio"); // Retrieve the audio element from HTML that is holding the thiking music path
$thinkingMusic.loop = true; // Makes sure the music loops when done
let $gameOverMusic = document.getElementById("gameOverAudio"); // Retrieve the audio element from HTML that is holding the game over music path
let $correctSound = document.getElementById("correctSound"); // Retrieve the audio element from HTML that is holding the correct ding music path
let $startSound = document.getElementById("gameStart"); // Retrieve the audio element from HTML that is holding the correct ding music path
let $retroClick = document.getElementById("retroClick"); // Retrieve the audio element from HTML that is holding the correct ding music path


// Create an audio Icon that the player can click to start the Theme Music
let $audioOnIcon = $("<img></img>").attr("id", "audioOn").attr("onclick", "playMusic(this)").attr("width", "70");
$audioOnIcon.attr("src", "C:/Users/Tony Stark/Desktop/Microsoft VS Code/coding-practice/Front-End-Project-1/Un_muted_Audio_Icon.png");
$body.prepend($audioOnIcon);

// Create an audio Icon that the player can click to pause the Theme Music
let $audioOffIcon = $("<img></img>").attr("id", "audioOff").attr("onclick", "playMusic(this)").attr("width", "70");
$audioOffIcon.attr("src", "C:/Users/Tony Stark/Desktop/Microsoft VS Code/coding-practice/Front-End-Project-1/Muted_Audio_Icon.png");
$body.prepend($audioOffIcon);
$audioOffIcon.hide(); // this will effectively hide the image (just like CSS, display: "none")

let $readyButton = $("#ready"); // Grab the Ready Button from the HTML 
$readyButton.click(getQuestion); // Add a click event listener to the button 

$(".contentContainer").hide(); // Hide Content Container until game is started
$(".gameOverScreen").hide();
$(".input").hide();
$("titleContainer").show();

function showInput(){
    $startSound.currentTime = .2;
    $startSound.play();

    score = 0;  // Reset Score for Next Game
    lifeLineCounter = 0; //Reset Life Line Counter for Next Game
    questionArray = []; // Reset the question Array for Next Game

    $(".titleContainer").hide();
    $("footer").hide();
    $(".gameOverScreen").hide();

    $(".input").show();
    $readyButton.show();
}

// Once either audio icon is clicked play/pause the music depending on which one was choosen
function playMusic(icon){
    if (icon.id === "audioOn"){
        $themeMusic.currentTime = .7;
        $themeMusic.play(); // Play Theme Music
        $audioOnIcon.hide(); // Now hide the 'Audio On' Icon
        $audioOffIcon.show(); // Now show the 'Audio Off' Icon
    }
    else {    
        $themeMusic.pause();
        $themeMusic.currentTime = .7;

        $audioOffIcon.hide();
        $audioOnIcon.show();
    }
}

// Retrieve a question from the API and display the possible answer choices
function getQuestion(){
        category = categoryArray.toString(); // Get all elements from Category Array and turn it into a String for API query
        // If category or difficulty have not been selected prompt user and return out of function
        if (difficulty === "" || category === ""){
            alert("Please choose a cateogry and difficulty");
            return;
        }

        $(".input").hide();   // Hide Input Container From Screen
        $(".gameOverScreen").hide(); // Hide Game Over Screen
        $(".contentContainer").show(); // Show Content Container

        $readyButton.hide(); // Hide the ready Button, Dont need it once first game is started since there is a "Play Again" Button

        $themeMusic.pause();    // Pause Theme Music   
        $themeMusic.currentTime = 0; // Set time to 0 allows the next time the Theme Music plays it will be at the begin

        $gameOverMusic.pause();
        $gameOverMusic.currentTime = 0; // Set time to 0 allows the next time the Game Over Music plays it will be at the begin

        $audioOffIcon.hide();
        $audioOnIcon.show();

        $thinkingMusic.play(); // Play Thinking Music

    // Clear questionnaire to ensure nothing from previous questions bleeds over
    clearInterval(questionTimer);
    $(".lifeLineContainer").empty();
    $(".questionContainer").empty();
    $(".answersContainer").empty();
    $(".timerContainer").empty();
    $(".score").empty();
    $(".gameOverScreen").empty();
    $("#playAgainButton").empty();
    
    let $score  = $("<h2></h2>"); // Create a score label for HTML
    $score.text(`Score: ${score}`); // Set value of label to current value of score variable
    $(".score").append($score);

    let $questionContainer = $(".questionContainer"); // Retrieve question container from HTML

    // If the player has Life-Lines left, then recreate the button for this question
    if (lifeLineCounter !== 3) {
        let $lifeLineButton = $("<button></button>").attr("id", "lifeLineButton");
        $lifeLineButton.text(`${3-lifeLineCounter} Life-Lines left`).attr("title", "This Life-Line will eliminate to wrong answers.");
        $lifeLineButton.click(lifeLineClicked);
        $(".lifeLineContainer").prepend($lifeLineButton);
    }
    else // Player has used up all Life-Lines available for that game, get rid of Life-Line button
    {
        let $outOfLifeLine = $("<h3></h3>");
        $outOfLifeLine.text("Out of Life-Lines");
        $outOfLifeLine.attr("id", "outOfLifeLineText");
        $(".lifeLineContainer").prepend($outOfLifeLine);
    }

    // Retrieve question from API using difficulty selected by the user and the categories of questions
    $.get(`https://the-trivia-api.com/api/questions?categories=${category}&limit=1&region=US&difficulty=${difficulty}`, (question) => {
        
        // Check to make sure that the question is not a duplicate
        if (questionArray.indexOf(question[0].id) !== -1){
            getQuestion(); // Get a new question
            return;  // Execute out of current cycle to avoid continuing with the duplicate question
        }

        questionArray.push(question[0].id); // Push the new question id to the question array to compare with future questions

        let $questionHeading = $("<h2></h2>"); // Create a question heading for HTML
        $questionHeading.text(question[0].question); // Retrieve question text from API
        $questionContainer.append($questionHeading);

        let $answersContainer = $(".answersContainer");

        let $rightAnswer = $("<button></button>").attr("id", "rightAnswer"); // Create an answer button and set id
        $rightAnswer.text(question[0].correctAnswer); // Get correct Answer from Trivia API
        $rightAnswer.attr("onclick", "checkAnswer(this)");
        console.log(question[0].correctAnswer);
        $answersContainer.append($rightAnswer); // Append to Answer Container

        for (var i = 0; i < question[0].incorrectAnswers.length; i++){
            let $notrightAnswer = $("<button></button>").attr("id", "notrightAnswer"); // Create an incorrect answer button and set id
            $notrightAnswer.attr("onclick", "checkAnswer(this)"); // Create an onclick attribute that will execute checkAnswer function
            $notrightAnswer.text(question[0].incorrectAnswers[i]); // Retrieve incorrect Answer Text from API

        // Cycle through answers and randomly append/prepend to Answer Container based on in a random number is even or odd
            let random = Math.floor(Math.random() * 100); // Random number between 0 and 99
            random % 2 === 0 ? $answersContainer.append($notrightAnswer) : $answersContainer.prepend($notrightAnswer);
        }

        startCountdown(); // Initiate countdown timer
    });
}

// Execute Life-Line function by removing two wrong answer choices
function lifeLineClicked(){
    lifeLineCounter++; // Keep track of how many Life-Lines have been used
    let answersRemoved = 0; // Keep track of how many answers have been removed in this Life-Line

    // Keep removing answers until 2 answers have been removed
    while(answersRemoved !== 2)  {  
        let randomChild = Math.floor(Math.random() * 4) + 1; // Random number between 1 and 4
        let $randomAnswer = $(`.answersContainer button:nth-child(${randomChild})`); // Pick random element under answer container (which holds all the answer choices)
            if ($randomAnswer.attr('id') === 'notrightAnswer' ) {  // Make sure current answer that is picked is a wrong answer       
                $randomAnswer.remove(); // Remove wrong answer
                answersRemoved++; // Increment to show that one more answer has been removed
            }
    }
    $("#lifeLineButton").remove(); // Remove Life Line button from this question
}

// Start the countdown Timer Bar on each question
function startCountdown(){
    var reverse_counter = 0; // Set counter to 0
    let maxTime = 1000; // Set max Time for each countdown (in seconds*10)

    let $progressBar = $("<progress></progress>").attr("id", "pbar"); // Create a progress bar icon for HTML
    $progressBar.attr("value", maxTime).attr("max", maxTime); // Set value and max equal to maxTime for bar
    $progressBar.css("width", "70%");
    $(".timerContainer").prepend($progressBar); 

    questionTimer = setInterval(function(){ // Set Interval function which will slowly decrease the value of the progress bar
         $("#pbar").val(maxTime - reverse_counter);
        if(reverse_counter >= maxTime) // If progress bar is out of time
            {
                clearInterval(questionTimer);   // Clear timer 
                endScreen();  // Player loses, go to end screen
            }
        reverse_counter++; // Increase counter to take away 1 more second from timer
    }, 10);
}

// Show the Drop Down Menu for Difficulty
function difficultyDropDownShow() {
  document.getElementById("difficultyDropDown").classList.toggle("show");  

  $retroClick.currentTime = .1; // Play Retro Sound Effect but skip the small gap of silence in mp3
  $retroClick.play();
}

// Store the players selection of difficulty
function difficultyDropDownStore(selection) {

    $retroClick.currentTime = .1; // Play Retro Sound Effect but skip the small gap of silence in mp3
    $retroClick.play();

    $("#difficulty").text(selection.id.toUpperCase()); // Change text in Drop Down to reflect players Choice
    document.getElementById("difficultyDropDown").classList.toggle("show");  

    difficulty = selection.id; // Store in variable to use in API retrieval later
  }
// Show the category drop down menu for player to select a category
  function categoryDropDownShow() {
    $retroClick.currentTime = .1; // Play Retro Sound Effect but skip the small gap of silence in mp3
    $retroClick.play();

    if (document.getElementById("categoryDropDown".innerHTML !== ""))    {
        document.getElementById("categoryDropDown").classList.toggle("show"); // Toggle the Drop Down list on and off every time you click it      
        return;
    }
    // Get possible categories from Trivia API
    $.get(`https://the-trivia-api.com/api/categories`, (categories) => {
    // This will result in a JSON that every category stored in its keys, each key is an array that has every possible acceptable string input for that category
    
    // Go through each key in the object that holds the categories retrieved from the API
    for(var keys in categories){
        let $a = $("<a></a>").attr("id", categories[keys][0]).attr("onclick", 'categoryDropDownStore(this)'); // Store string of each category in an HTML anchor element
        $a.text(categories[keys][0].toUpperCase()); 

        $("#categoryDropDown").append($a); // Append anchor to Category Drop Down List
    }
    });

    document.getElementById("categoryDropDown").classList.toggle("show"); // Toggle the Drop Down list on and off every time you click it
  }

  // Store player selection for categories
  function categoryDropDownStore(selection){
    $retroClick.currentTime = .1; // Play Retro Sound Effect but skip the small gap of silence in mp3
    $retroClick.play();

    if (categoryArray.indexOf(selection.id) === -1) // If category not currently in Array
            categoryArray.push(selection.id); // Append category array with the latest category that was clicked
    else {
        let index = categoryArray.indexOf(selection.id);
        categoryArray.splice(index, 1);
    }
    document.getElementById(selection.id).classList.toggle("selected");
}

// Answer submitted from player, check if it is right or wrong
function checkAnswer(selectedAnswer){
    if(selectedAnswer.id === "rightAnswer"){ // Answer is correct
        score++; // Add +1 to score
        $correctSound.currentTime = .7;
        $correctSound.play(); // Play the correct sound effect ding
        getQuestion(); // Go back to retrieve another question
    }
    else     // Answer is wrong
        endScreen(); // Game over go to the End Screen
}

function endScreen()
{
    $(".input").hide(); // Hide Input Screen Container
    $(".contentContainer").hide(); // Hide Content Container (container for the question and answers)
    $(".gameOverScreen").show (); // Show Game Over Screen Container

    // If the player answers a question wrong the timer will still be counting
    clearInterval(questionTimer); // Clear timer so that it doesnt enter endScreen() twice

    // Pause all music except for Game Over Sound
    $themeMusic.pause(); // Pause Theme Music (if playing)
    $thinkingMusic.pause(); // Play Thinking Music
    $themeMusic.currentTime = 0; // Set to Zero so it starts again when played again
    $thinkingMusic.currentTime = 0; // Set to Zero so it starts again when played again

    $gameOverMusic.play();

    $(".timerContainer").empty();
    $(".lifeLineContainer").empty(); // Remove Question from screen
    $(".questionContainer").empty(); // Remove Life-Container from screen
    $(".answersContainer").empty(); // Remove answers from screen
    $(".score").empty(); // Remove answers from screen

    
    let $gameOver = $("<h2></h2>").text("Game Over"); // Create a header that will say "Game Over" for HTML
    $gameOver.attr("id", "gameOverText");
    $(".gameOverScreen").append($gameOver);

    let $score  = $("<h3></h3>"); // Create a score label for HTML
    $score.text(`Score: ${score}`).attr("id", "score"); // Set value of label to current value of score variable
    $(".gameOverScreen").append($score);

    let $playAgainButton = $("<button></button>").attr("id", "playAgainButton"); // Create a playAgain Button to start another round
    $playAgainButton.attr("onclick", "reset()").text("Play Again?"); // Play Again Button will initiate reset once clicked
    $(".gameOverScreen").append($playAgainButton);

    let $changeInputs = $("<button></button>").attr("id", "changeInput"); // Create a playAgain Button to start another round
    $changeInputs.attr("onclick", "showInput()").text("Change Difficulty/Category"); // Play Again Button will initiate reset once clicked
    $(".gameOverScreen").append($changeInputs);
}

// Reset will reset all values/container to ensure no bleed-over from one game to another
function reset()
{       
    $retroClick.currentTime = .1; // Play Retro Sound Effect but skip the small gap of silence in mp3
    $retroClick.play();

    score = 0;  // Reset Score for Next Game
    lifeLineCounter = 0; //Reset Life Line Counter for Next Game
    questionArray = []; // Reset the question Array for Next Game
    
    // Empty every container with content already in it to avoid bleed over to the next game
    $(".lifeLineContainer").empty();
    $(".questionContainer").empty();
    $(".answersContainer").empty();
    $(".timerContainer").empty();
    $(".score").empty();
    $(".gameOverScreen").empty();
    $("#playAgainButton").empty();

    getQuestion(); // Start a new game, go and retrieve a question
}