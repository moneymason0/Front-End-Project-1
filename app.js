let difficulty;
let category;

var downloadTimer;

let score = 0;

let $readyButton = $("#ready"); // Grab the Ready Button from the HTML 
$readyButton.click(getQuestion); // Add a click event listener to the button 

function getQuestion(){
     // If category or difficulty have not been selected prompt user and return out of function
        if (difficulty === undefined || category === undefined){
            alert("Please choose a cateogry and difficulty");
            return;
        }

    clearInterval(downloadTimer);
    $(".questionContainer").empty();
    $(".answersContainer").empty();
    $(".score").empty();

    let $questionContainer = $(".questionContainer");

    let $lifeLineButton = $("<button></button>").attr("id", "lifeLineButton");
    $lifeLineButton.text("Life-Line").attr("title", "This Life-Line will eliminate to wrong answers.");
    $lifeLineButton.click(lifeLineClicked);
    $questionContainer.prepend($lifeLineButton);

    $.get(`https://the-trivia-api.com/api/questions?categories=${category}&limit=1&region=US&difficulty=${difficulty}`, (question) => {
        console.log(question);
        let $score  = $("<h2></h2>");
        $score.text(`Score: ${score}`);
        $(".score").append($score);

        let $questionHeading = $("<h2></h2>");
        $questionHeading.text(question[0].question);
        $questionContainer.append($questionHeading);

        let $answersContainer = $(".answersContainer");

        let $rightAnswer = $("<button></button>").attr("id", "rightAnswer"); // Create an answer button and set id
        $rightAnswer.text(question[0].correctAnswer); // Get correct Answer from Trivia API
        $rightAnswer.attr("onclick", "checkAnswer(this)");
        console.log(question[0].correctAnswer);
        $answersContainer.append($rightAnswer); // Append to Answer Container

        for (var i = 0; i < question[0].incorrectAnswers.length; i++){
            let $notrightAnswer = $("<button></button>").attr("id", "notrightAnswer"); // Create an incorrect answer button and set id
            $notrightAnswer.attr("onclick", "checkAnswer(this)");
            $notrightAnswer.text(question[0].incorrectAnswers[i]);

        // Cycle through answers and randomly append/prepend to Answer Container based on in a random number is even or odd
            let random = Math.floor(Math.random() * 100); // Random number between 0 and 99
            random % 2 === 0 ? $answersContainer.append($notrightAnswer) : $answersContainer.prepend($notrightAnswer);
        }
        startCountdown();
    });
}

function lifeLineClicked(){
    let randomChild = Math.floor(Math.random() * 4); // Random number between 0 and 3
    
    console.log($(`.answersContainer button:nth-child(${randomChild})`).id);

}


function startCountdown(){
    var reverse_counter = 0;
    let maxTime = 10;
    let $questionContainer = $(".questionContainer");

    let $progressBar = $("<progress></progress>").attr("id", "pbar");
    $progressBar.attr("value", "10").attr("max", maxTime);
    $questionContainer.prepend($progressBar);

    downloadTimer = setInterval(function(){
         $("#pbar").val(maxTime - reverse_counter);
        if(reverse_counter >= maxTime)
            {
                clearInterval(downloadTimer);
                endScreen(); 
            }
        reverse_counter++;
    },1000);
}


function difficultyDropDownShow() {
  document.getElementById("difficultyDropDown").classList.toggle("show");
}

function difficultyDropDownStore(selection) {
    $("#difficulty").text(selection.id.toUpperCase());

    difficulty = selection.id;
  }

  function categoryDropDownShow() {
    $.get(`https://the-trivia-api.com/api/categories`, (categories) => {

    for(var keys in categories){
        let $a = $("<a></a>").attr("id", categories[keys][0]).attr("onclick", 'categoryDropDownStore(this)');
        $a.text(categories[keys][0].toUpperCase());

        $("#categoryDropDown").append($a);
    }
    });
    document.getElementById("categoryDropDown").classList.toggle("show");
  }

  function categoryDropDownStore(selection){
    $("#category").text(selection.id.toUpperCase());

    category = selection.id;
}

function checkAnswer(selectedAnswer){
    if(selectedAnswer.id === "rightAnswer"){
        getQuestion();
        score++;
    }
    else    
        endScreen(score);
}

function endScreen()
{
    $(".questionContainer").empty();
    $(".answersContainer").empty();
    
    let $gameOver = $("<h2></h2>").text("Game Over");
    $(".gameOverScreen").append($gameOver);

    let $playAgainButton = $("<button></button>").attr("id", "playAgainButton");
    $playAgainButton.attr("onclick", "reset()").text("Play Again?");
    $(".gameOverScreen").append($playAgainButton);
}

function reset()
{
    score = 0;
    
    $(".questionContainer").empty();
    $(".answersContainer").empty();
    $(".score").empty();
    $(".gameOverScreen").empty();
    $("#playAgainButton").empty();

    getQuestion();
}
