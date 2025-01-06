import React, { useState, useEffect } from 'react';
import { Button, Card } from './_app';
import { Plus, Smartphone, Monitor } from 'lucide-react';

const QuizApp = () => {
  const [mode, setMode] = useState('list'); // 'list', 'create', 'take'
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('quizzes');
    if (saved) {
      setSavedQuizzes(JSON.parse(saved));
    }
  }, []);

  const parseQuestions = (text) => {
    const questionBlocks = text.split(/\d+\.\s/).filter(block => block.trim());
    
    return questionBlocks.map(block => {
      const lines = block.split('\n').filter(line => line.trim());
      const questionText = lines[0].trim();
      
      const options = [];
      const optionLetters = ['a', 'b', 'c', 'd'];
      
      let correctAnswer = '';
      
      lines.forEach(line => {
        optionLetters.forEach(letter => {
          const regex = new RegExp(`^${letter}\\)\\s(.+)`, 'i');
          const match = line.match(regex);
          if (match) {
            options.push({
              letter: letter.toUpperCase(),
              text: match[1].trim()
            });
          }
        });
        
        const answerMatch = line.match(/Answer:\s*([a-d])/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].toUpperCase();
        }
      });
      
      return {
        question: questionText,
        options,
        correctAnswer,
        selectedAnswer: '',
      };
    });
  };

  const handleTextInput = (e) => {
    const text = e.target.value;
    setInputText(text);
    if (text.trim()) {
      const parsedQuestions = parseQuestions(text);
      setQuestions(parsedQuestions);
    } else {
      setQuestions([]);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    if (mode === 'create') {
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        newQuestions[questionIndex] = {
          ...newQuestions[questionIndex],
          selectedAnswer: answer
        };
        return newQuestions;
      });
    } else {
      setCurrentQuiz(prev => {
        const newQuiz = {...prev};
        newQuiz.questions[questionIndex].selectedAnswer = answer;
        return newQuiz;
      });
    }
  };

  const saveQuiz = () => {
    if (questions.length === 0) return;
    
    const newQuiz = {
      id: Date.now().toString(),
      title: `اختبار ${savedQuizzes.length + 1}`,
      questions: questions.map(q => ({...q, selectedAnswer: ''}))
    };

    const newQuizzes = [...savedQuizzes, newQuiz];
    setSavedQuizzes(newQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(newQuizzes));
    setMode('list');
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz({
      ...quiz,
      questions: quiz.questions.map(q => ({...q, selectedAnswer: ''}))
    });
    setMode('take');
  };

  const shareQuiz = (quizId) => {
    const quiz = savedQuizzes.find(q => q.id === quizId);
    if (quiz) {
      const quizText = quiz.questions.map((q, i) => {
        const optionsText = q.options.map(opt => 
          `${opt.letter}) ${opt.text}`
        ).join('\n');
        return `${i + 1}. ${q.question}\n${optionsText}\nAnswer: ${q.correctAnswer}`;
      }).join('\n\n');
      
      navigator.clipboard.writeText(quizText);
      alert('تم نسخ الاختبار! يمكنك لصقه وإرساله لأصدقائك');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            {mode === 'list' ? 'الاختبارات المحفوظة' : 
             mode === 'create' ? 'إنشاء اختبار جديد' : 
             'حل الاختبار'}
          </h1>
          <div className="flex gap-2">
            {mode !== 'list' && (
              <Button onClick={() => setMode('list')}>
                العودة للقائمة
              </Button>
            )}
            {mode === 'list' && (
              <Button onClick={() => setMode('create')}>
                <Plus className="w-4 h-4 ml-2" />
                اختبار جديد
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {mode === 'list' && (
            <div className="grid gap-4 md:grid-cols-2">
              {savedQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <h2 className="font-semibold mb-2">{quiz.title}</h2>
                  <p className="text-gray-600 mb-4">{quiz.questions.length} أسئلة</p>
                  <div className="flex gap-2">
                    <Button onClick={() => startQuiz(quiz)}>
                      بدء الاختبار
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => shareQuiz(quiz.id)}
                    >
                      مشاركة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {mode === 'create' && (
            <>
              <Card className="mb-6">
                <textarea
                  className="w-full h-40 p-3 border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الصق الأسئلة هنا..."
                  value={inputText}
                  onChange={handleTextInput}
                  dir="ltr"
                />
              </Card>
              
              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="mb-4">
                  <div className="mb-4 text-lg font-medium">
                    {question.question}
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option) => {
                      const isSelected = question.selectedAnswer === option.letter;
                      const isCorrect = question.correctAnswer === option.letter;
                      const showResult = question.selectedAnswer !== '';
                      
                      let bgColor = 'bg-white';
                      if (showResult && isSelected) {
                        bgColor = isCorrect ? 'bg-green-50' : 'bg-red-50';
                      }
                      
                      return (
                        <div
                          key={option.letter}
                          onClick={() => handleAnswerSelect(questionIndex, option.letter)}
                          className={`p-3 border rounded-lg cursor-pointer ${bgColor} 
                            hover:bg-gray-50 transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="min-w-[24px] font-medium">
                              {option.letter})
                            </div>
                            <div>{option.text}</div>
                            {showResult && isSelected && (
                              <div className="mr-auto">
                                {isCorrect ? 
                                  <span className="text-green-600">✓</span> : 
                                  <span className="text-red-600">✗</span>
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}

              {questions.length > 0 && (
                <Button
                  className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600"
                  onClick={saveQuiz}
                >
                  حفظ الاختبار
                </Button>
              )}
            </>
          )}

          {mode === 'take' && currentQuiz && (
            <div className="space-y-4">
              {currentQuiz.questions.map((question, questionIndex) => (
                <Card key={questionIndex}>
                  <div className="mb-4 text-lg font-medium">
                    {question.question}
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option) => {
                      const isSelected = question.selectedAnswer === option.letter;
                      const isCorrect = question.correctAnswer === option.letter;
                      const showResult = question.selectedAnswer !== '';
                      
                      let bgColor = 'bg-white';
                      if (showResult && isSelected) {
                        bgColor = isCorrect ? 'bg-green-50' : 'bg-red-50';
                      }
                      
                      return (
                        <div
                          key={option.letter}
                          onClick={() => handleAnswerSelect(questionIndex, option.letter)}
                          className={`p-3 border rounded-lg cursor-pointer ${bgColor} 
                            hover:bg-gray-50 transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="min-w-[24px] font-medium">
                              {option.letter})
                            </div>
                            <div>{option.text}</div>
                            {showResult && isSelected && (
                              <div className="mr-auto">
                                {isCorrect ? 
                                  <span className="text-green-600">✓</span> : 
                                  <span className="text-red-600">✗</span>
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
