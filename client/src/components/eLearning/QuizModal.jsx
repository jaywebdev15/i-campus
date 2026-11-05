import React, { useContext, useEffect, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { API_BASE } from '../../config/api';

const QuizModal = ({ modal, setModal, fetchQuizzes, quizId, quizzes, lessons }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [data, setData] = useState({
    quiz_id: "",
    lesson_id: "",
    quiz_title: "",
    quiz_total_question: 0,
    quiz_passing_score: 0
  });

  useEffect(() => {
    if (modal.startsWith("edit") && quizId) {
      const item = quizzes.find(q => q.quiz_id === quizId);
      if (item) setData(item);
    } else {
       setData({
        quiz_id: "",
        lesson_id: "",
        quiz_title: "",
        quiz_total_question: 0,
        quiz_passing_score: 0
       });
    }
  }, [modal, quizId, quizzes]);

  const handleSubmit = async () => {
    if (!data.lesson_id || !data.quiz_title) {
        showFlashMessage("failed", "Please fill required fields.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/database/e_learning.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                action: "upsertQuiz",
                ...data
            })
        });
        const result = await response.json();
        showFlashMessage(result.status, result.message);
        if (result.status === "success") {
            setModal("");
            fetchQuizzes();
        }
    } catch (error) {
        console.error("Error saving quiz:", error);
        showFlashMessage("failed", "An error occurred.");
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal.includes("quiz") ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setModal("")}
      />

       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] shadow-2xl bg-white py-5 px-5 rounded-md gap-5 z-50 
                      transition-all duration-300 
                      md:w-[70%] lg:w-[50%] 
                      ${modal.includes("quiz") ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <h2 className='text-lg font-semibold text-center text-gray-800'>{modal === "add_quiz" ? "Add Quiz" : "Edit Quiz"}</h2>
        
        <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto px-1">
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Lesson</label>
              <select className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" 
                     value={data.lesson_id || ""} onChange={e => setData({...data, lesson_id: e.target.value})}>
                   <option value="">Select Lesson</option>
                   {lessons && lessons.map(l => (
                      <option key={l.e_lesson_id} value={l.e_lesson_id}>{l.e_lesson_title}</option>
                   ))}
                   <option value="manual">Enter ID Manually...</option>
              </select>
               {data.lesson_id === "manual" && (
                  <input type="text" placeholder="Lesson ID" className="mt-1 p-2 border border-gray-300 rounded focus:border-blue-500" 
                         value={data.lesson_id === "manual" ? "" : data.lesson_id || ""} onChange={e => setData({...data, lesson_id: e.target.value})} />
               )}
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Title</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.quiz_title || ""} onChange={e => setData({...data, quiz_title: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Total Questions</label>
              <input type="number" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.quiz_total_question || 0} onChange={e => setData({...data, quiz_total_question: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Passing Score</label>
              <input type="number" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.quiz_passing_score || 0} onChange={e => setData({...data, quiz_passing_score: e.target.value})} />
           </div>
        </div>
  
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors" onClick={() => setModal("")}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </>
  )
}

export default QuizModal
