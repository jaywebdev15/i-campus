import React, { useContext, useEffect, useState } from 'react'
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { API_BASE } from '../../config/api';

const LessonModal = ({ modal, setModal, fetchLessons, lessonId, lessons }) => {
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [data, setData] = useState({
    lesson_id: "",
    curriculum_id: "",
    e_lesson_type: "PDF",
    e_lesson_title: "",
    e_lesson_description: "",
    e_lesson_path: ""
  });

  const [videoFile, setVideoFile] = useState(null);

  // Fetch fresh lesson data from API when editing
  useEffect(() => {
    const fetchLessonData = async () => {
      if (modal.startsWith("edit") && lessonId) {
        try {
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: "getLessonById",
              lesson_id: lessonId
            })
          });
          const result = await response.json();
          if (result && result.e_lesson_id) {
            setData(result);
          } else {
            // Fallback to local data
            const item = lessons.find(l => l.e_lesson_id == lessonId);
            if (item) setData(item);
          }
        } catch (error) {
          console.error("Error fetching lesson:", error);
          // Fallback to local data
          const item = lessons.find(l => l.e_lesson_id == lessonId);
          if (item) setData(item);
        }
      } else {
        setData({
          lesson_id: "",
          curriculum_id: "",
          e_lesson_type: "PDF",
          e_lesson_title: "",
          e_lesson_description: "",
          e_lesson_path: ""
        });
        setVideoFile(null);
      }
    };
    
    fetchLessonData();
  }, [modal, lessonId, lessons]);

  const handleSubmit = async () => {
    if (!data.curriculum_id || !data.e_lesson_title) {
        showFlashMessage("failed", "Please fill required fields.");
        return;
    }

    // Validate that type matches existing file (when updating without new file)
    if (modal.startsWith("edit") && data.e_lesson_path && !videoFile) {
        const existingExt = data.e_lesson_path.split('.').pop().toLowerCase();
        const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv'];
        const isExistingVideo = videoExts.includes(existingExt);
        const isExistingPdf = existingExt === 'pdf';
        
        if (data.e_lesson_type === "Video" && !isExistingVideo) {
            showFlashMessage("failed", `Cannot change type to Video. Existing file is .${existingExt}. Please upload a new video file.`);
            return;
        }
        if (data.e_lesson_type === "PDF" && !isExistingPdf) {
            showFlashMessage("failed", `Cannot change type to PDF. Existing file is .${existingExt}. Please upload a new PDF file.`);
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append("action", "upsertLesson");
        // Use e_lesson_id (from DB) or lesson_id as fallback
        const idToSend = data.e_lesson_id || data.lesson_id || "";
        formData.append("lesson_id", idToSend);
        formData.append("curriculum_id", data.curriculum_id || "");
        formData.append("e_lesson_type", data.e_lesson_type || "PDF");
        formData.append("e_lesson_title", data.e_lesson_title || "");
        formData.append("e_lesson_description", data.e_lesson_description || "");
        formData.append("e_lesson_path", data.e_lesson_path || "");

        if (videoFile) {
            // Validate file type before appending
            const fileExtension = videoFile.name.split('.').pop().toLowerCase();
            const fileMimeType = videoFile.type.toLowerCase();
            
            let isValid = false;
            if (data.e_lesson_type === "Video") {
                const allowedVideoExt = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv'];
                isValid = allowedVideoExt.includes(fileExtension) || fileMimeType.startsWith('video/');
            } else if (data.e_lesson_type === "PDF") {
                isValid = fileExtension === 'pdf' || fileMimeType === 'application/pdf';
            } else {
                // Text type - allow any file or no file
                isValid = true;
            }
            
            if (!isValid) {
                showFlashMessage("failed", `Invalid file type (detected: .${fileExtension}). Please upload a ${data.e_lesson_type} file.`);
                return;
            }

            formData.append("video_file", videoFile);
        } else if (data.e_lesson_type !== "Text" && !data.e_lesson_path && !modal.startsWith("edit")) {
             // Require file for new non-text lessons
             showFlashMessage("failed", `Please upload a ${data.e_lesson_type} file.`);
             return;
        }

        const response = await fetch(`${API_BASE}/database/e_learning.php`, {
            method: "POST", 
            body: formData // No headers, browser sets multipart/form-data
        });
        
        // Check if response is OK
        if (!response.ok) {
            showFlashMessage("failed", `Server error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            console.error("JSON Parse Error:", text);
            showFlashMessage("failed", "Server returned invalid response. Check console for details.");
            return;
        }
        
        showFlashMessage(result.status, result.message);
        if (result.status === "success") {
            setModal("");
            fetchLessons();
            setVideoFile(null);
        }
    } catch (error) {
        console.error("Error saving lesson:", error);
        showFlashMessage("failed", "Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${modal.includes("lesson") ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setModal("")}
      />
      
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] shadow-2xl bg-white py-5 px-5 rounded-md gap-5 z-50 
                      transition-all duration-300 
                      md:w-[70%] lg:w-[50%] 
                      ${modal.includes("lesson") ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <h2 className='text-lg font-semibold text-center text-gray-800'>{modal === "add_lesson" ? "Add Lesson" : "Edit Lesson"}</h2>
        
        <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto px-1">
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Curriculum ID</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.curriculum_id || ""} onChange={e => setData({...data, curriculum_id: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Title</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     value={data.e_lesson_title || ""} onChange={e => setData({...data, e_lesson_title: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Type</label>
              <select className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={data.e_lesson_type || "PDF"} onChange={e => setData({...data, e_lesson_type: e.target.value})}>
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Text">Text</option>
              </select>
           </div>
           
           {data.e_lesson_type !== "Text" && (
               <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                     Upload {data.e_lesson_type === "Video" ? "Video" : "PDF Document"}
                  </label>
                  <input type="file" 
                         accept={data.e_lesson_type === "Video" ? "video/*" : "application/pdf"} 
                         className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                         onChange={e => setVideoFile(e.target.files[0])} />
                  {data.e_lesson_path && <span className="text-xs text-gray-500">Current file: {data.e_lesson_path}</span>}
               </div>
           )}

            {data.e_lesson_path && (data.e_lesson_type === "Video" || data.e_lesson_type === "PDF") && (
                <div className="flex flex-col gap-1 mt-2">
                    <label className="text-sm font-bold text-gray-700">Current File Preview</label>
                    <div className="p-2 border border-gray-200 rounded bg-gray-50">
                        {data.e_lesson_type === "Video" ? (
                             <video controls className="w-full max-h-60 rounded" src={`/api/videos/${data.e_lesson_path}`}>
                                 Your browser does not support the video tag.
                             </video>
                        ) : (
                             <a href={`/api/videos/${data.e_lesson_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                 View Current PDF Document ({data.e_lesson_path})
                             </a>
                        )}
                    </div>
                </div>
            )}

           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" rows={3}
                     value={data.e_lesson_description || ""} onChange={e => setData({...data, e_lesson_description: e.target.value})} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Path/URL (Auto-generated for Videos)</label>
              <input type="text" className="p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" 
                     readOnly={data.e_lesson_type === "Video"}
                     value={data.e_lesson_path || ""} onChange={e => setData({...data, e_lesson_path: e.target.value})} />
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

export default LessonModal
