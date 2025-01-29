import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
    const [categories] = useState(["population", "geography"]); // Example categories
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    // Fetch questions when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            fetch(`http://localhost:8080/questions/${selectedCategory}`)
                .then((response) => response.json())
                .then((data) => setQuestions(data))
                .catch((error) => console.error("Error fetching questions:", error));
        }
    }, [selectedCategory]);

    // Start quiz
    const startQuiz = (category) => {
        setSelectedCategory(category);
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setQuizFinished(false);
        setSelectedAnswer(null);
    };

    // Handle answer selection
    const handleAnswerClick = (answer) => {
        setSelectedAnswer(answer);

        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setCorrectAnswers(correctAnswers + 1);
        }

        // Move to next question after a short delay
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                setQuizFinished(true);
            }
        }, 1000);
    };

    // Restart quiz
    const restartQuiz = () => {
        setSelectedCategory(null);
        setQuestions([]);
        setQuizFinished(false);
    };

    return (
        <div className="quiz-app">
            <header className="quiz-header">
                <h1>Town Quiz Game</h1>
            </header>

            <div className="container mt-5">
                {!selectedCategory ? (
                    // Start Page: Category Selection
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
                    // End Screen
                    <div className="card p-4 shadow">
                        <h2>Quiz Finished!</h2>
                        <p className="mt-3">You got {correctAnswers} out of {questions.length} correct.</p>
                        <button className="btn btn-primary mt-3" onClick={restartQuiz}>Play Again</button>
                    </div>
                ) : questions.length > 0 ? (
                    // Quiz Page
                    <div className="card p-4 shadow">
                        <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
                        <p>{questions[currentQuestionIndex].question}</p>
                        <div className="list-group mt-3">
                            {questions[currentQuestionIndex].answers.map((answer, index) => (
                                <button
                                    key={index}
                                    className={`list-group-item list-group-item-action ${
                                        selectedAnswer
                                            ? answer === questions[currentQuestionIndex].correctAnswer
                                                ? "list-group-item-success"
                                                : answer === selectedAnswer
                                                    ? "list-group-item-danger"
                                                    : ""
                                            : ""
                                    }`}
                                    onClick={() => handleAnswerClick(answer)}
                                    disabled={selectedAnswer !== null}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Loading State
                    <div className="card p-4 shadow">
                        <h2>Loading questions...</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
