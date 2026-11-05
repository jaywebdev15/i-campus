import React, { useContext, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { BiX, BiVideoOff } from "react-icons/bi";
import { API_BASE } from '../../config/api';

const ELearningModal = ({ modal, setModal, fetchELearning, setELearningId, eLearningData, setELearningData }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch Categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/database/curriculums.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "getCurriculumCategories" })
            });
            const data = await response.json();
            if(Array.isArray(data)) setCategories(data);
        } catch (e) {
            console.error(e);
        }
    };
    fetchCategories();
  }, []);

  // Fetch Subjects when Category changes
  React.useEffect(() => {
    const fetchSubjects = async () => {
        if (!eLearningData.category) {
            setSubjects([]);
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/database/curriculums.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "getCurriculumsByCategory",
                    category: eLearningData.category // Matches backend $category = $data['category']
                })
            });
            const data = await response.json();
            if(Array.isArray(data)) setSubjects(data);
        } catch (e) {
            console.error(e);
        }
    };
    fetchSubjects();
  }, [eLearningData.category]);

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if(file) {
      setVideoFile(file);
      setVideo(URL.createObjectURL(file));
    }
  }


  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => {
             if(modal === "info") {
                setModal("");
                setELearningId("");
                setELearningData({
                     e_learning_id:            "", 
                     e_learning_video:         "", 
                     e_learning_title:         "", 
                     e_learning_curriculum_id: "", 
                });
             }
           }}
      />

       <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh]
                    bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${modal !== "" ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
             {modal === "add" ? "Add New E-Learning" : modal === "edit" ? "Update E-Learning" : "E-Learning Info"}
          </h2>
          <button onClick={() => { 
                   setModal("");
                   setELearningData({
                        e_learning_id:            "", 
                        e_learning_video:         "", 
                        e_learning_title:         "", 
                        e_learning_curriculum_id: "", 
                   });
                   setELearningId("");
                }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors">
            <BiX className='text-3xl' />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
           <div className="grid grid-cols-1 gap-6">
              
                  <div className="flex flex-col gap-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-Learning Video</label>
                     <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col gap-3">
                        {video || eLearningData.e_learning_video ? (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center shadow-sm">
                               <video src={video || `/api/videos/${eLearningData.e_learning_video}`} 
                                      controls 
                                      className='w-full h-full object-contain'/>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded bg-white">
                                 <BiVideoOff className='text-4xl text-gray-300 mb-2' />
                                 <p className="text-sm text-gray-400">No video selected</p>
                            </div>
                        )}
                        
                        {modal !== "info" && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video File</label>
                                <input type="file" 
                                        accept="video/*"
                                        onChange={handleVideo}
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer"/>
                            </div>
                        )}
                     </div>
                  </div>
               
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Video Title</label>
                 <input type="text" value={eLearningData.e_learning_title || ""} readOnly={modal === "info"} 
                        onChange={(e) => setELearningData({...eLearningData, e_learning_title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50"/>
              </div>

                {/* Available Categories */}
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                  <select 
                      value={eLearningData.category || ""}
                      onChange={(e) => {
                          setELearningData({
                              ...eLearningData, 
                              category: e.target.value,
                              e_learning_curriculum_id: "", // Reset subject when category changes
                              subject_code: "" 
                          });
                      }}
                      disabled={modal === "info"}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white"
                  >
                        <option value="">Select Category</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                  </select>
               </div>

                {/* Available Subjects */}
               <div className="flex flex-col gap-1">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
                 <select
                        value={eLearningData.e_learning_curriculum_id || ""}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedSub = subjects.find(s => s.curriculum_id == selectedId);
                            setELearningData({
                                ...eLearningData, 
                                e_learning_curriculum_id: selectedId,
                                subject_code: selectedSub ? selectedSub.subject_code : ""
                            });
                        }}
                        disabled={modal === "info" || !eLearningData.category || subjects.length === 0}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-50 bg-white"
                 >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                            <option key={sub.curriculum_id} value={sub.curriculum_id}>
                                {sub.subject_code} - {sub.subject_title}
                            </option>
                        ))}
                 </select>
              </div>

           </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button onClick={() => {
                   setModal("");
                   setELearningData({
                        e_learning_id:            "", 
                        e_learning_video:         "", 
                        e_learning_title:         "", 
                        e_learning_curriculum_id: "", 
                   });
                   setELearningId("");
                   setVideo(null); // Clear video preview
                   setVideoFile(null); // Clear file
                }} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200">
             Close
          </button>
          
          {modal !== "info" && (
            <button onClick={async () => {
                 if( eLearningData.e_learning_title        === "" || 
                     eLearningData.e_learning_curriculum_id === "" ) {
                    showFlashMessage("failed", "Please fill all the fields.");
                 } else {
                    try {
                        const formData = new FormData();
                        formData.append("action", "upsertELearning");
                        formData.append("e_learning_id", eLearningData.e_learning_id || "");
                        formData.append("e_learning_title", eLearningData.e_learning_title || "");
                        // Pass subject_code to backend for resolution
                        formData.append("subject_code", eLearningData.subject_code || "");
                        // Also pass e_learning_curriculum_id if we have it (for edit case), but subject_code takes precedence in resolution if needed
                        formData.append("e_learning_curriculum_id", eLearningData.e_learning_curriculum_id || "");
                        // Keep existing video path if no new file
                        formData.append("e_learning_video", eLearningData.e_learning_video || "");

                        if (videoFile) {
                            formData.append("video_file", videoFile);
                        }

                        const response = await fetch(`${API_BASE}/database/e_learning.php`, {
                            method: "POST", 
                            body: formData
                        });
                        const result = await response.json();
                        showFlashMessage(result.status, result.message);
                        if(result.status === "success") {
                            setELearningData({
                                e_learning_id:            "", 
                                e_learning_video:         "", 
                                e_learning_title:         "", 
                                e_learning_curriculum_id: "", 
                            });
                            setVideo(null);
                            setVideoFile(null);
                            setModal("");
                            await fetchELearning();
                        }
                     } catch(e) {
                         console.error("Error saving E-Learning:", e);
                     }
                 }
              }} 
                   className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50">
              {modal === "add" ? 'Save' : 'Update'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}

export default ELearningModal