import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Plus } from 'lucide-react';
import { saveQuiz, getQuizzes } from '../firebase/firestore';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);

  const parseQuestions = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    let currentQuestion = null;

    for (let line of lines) {
      line = line.trim();
      
      if (line.match(/^\d+\./)) {
        // سؤال جديد
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line,
          options: [],
          correctAnswer: '',
          selectedAnswer: ''
        };
      } else if (line.match(/^[A-D]\)/i) && currentQuestion) {
        // خيار جديد
        const letter = line[0];
        const text = line.slice(2).trim();
        currentQuestion.options.push({ letter, text });
        
        // إذا كان النص يحتوي على علامة صح، فهذه هي الإجابة الصحيحة
        if (text.includes('✓')) {
          currentQuestion.correctAnswer = letter;
          // إزالة علامة الصح من النص
          currentQuestion.options[currentQuestion.options.length - 1].text = 
            text.replace('✓', '').trim();
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const handleTextInput = (e) => {
    const text = e.target.value;
    setInputText(text);
    
    if (text) {
      const parsedQuestions = parseQuestions(text);
      setQuestions(parsedQuestions);
    } else {
      setQuestions([]);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        selectedAnswer: answer
      };
      return newQuestions;
    });
  };

  // دالة لحفظ الاختبار
  const handleSaveQuiz = async () => {
    if (questions.length > 0) {
      try {
        await saveQuiz(questions);
        alert('تم حفظ الاختبار بنجاح!');
      } catch (error) {
        alert('حدث خطأ أثناء حفظ الاختبار');
      }
    }
  };

  // دالة لتحميل الاختبارات المحفوظة
  const handleLoadQuizzes = async () => {
    try {
      const savedQuizzes = await getQuizzes();
      console.log('الاختبارات المحفوظة:', savedQuizzes);
      // يمكنك هنا إضافة منطق لعرض الاختبارات المحفوظة
    } catch (error) {
      alert('حدث خطأ أثناء تحميل الاختبارات');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">اختبار تفاعلي</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveQuiz}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              حفظ الاختبار
            </Button>
            <Button
              onClick={handleLoadQuizzes}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              تحميل الاختبارات
            </Button>
            <Button
              onClick={() => {
                if (questions.length > 0) {
                  const quizText = questions.map(q => q.question).join('\n');
                  navigator.clipboard.writeText(quizText);
                  alert('تم نسخ الاختبار!');
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              مشاركة
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-4 mb-6">
            <textarea
              className="w-full h-40 p-3 border rounded-lg shadow-sm text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="الصق الأسئلة هنا..."
              value={inputText}
              onChange={handleTextInput}
              dir="ltr"
            />
          </Card>

          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="p-4">
                <div className="mb-4 text-base md:text-lg font-medium">
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
                                <span className="text-green-600 text-xl">✓</span> : 
                                <span className="text-red-600 text-xl">✗</span>
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
        </div>
      </div>
    </div>
  );
}
