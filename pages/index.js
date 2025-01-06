import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { saveQuizToFirebase, getQuizzesFromFirebase } from '../firebase/firestore';

// Button Component
const Button = ({ className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Card Component
const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
);

export default function QuizApp() {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // تحميل البيانات من localStorage وFirebase عند بدء التطبيق
    const loadData = async () => {
      setLoading(true);
      try {
        // تحميل من localStorage
        const savedLocal = localStorage.getItem('quizzes');
        const localQuizzes = savedLocal ? JSON.parse(savedLocal) : [];
        
        // تحميل من Firebase
        const firebaseQuizzes = await getQuizzesFromFirebase();
        
        // دمج الاختبارات مع إزالة التكرارات
        const allQuizzes = [...localQuizzes, ...firebaseQuizzes];
        const uniqueQuizzes = Array.from(new Map(allQuizzes.map(q => [q.id, q])).values());
        
        setSavedQuizzes(uniqueQuizzes);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const parseQuestions = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    let currentQuestion = null;

    for (let line of lines) {
      line = line.trim();
      
      if (line.match(/^\d+[\.-]/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line,
          options: [],
          correctAnswer: '',
          selectedAnswer: ''
        };
      } else if (line.match(/^[A-Da-dأ-د][)\)]/) && currentQuestion) {
        let letter = line[0].toUpperCase();
        // تحويل الحروف العربية إلى إنجليزية
        const arabicToEnglish = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };
        letter = arabicToEnglish[letter] || letter;
        
        const text = line.slice(2).trim();
        currentQuestion.options.push({ 
          letter, 
          text: text.replace('✓', '').trim() 
        });
        
        if (text.includes('✓')) {
          currentQuestion.correctAnswer = letter;
        }
      } else if (line.toLowerCase().startsWith('answer:') && currentQuestion) {
        const answer = line.split(':')[1].trim().toUpperCase();
        currentQuestion.correctAnswer = answer;
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions.filter(q => q.question && q.options.length > 0);
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
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        selectedAnswer: answer
      };
      return newQuestions;
    });
  };

  const saveQuiz = async () => {
    if (questions.length === 0) return;
    
    setLoading(true);
    try {
      const newQuiz = {
        id: Date.now().toString(),
        title: `اختبار ${savedQuizzes.length + 1}`,
        questions: questions.map(q => ({...q, selectedAnswer: ''})),
        createdAt: new Date()
      };

      // حفظ في Firebase
      await saveQuizToFirebase(newQuiz);

      // حفظ في localStorage
      const newQuizzes = [...savedQuizzes, newQuiz];
      setSavedQuizzes(newQuizzes);
      localStorage.setItem('quizzes', JSON.stringify(newQuizzes));

      setInputText('');
      setQuestions([]);
      alert('تم حفظ الاختبار بنجاح!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('حدث خطأ أثناء حفظ الاختبار');
    } finally {
      setLoading(false);
    }
  };

  const shareQuiz = () => {
    if (questions.length === 0) return;
    
    const quizText = questions.map((q, i) => {
      const optionsText = q.options.map(opt => 
        `${opt.letter}) ${opt.text}${opt.letter === q.correctAnswer ? ' ✓' : ''}`
      ).join('\n');
      return `${i + 1}. ${q.question}\n${optionsText}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(quizText);
    alert('تم نسخ الاختبار! يمكنك لصقه وإرساله لأصدقائك');
  };

  const loadQuiz = (quiz) => {
    setQuestions(quiz.questions.map(q => ({...q, selectedAnswer: ''})));
    const quizText = quiz.questions.map((q, i) => {
      const optionsText = q.options.map(opt => 
        `${opt.letter}) ${opt.text}${opt.letter === q.correctAnswer ? ' ✓' : ''}`
      ).join('\n');
      return `${i + 1}. ${q.question}\n${optionsText}`;
    }).join('\n\n');
    setInputText(quizText);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">اختبار تفاعلي</h1>
          <div className="flex gap-2">
            <Button 
              onClick={shareQuiz} 
              className="flex items-center gap-2"
              disabled={questions.length === 0 || loading}
            >
              <Plus className="w-4 h-4" />
              مشاركة
            </Button>
            <Button 
              onClick={saveQuiz} 
              className="bg-green-500 hover:bg-green-600"
              disabled={questions.length === 0 || loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Saved Quizzes */}
          {savedQuizzes.length > 0 && (
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {savedQuizzes.map((quiz) => (
                <Card key={quiz.id} className="p-4">
                  <h2 className="font-semibold mb-2">{quiz.title}</h2>
                  <p className="text-gray-600 mb-4">{quiz.questions.length} أسئلة</p>
                  <Button onClick={() => loadQuiz(quiz)}>
                    تحميل الاختبار
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Input Area */}
          <Card className="p-4 mb-6">
            <textarea
              className="w-full h-40 p-3 border rounded-lg shadow-sm text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`الصق الأسئلة هنا بهذا التنسيق:
1. السؤال الأول
أ) الإجابة الأولى
ب) الإجابة الثانية ✓
ج) الإجابة الثالثة
د) الإجابة الرابعة`}
              value={inputText}
              onChange={handleTextInput}
              dir="rtl"
            />
          </Card>

          {/* Questions */}
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
                {question.selectedAnswer && 
                 question.selectedAnswer !== question.correctAnswer && (
                  <div className="mt-4 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
                      الإجابة الصحيحة هي: {question.correctAnswer}
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            {/* Example Format */}
            {questions.length === 0 && inputText.trim() === '' && (
              <Card className="p-4 mt-4 text-gray-600 text-sm">
                <h3 className="font-semibold mb-2">مثال على تنسيق الأسئلة:</h3>
                <pre className="whitespace-pre-wrap">
                  {`1. ما هو السؤال الأول؟
a) الإجابة الأولى
b) الإجابة الثانية
c) الإجابة الثالثة
d) الإجابة الرابعة
Answer: b

2. ما هو السؤال الثاني؟
a) الإجابة الأولى
b) الإجابة الثانية
c) الإجابة الثالثة
d) الإجابة الرابعة
Answer: c`}
                </pre>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizApp;
