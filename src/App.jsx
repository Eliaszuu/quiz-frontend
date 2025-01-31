import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
    const [categories] = useState(["population", "geography"]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [name, setName] = useState("");
    const [nameEntered, setNameEntered] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timer, setTimer] = useState(null);
    const [ranking, setRanking] = useState([]); // To store ranking data

    useEffect(() => {
        if (selectedCategory) {
            fetch(`http://localhost:8080/questions/${selectedCategory}`, {
                headers: { "Accept": "application/json" }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => setQuestions(data))
                .catch((error) => console.error("Error fetching questions:", error));
        }
    }, [selectedCategory]);

    const startQuiz = (category) => {
        if (!name.trim()) {
            alert("Please enter your name to start the quiz!");
            return;
        }

        setSelectedCategory(category);
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setQuizFinished(false);
        setSelectedAnswer(null);
        setStartTime(new Date());
        setElapsedTime(0);
        setTimer(setInterval(updateTimer, 1000));
    };

    const updateTimer = () => {
        setElapsedTime(prevTime => prevTime + 1);
    };

    const handleAnswerClick = (answer) => {
        setSelectedAnswer(answer);

        if (
            answer.name === questions[currentQuestionIndex].correctAnswer.name &&
            answer.country === questions[currentQuestionIndex].correctAnswer.country &&
            answer.population === questions[currentQuestionIndex].correctAnswer.population
        ) {
            setCorrectAnswers(correctAnswers + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                setQuizFinished(true);
                clearInterval(timer);
                sendStatistics();
            }
        }, 1000);
    };

    const sendStatistics = () => {
        const statistics = {
            name: name,
            points: correctAnswers, // Assuming max points is 100
            timeInSeconds: elapsedTime+1
        };

        // Send statistics to the backend
        fetch("http://localhost:8080/questions/statistics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(statistics)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setRanking(data.slice(0, 3)); // Get the top 3 scores
            })
            .catch((error) => console.error("Error fetching ranking:", error));
    };

    const restartQuiz = () => {
        setSelectedCategory(null);
        setQuestions([]);
        setQuizFinished(false);
        setName("");
        setNameEntered(false);
        setElapsedTime(0);
        clearInterval(timer);
        setRanking([]); // Clear the ranking on restart
    };

    return (
        <div className="quiz-app">
            <header className="quiz-header">
                <h1>Town Quiz Game</h1>
            </header>

            <div className="container mt-5">
                {!nameEntered ? (
                    <div className="card p-4 shadow">
                        <h2>Enter Your Name</h2>
                        <input
                            type="text"
                            className="form-control mt-3"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => {
                                if (name.trim()) {
                                    setNameEntered(true);
                                } else {
                                    alert("Please enter a valid name");
                                }
                            }}
                            disabled={!name.trim()}
                        >
                            Start Quiz
                        </button>
                    </div>
                ) : !selectedCategory ? (
                    <div className="card p-4 shadow">
                        <h2>Select a Category</h2>
                        <div className="list-group mt-3">
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => startQuiz(category)}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : quizFinished ? (
                    <div className="card p-4 shadow">
                        <h2>Quiz Finished!</h2>
                        <p className="mt-3">You got {correctAnswers} out of {questions.length} correct.</p>
                        <p className="mt-3">You spent {elapsedTime} seconds on the quiz.</p>

                        {/* Ranking Table Block */}
                        <div className="card mt-4 p-3">
                            <h3>Top 3 Scores</h3>
                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Points</th>
                                    <th>Time (seconds)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {ranking.length > 0 ? (
                                    ranking.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{entry.name}</td>
                                            <td>{entry.points}</td>
                                            <td>{entry.timeInSeconds}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            No ranking available yet.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <button className="btn btn-primary mt-3" onClick={restartQuiz}>Play Again</button>
                    </div>
                ) : questions.length > 0 ? (
                    <div className="card p-4 shadow">
                        <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
                        <p>{questions[currentQuestionIndex].question}</p>
                        <p><strong>Time: {elapsedTime} seconds</strong></p>
                        <div className="list-group mt-3">
                            {questions[currentQuestionIndex].answers.map((answer, index) => (
                                <button
                                    key={index}
                                    className={`list-group-item list-group-item-action ${
                                        selectedAnswer
                                            ? answer.name === questions[currentQuestionIndex].correctAnswer.name &&
                                            answer.country === questions[currentQuestionIndex].correctAnswer.country &&
                                            answer.population === questions[currentQuestionIndex].correctAnswer.population
                                                ? "list-group-item-success"
                                                : answer === selectedAnswer
                                                    ? "list-group-item-danger"
                                                    : ""
                                            : ""
                                    }`}
                                    onClick={() => handleAnswerClick(answer)}
                                    disabled={selectedAnswer !== null}
                                >
                                    {answer.name} ({answer.country}) - Population: {answer.population}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card p-4 shadow">
                        <h2>Loading questions...</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
