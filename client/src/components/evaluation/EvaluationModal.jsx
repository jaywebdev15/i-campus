import React, { useEffect, useState } from 'react';
import { BiNotepad, BiBookOpen, BiUser, BiIdCard, BiMessageSquareDetail } from 'react-icons/bi';

const EvaluationModal = ({ isOpen, onClose, evaluation, activeTab = "Teacher" }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen && !animate) return null;

  const getRatingColor = (rating) => {
    const num = Number(rating);
    if (num >= 5) return 'bg-emerald-500';
    if (num >= 4) return 'bg-blue-500';
    if (num >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const teacherCriteria = [
    { label: "Explains lessons clearly", value: evaluation?.evaluation_explanation },
    { label: "Demonstrates mastery of the subject", value: evaluation?.evaluation_demonstration },
    { label: "Uses effective teaching methods", value: evaluation?.evaluation_method },
    { label: "Encourages student participation", value: evaluation?.evaluation_encouragement },
    { label: "Provides fair and helpful assessments", value: evaluation?.evaluation_assessment },
    { label: "Manages the class effectively", value: evaluation?.evaluation_management },
    { label: "Treats students with respect", value: evaluation?.evaluation_respect },
    { label: "Communicates clearly", value: evaluation?.evaluation_communication },
    { label: "Comes to class prepared and on time", value: evaluation?.evaluation_ontime },
    { label: "Maintains a positive learning environment", value: evaluation?.evaluation_positive_learning },
  ];

  const studentCriteria = [
    { label: "Demonstration", value: evaluation?.evaluation_demonstration },
    { label: "Participation", value: evaluation?.evaluation_participation },
    { label: "Responsible", value: evaluation?.evaluation_responsible },
    { label: "Willing to Learn", value: evaluation?.evaluation_willing_to_learn },
    { label: "Problem Solving", value: evaluation?.evaluation_problem_solving },
    { label: "Respect", value: evaluation?.evaluation_respect },
    { label: "Reliable", value: evaluation?.evaluation_reliable },
    { label: "Teamwork", value: evaluation?.evaluation_teamwork },
    { label: "Positive Attitude", value: evaluation?.evaluation_positive },
    { label: "Discipline", value: evaluation?.evaluation_discipline },
  ];

  const criteria = activeTab === "Teacher" ? teacherCriteria : studentCriteria;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh]
                      ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 px-8 py-6 text-white shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <BiNotepad className="text-9xl" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight relative z-10">Evaluation Details</h2>
             <p className="text-blue-100 text-sm mt-1 relative z-10 flex items-center gap-2">
                <BiBookOpen /> {evaluation?.subject_title} ({evaluation?.subject_code})
             </p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                        <BiUser className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Student</p>
                        <p className="text-gray-900 font-medium text-lg">
                            {evaluation?.student_firstname} {evaluation?.student_lastname}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600">
                        <BiIdCard className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Instructor</p>
                        <p className="text-gray-900 font-medium text-lg">
                            {evaluation?.teacher_firstname} {evaluation?.teacher_lastname}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ratings List */}
            <div className="space-y-4">
                <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-3">Performance Ratings</h3>
                <div className="grid grid-cols-1 gap-4">
                    {criteria.map((item, index) => (
                        <div key={index} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <span className="text-gray-600 text-sm font-medium pr-4">{item.label}</span>
                            <div className="flex items-center gap-3 shrink-0 w-32 justify-end">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-20">
                                    <div className={`h-full rounded-full ${getRatingColor(item.value)}`} 
                                         style={{ width: `${(item.value / 5) * 100}%` }}></div>
                                </div>
                                <span className="font-bold text-gray-800 w-4 text-right">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments */}
            {evaluation?.evaluation_comments && (
                <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BiMessageSquareDetail /> Comments
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                        "{evaluation.evaluation_comments}"
                    </p>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end shrink-0">
            <button 
                onClick={onClose}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg 
                           hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm hover:shadow">
                Close Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
