import React, { useContext, useEffect, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { API_BASE } from '../../config/api';

const QuestionModal = ({ modal, setModal, fetchQuestions, questionId, questions, quizzes }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [data, setData] = useState({
    question_id: "",
    quiz_id: "",
    question_text: "",
    question_type: "Multiple Choice",
    question_options: "",
    question_answer: "",
    question_points: 1
  });

  useEffect(() => {
    if (modal.startsWith("edit") && questionId) {
      const item = questions.find(q => q.question_id === questionId);
      if (item) {
        let options = item.question_options;
        try {
           const parsed = JSON.parse(options);
           if(Array.isArray(parsed)) options = parsed.join(', ');
        } catch(e) {
           // keep as is if not json
        }

        // Normalize Type
        let type = item.question_type;
        if(type === 'MCQ') type = 'Multiple Choice';
        if(type === 'TRUEFALSE') type = 'True/False';
        if(type === 'ESSAY') type = 'Essay';
        if(type === 'IDENTIFICATION') type = 'Identification';

        setData({...item, question_options: options, question_type: type});
      }
    } else {
       setData({
        question_id: "",
        quiz_id: "",
        question_text: "",
        question_type: "Multiple Choice",
        question_options: "",
        question_answer: "",
        question_points: 1
       });
    }
  }, [modal, questionId, questions]);

  const handleSubmit = async () => {
    if (!data.quiz_id || !data.question_text) {
        showFlashMessage("failed", "Please fill required fields.");
        return;
    }

    // Format options to JSON array string for ALL types to satisfy DB constraint
    let formattedOptions = data.question_options;

    if (data.question_type === "Multiple Choice") {
        if(data.question_options) {
             const parts = data.question_options.split(',').map(s => s.trim()).filter(s => s !== "");
             formattedOptions = JSON.stringify(parts);
        } else {
             formattedOptions = JSON.stringify([]);
        }
    } else if (data.question_type === "True/False") {
         // Auto-set options for T/F if not present, or just ensure valid JSON
         formattedOptions = JSON.stringify(["True", "False"]);
    } else {
         // For Essay, Identification, etc. send empty JSON array if empty
         if(!formattedOptions || formattedOptions.trim() === "") {
             formattedOptions = JSON.stringify([]);
         } else {
             // If user somehow entered text, try to treat as single string or array? 
             // Safest is to wrap in array or just ensure it is valid JSON string.
             // But for Essay/Ident usually no options needed.
             formattedOptions = JSON.stringify([]);
         }
    }

    try {
        const response = await fetch(`${API_BASE}/database/e_learning.php`, {
            method: "POST", 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                action: "upsertQuestion",
                ...data,
                question_options: formattedOptions
            })
        });
        const result = await response.json();
        showFlashMessage(result.status, result.message);
        if (result.status === "success") {
            setModal("");
            fetchQuestions();
        }
    } catch (error) {
        console.error("Error saving question:", error);
        showFlashMessage("failed", "An error occurred.");
    }
  };

  return (
    <>
       <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal.includes("question") ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setModal("")}
       />
      
       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] shadow-2xl bg-white py-5 px-5 rounded-md gap-5 z-50 
                      transition-all duration-300 
                      md:w-[70%] lg:w-[50%] 
                      ${modal.includes("question") ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <h2 className='text-lg font-semibold text-center text-gray-800'>{modal === "add_question" ? "Add Question" : "Edit Question"}</h2>
        
        <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto px-1">
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Quiz</label>
              <select className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" 
                     value={data.quiz_id || ""} onChange={e => setData({...data, quiz_id: e.target.value})}>
                   <option value="">Select Quiz</option>
                   {quizzes && quizzes.map(q => (
                      <option key={q.quiz_id} value={q.quiz_id}>{q.quiz_title}</option>
                   ))}
              </select>
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Question Text</label>
              <textarea className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" rows={3}
                     value={data.question_text || ""} onChange={e => setData({...data, question_text: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Type</label>
              <select className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={data.question_type || "Multiple Choice"} onChange={e => setData({...data, question_type: e.target.value})}>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Identification">Identification</option>
                  <option value="Essay">Essay</option>
              </select>
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Options (comma separated for Multiple Choice)</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.question_options || ""} onChange={e => setData({...data, question_options: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Answer</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.question_answer || ""} onChange={e => setData({...data, question_answer: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Points</label>
              <input type="number" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.question_points || 1} onChange={e => setData({...data, question_points: e.target.value})} />
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

export default QuestionModal
