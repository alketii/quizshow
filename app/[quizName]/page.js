"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MousePointerClick, Presentation, ArrowRight } from "lucide-react";

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
  const [mode, setMode] = useState("interactive"); // 'interactive' or 'show'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const answerTimeoutRef = useRef(null);

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

  // Clear timeout when question changes
  useEffect(() => {
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }
  }, [currentQuestionIndex]);

  // Handle answer click
  const handleAnswerClick = (index) => {
    if (showCorrectAnswer || clickedAnswerIndex !== null) return;

    setClickedAnswerIndex(index);

    // In Interactive mode, delay showing correct answer if wrong
    if (index !== correctAnswerIndex) {
      // Show wrong answer in red for 1 second
      answerTimeoutRef.current = setTimeout(() => {
        setShowCorrectAnswer(true);
      }, 1000);
    } else {
      // Show correct answer immediately if right
      setShowCorrectAnswer(true);
    }
  };

  // Handle next button
  const handleNext = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  // Toggle mode
  const toggleMode = () => {
    setMode(mode === "interactive" ? "show" : "interactive");
  };

  // Timer logic
  useEffect(() => {
    if (questions.length === 0 || mode === "interactive") return;

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
  }, [questions.length, showCorrectAnswer, mode]);

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
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-300 capitalize hover:text-gray-500 cursor-pointer transition-colors">
              Kuiz
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {mode === "show" && (
              <div className="w-12 text-right">
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
            )}
            <button
              onClick={toggleMode}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            >
              {mode === "interactive" ? (
                <Presentation size={24} />
              ) : (
                <MousePointerClick size={24} />
              )}
            </button>
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
              // Show correct answer in green, keep wrong answer in red
              if (index === correctAnswerIndex) {
                buttonClass = "bg-green-500 text-white shadow-lg scale-105";
              } else if (
                index === clickedAnswerIndex &&
                clickedAnswerIndex !== correctAnswerIndex
              ) {
                // Keep wrong clicked answer red
                buttonClass = "bg-red-500 text-white shadow-lg";
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
                onClick={() =>
                  mode === "interactive" && handleAnswerClick(index)
                }
                className={`
                  w-full py-6 px-8 rounded-xl text-xl font-semibold transition-all duration-300 ${
                    mode === "interactive" && !showCorrectAnswer
                      ? "transform hover:scale-105"
                      : ""
                  }
                  ${buttonClass}
                `}
                disabled={showCorrectAnswer || mode === "show"}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Next button - shown when correct answer is revealed */}
        {showCorrectAnswer && (
          <div className="mt-8 text-center">
            <button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition-colors text-xl flex items-center justify-center gap-2 mx-auto"
            >
              Tjetra <ArrowRight size={24} />
            </button>
          </div>
        )}

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
