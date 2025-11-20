"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function QuizPage() {
  const params = useParams();
  const quizName = params.quizName;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [clickedAnswerIndex, setClickedAnswerIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load quiz data and shuffle questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch(`/data/quiz/${quizName}.json`);
        if (!response.ok) {
          throw new Error("Quiz not found");
        }
        const data = await response.json();

        // Shuffle questions on load
        const shuffledQuestions = [...data];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQuestions[i], shuffledQuestions[j]] = [
            shuffledQuestions[j],
            shuffledQuestions[i],
          ];
        }

        setQuestions(shuffledQuestions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (quizName) {
      loadQuiz();
    }
  }, [quizName]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const answers = [...currentQuestion.answers];

      // Shuffle the answers
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }

      // Find where the correct answer (first one) ended up
      const correctIndex = answers.indexOf(currentQuestion.answers[0]);

      setShuffledAnswers(answers);
      setCorrectAnswerIndex(correctIndex);
      setTimeLeft(15);
      setShowCorrectAnswer(false);
      setClickedAnswerIndex(null);
    }
  }, [currentQuestionIndex, questions]);

  // Handle answer click
  const handleAnswerClick = (index) => {
    if (showCorrectAnswer || clickedAnswerIndex !== null) return;

    setClickedAnswerIndex(index);

    // Show correct answer immediately and start 5 second countdown
    setShowCorrectAnswer(true);
    setTimeLeft(5);
  };

  // Timer logic
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          if (!showCorrectAnswer) {
            // Time's up for question, show correct answer
            setShowCorrectAnswer(true);
            return 5; // 5 seconds to show correct answer
          } else {
            // Time's up for showing correct answer, move to next question
            setCurrentQuestionIndex(
              (prevIndex) => (prevIndex + 1) % questions.length
            );
            return 15; // Reset to 15 seconds for next question
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions.length, showCorrectAnswer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Duke ngarkuar kuizin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-red-600">Gabim: {error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">
          Nuk u gjetën pyetje në kuiz.
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with timer */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-300 capitalize">
            {/* Kuiz: {quizName} */}
            Kuiz
          </h1>
          <div>
            {!showCorrectAnswer && (
              <span
                className={`text-4xl font-bold ${
                  timeLeft <= 5 ? "text-red-500" : "text-green-500"
                }`}
              >
                {timeLeft}
              </span>
            )}
            {showCorrectAnswer && (
              <span className="text-4xl font-bold text-blue-500">
                {timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center leading-relaxed py-12">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer buttons */}
        <div className="space-y-4">
          {shuffledAnswers.map((answer, index) => {
            let buttonClass =
              "bg-white text-gray-800 hover:bg-blue-50 shadow-md hover:shadow-lg";

            if (showCorrectAnswer) {
              // Show correct answer in green
              if (index === correctAnswerIndex) {
                buttonClass = "bg-green-500 text-white shadow-lg scale-105";
              } else {
                buttonClass = "bg-gray-300 text-gray-600";
              }
            } else if (clickedAnswerIndex !== null) {
              // User clicked an answer
              if (
                index === clickedAnswerIndex &&
                index !== correctAnswerIndex
              ) {
                // Clicked wrong answer - show red
                buttonClass = "bg-red-500 text-white shadow-lg";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                className={`
                  w-full py-6 px-8 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-105
                  ${buttonClass}
                `}
                disabled={showCorrectAnswer}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Question counter */}
        <div className="mt-8 text-center">
          <span className="text-lg text-gray-600">
            Pyetja {currentQuestionIndex + 1} nga {questions.length}
          </span>
        </div>
      </div>
    </div>
  );
}
