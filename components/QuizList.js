export default function QuizList({ quizzes, onSelectQuiz }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">الاختبارات المحفوظة</h2>
      {quizzes.map((quiz, index) => (
        <div
          key={quiz.id}
          onClick={() => onSelectQuiz(quiz)}
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">اختبار {index + 1}</h3>
              <p className="text-sm text-gray-500">
                عدد الأسئلة: {quiz.questions.length}
              </p>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onSelectQuiz(quiz);
              }}
            >
              عرض الاختبار
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
