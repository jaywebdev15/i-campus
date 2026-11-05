import React, { useEffect, useState } from 'react'
import { BiArrowBack, BiPlayCircle, BiSolidFilePdf, BiText, BiTask } from "react-icons/bi";
import { API_BASE } from '../../config/api';

const StudentView = () => {
  const [view, setView] = useState("learnings"); // learnings, lessons, lesson_detail, quiz
  const [learnings, setLearnings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLearning, setSelectedLearning] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [activeTab, setActiveTab] = useState('video');
  const [allQuizzes, setAllQuizzes] = useState([]);
  
  // Data Fetching
  useEffect(() => {
    fetch(`${API_BASE}/database/e_learning.php`)
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setLearnings(data);
            else console.error("Fetch learnings failed. Expected array, got:", data);
        })
        .catch(err => console.error("Error fetching learnings:", err));
  }, []);

  const handleSelectLearning = (learning) => {
    setSelectedLearning(learning);
    setActiveTab('video'); // Default to video
    
    // Fetch lessons for the selected curriculum
    fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: "getLessons",
            curriculum_id: learning.e_learning_curriculum_id 
        })
    })
    .then(res => res.json())
    .then(data => {
        if(Array.isArray(data)){
            setLessons(data);
            setView("lessons");
            
            // Also Fetch Quizzes and filter locally
            // Ideally backend should support curriculum_id filter for quizzes too, 
            // but we can filter by matching lesson_ids or just fetch all for now and improve later.
            // Actually, quizzes are linked to lessons. So we need quizzes where lesson_id is in our fetched lessons.
            fetch(`${API_BASE}/database/e_learning.php`, {
                method: "POST", headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getQuizzes" })
            })
            .then(r => r.json())
            .then(quizData => {
                 if(Array.isArray(quizData)) {
                    const lessonIds = data.map(l => l.e_lesson_id);
                    const relevantQuizzes = quizData.filter(q => lessonIds.includes(q.lesson_id));
                    setAllQuizzes(relevantQuizzes);
                 }
            });

        } else {
            console.error("Fetch lessons failed.", data);
            setLessons([]);
        }
    })
    .catch(err => console.error("Error fetching lessons:", err));
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setView("lesson_detail");
    
    // Check for quiz
    fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "getQuizzes" })
    })
    .then(res => res.json())
    .then(res => res.json())
    .then(data => {
        if(Array.isArray(data)) {
            const foundQuiz = data.find(q => q.lesson_id == lesson.e_lesson_id);
            setQuiz(foundQuiz);
        } else {
            console.error("Fetch quizzes failed. Expected array, got:", data);
        }
    })
    .catch(err => console.error("Error fetching quizzes:", err));
  };

  const handleStartQuiz = (quizId = null) => {
    const targetQuizId = quizId || quiz?.quiz_id;
    if(!targetQuizId) return;

    // Fetch Questions
    fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "getQuestions", quiz_id_filter: targetQuizId })
    })
    .then(res => res.json())
    .then(data => {
        if(Array.isArray(data)) {
            setQuestions(data);
            setView("quiz");
        } else {
            console.error("Fetch questions failed. Expected array, got:", data);
        }
    })
    .catch(err => console.error("Error fetching questions:", err));
  };

  return (
    <div className="p-5 flex-1 overflow-auto h-[calc(100vh-100px)]">
      {/* Breadcrumb-ish */}
      <div className="flex items-center gap-4 mb-6">
        {view !== "learnings" && (
            <button onClick={() => {
                if(view === "lessons") setView("learnings");
                if(view === "lesson_detail") setView("lessons");
                if(view === "quiz") setView("lesson_detail");
            }} className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600">
                <BiArrowBack className='text-2xl' />
            </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">
            {view === "learnings" && "My Courses"}
            {view === "lessons" && selectedLearning?.e_learning_title}
            {view === "lesson_detail" && selectedLesson?.e_lesson_title}
            {view === "quiz" && quiz?.quiz_title}
        </h1>
      </div>

      {view === "learnings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learnings.map(item => (
                <div key={item.e_learning_id} 
                     className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition border border-gray-200"
                     onClick={() => handleSelectLearning(item)}>
                    {/* Placeholder for video thumbnail if available */}
                    <div className="h-32 bg-gray-300 rounded mb-2 flex items-center justify-center">
                        <BiPlayCircle className='text-4xl text-gray-500' />
                    </div>
                    <h3 className="font-bold text-lg">{item.e_learning_title}</h3>
                    <p className="text-gray-600 text-sm">{item.subject_description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{item.category}</span>
                </div>
            ))}
        </div>
      )}

      {view === "lessons" && (
        <div className="flex flex-col gap-4">
             {/* Tabs */}
             <div className="flex border-b border-gray-200">
                <button 
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'video' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('video')}>
                    E-Learning Video
                    {activeTab === 'video' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                </button>
                <button 
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'lesson' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('lesson')}>
                    E-Lesson
                    {activeTab === 'lesson' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                </button>
                <button 
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'quiz' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('quiz')}>
                    E-Quizzes
                    {activeTab === 'quiz' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
                </button>
             </div>

             {/* Content */}
             <div className="mt-2 text-wrap break-words"> 
                {activeTab === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lessons.filter(l => l.e_lesson_type === 'Video').length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-10">No video lessons found.</p>
                        ) : (
                            lessons.filter(l => l.e_lesson_type === 'Video').map(lesson => (
                                <div key={lesson.e_lesson_id} 
                                    className="p-4 bg-white border border-gray-200 rounded flex flex-col gap-2 cursor-pointer hover:shadow-md transition"
                                    onClick={() => handleSelectLesson(lesson)}>
                                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                        <BiPlayCircle className='text-5xl' />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 line-clamp-1">{lesson.e_lesson_title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">{lesson.e_lesson_description}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'lesson' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {lessons.filter(l => l.e_lesson_type !== 'Video').length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-10">No reading materials found.</p>
                        ) : (
                            lessons.filter(l => l.e_lesson_type !== 'Video').map(lesson => (
                                <div key={lesson.e_lesson_id} 
                                    className="p-4 bg-white border border-gray-200 rounded flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => handleSelectLesson(lesson)}>
                                    <div className={`p-3 rounded-lg ${lesson.e_lesson_type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {lesson.e_lesson_type === 'PDF' && <BiSolidFilePdf className='text-xl' />}
                                        {lesson.e_lesson_type === 'Text' && <BiText className='text-xl' />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{lesson.e_lesson_title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lesson.e_lesson_description}</p>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">{lesson.e_lesson_type}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allQuizzes.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-10">No quizzes available.</p>
                        ) : (
                            allQuizzes.map(q => (
                                <div key={q.quiz_id} 
                                    className="p-5 bg-white border border-gray-200 rounded-lg flex flex-col gap-3 hover:shadow-md transition">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <BiTask className='text-xl' />
                                        </div>
                                        <h4 className="font-bold text-gray-800">{q.quiz_title}</h4>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p><span className="font-semibold">Passing Score:</span> {q.quiz_passing_score} / {q.quiz_total_question}</p>
                                        <p><span className="font-semibold">Items:</span> {q.quiz_total_question}</p>
                                    </div>
                                    <button 
                                        className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                                        onClick={() => {
                                            setQuiz(q);
                                            handleStartQuiz(q.quiz_id); // Pass ID directly
                                        }}>
                                        Start Quiz
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
             </div>
        </div>
      )}

      {view === "lesson_detail" && selectedLesson && (
        <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{selectedLesson.e_lesson_title}</h1>
            <p className="text-gray-600 mb-6">{selectedLesson.e_lesson_description}</p>

            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 min-h-[200px]">
                {/* Content Rendering Logic */}
                {selectedLesson.e_lesson_type === "Video" && selectedLesson.e_lesson_path && (
                    <video controls src={`/api/videos/${selectedLesson.e_lesson_path}`} className="w-full rounded" />
                )}
                {selectedLesson.e_lesson_type === "PDF" && selectedLesson.e_lesson_path && (
                    <div className="text-center">
                        <p>PDF Content available at:</p>
                        <a href={selectedLesson.e_lesson_path} target="_blank" rel="noreferrer" className="text-blue-600 underline">View PDF</a>
                    </div>
                )}
                {selectedLesson.e_lesson_type === "Text" && (
                    <p>{selectedLesson.e_lesson_path}</p> 
                )}
            </div>

            {quiz ? (
                <div className="flex bg-blue-50 p-4 rounded items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Quiz Available: {quiz.quiz_title}</h3>
                        <p className="text-sm">Pass: {quiz.quiz_passing_score} / {quiz.quiz_total_question}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" 
                            onClick={handleStartQuiz}>
                        Take Quiz
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 italic">No quiz for this lesson.</p>
            )}
        </div>
      )}

      {view === "quiz" && questions.length > 0 && (
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{quiz.quiz_title}</h2>
            {questions.map((q, idx) => (
                <div key={q.question_id} className="mb-6 border-b border-gray-100 pb-4">
                    <p className="font-semibold mb-2">{idx + 1}. {q.question_text}</p>
                    {q.question_type === "Multiple Choice" && q.question_options && (
                        <div className="flex flex-col gap-2 ml-4">
                            {q.question_options.split(',').map((opt, i) => (
                                <label key={i} className="flex gap-2 cursor-pointer">
                                    <input type="radio" name={`q_${q.question_id}`} value={opt.trim()} />
                                    <span>{opt.trim()}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {(q.question_type === "True/False") && (
                         <div className="flex flex-col gap-2 ml-4">
                            <label className="flex gap-2 cursor-pointer"><input type="radio" name={`q_${q.question_id}`} value="True" /> True</label>
                            <label className="flex gap-2 cursor-pointer"><input type="radio" name={`q_${q.question_id}`} value="False" /> False</label>
                         </div>
                    )}
                    {q.question_type === "Identification" && (
                        <input type="text" className="ml-4 p-2 border border-gray-300 rounded" placeholder="Your Answer" />
                    )}
                </div>
            ))}
            <button className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 w-full" 
                    onClick={() => alert("Quiz Submitted! (Simulation)")}>
                Submit Answers
            </button>
        </div>
      )}
    </div>
  )
}

export default StudentView
