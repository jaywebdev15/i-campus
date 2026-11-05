import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header';
import ELearningList from '../../components/eLearning/ELearningList';
import LessonList from '../../components/eLearning/LessonList';
import QuizList from '../../components/eLearning/QuizList';
import QuestionList from '../../components/eLearning/QuestionList';
import ELearningModal from '../../components/eLearning/ELearningModal';
import LessonModal from '../../components/eLearning/LessonModal';
import QuizModal from '../../components/eLearning/QuizModal';
import QuestionModal from '../../components/eLearning/QuestionModal';
import StudentView from '../../components/eLearning/StudentView';
import { FlashMessageContext } from '../../context/FlashMessageContext';

const ELearning = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const { userCredential, loading: authLoading } = useContext(AuthContext); // Use AuthLoading
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const navigate = useNavigate(); // Add navigate

  const [activeTab, setActiveTab] = useState("e_learnings"); 
  const [eLearnings, setELearnings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Pagination State
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonTotal, setLessonTotal] = useState(0);

  const [quizPage, setQuizPage] = useState(1);
  const [quizTotal, setQuizTotal] = useState(0);

  const [questionPage, setQuestionPage] = useState(1);
  const [questionTotal, setQuestionTotal] = useState(0);

  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  
  // IDs for editing
  const [eLearningId, setELearningId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [questionId, setQuestionId] = useState("");

  const [eLearningData, setELearningData] = useState({
    e_learning_id:            "", 
    e_learning_video:         "", 
    e_learning_title:         "", 
    e_learning_curriculum_id: "", 
    category:                 "", 
    subject_code:             "",
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Sorting State
  const [sortBy, setSortBy] = useState("e_learning_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Clear selection and sort when changing filters or tabs
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
    // Reset sort when switching tabs (optional, but safer to avoid invalid column names)
    // We only want to reset sort if activeTab changes, not necessarily on searchTerm change alone?
    // Actually, keeping sort on search is good.
    // But invalid columns across tabs is a real issue.
    // Let's reset sort only if activeTab changes.
  }, [searchTerm]);

  useEffect(() => {
     setSelectedIds([]);
     setSelectionMode("none");
     setSortBy(activeTab === "e_learnings" ? "e_learning_id" : 
               activeTab === "lessons" ? "e_lesson_id" : 
               activeTab === "quizzes" ? "quiz_id" : "question_id");
     setSortOrder("DESC");
  }, [activeTab]);

  // Auth Protection
  useEffect(() => {
    if(!authLoading && (!userCredential || !userCredential?.login_status)) {
       navigate("/login");
    }
  }, [userCredential, authLoading, navigate]);

  const fetchELearning = useCallback(async () => {
    setLoading(true);
    try {
      // Validate sortBy for ELearning
      const validSorts = ['e_learning_id', 'e_learning_title', 'subject_code', 'subject_title', 'category'];
      const safeSortBy = validSorts.includes(sortBy) ? sortBy : 'e_learning_id';

      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getELearnings", 
          searchTerm: searchTerm,
          sortBy: safeSortBy,
          sortOrder: sortOrder
        })
      });
      const data = await response.json();
      if(Array.isArray(data)) {
         setELearnings(data);
      } else {
         console.error("Fetch ELearnings failed:", data);
      }
    } catch (error) {
      console.error("Error in fetching course", error);
    } finally {
      if(activeTab === "e_learnings") setLoading(false);
    }
  }, [searchTerm, activeTab, sortBy, sortOrder]);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      // Validate sortBy for Lessons
      const validSorts = ['e_lesson_id', 'e_lesson_title', 'e_lesson_type', 'subject_code'];
      const safeSortBy = validSorts.includes(sortBy) ? sortBy : 'e_lesson_id';

      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            action: "getLessons",
            searchTerm: searchTerm,
            sortBy: safeSortBy,
            sortOrder: sortOrder,
            page: lessonPage,
            limit: 10
        })
      });
      const data = await response.json();
      if(data.records) {
          setLessons(data.records);
          setLessonTotal(data.total);
      } else if(Array.isArray(data)) {
          // Fallback for old API response style
          setLessons(data);
          setLessonTotal(data.length);
      } else {
          console.error("Fetch Lessons failed:", data);
      }
    } catch (error) { console.error("Error fetching lessons:", error); }  
    finally { if(activeTab === "lessons") setLoading(false); }
  }, [activeTab, searchTerm, sortBy, sortOrder, lessonPage]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
       // Validate sortBy for Quizzes
       const validSorts = ['quiz_id', 'quiz_title', 'e_lesson_title', 'quiz_total_question', 'quiz_passing_score'];
       const safeSortBy = validSorts.includes(sortBy) ? sortBy : 'quiz_id';

      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            action: "getQuizzes",
            searchTerm: searchTerm,
            sortBy: safeSortBy,
            sortOrder: sortOrder,
            page: quizPage,
            limit: 10
        })
      });
      const data = await response.json();
      if(data.data) {
          setQuizzes(data.data);
          setQuizTotal(data.total);
      } else if(Array.isArray(data)) {
          setQuizzes(data);
          setQuizTotal(data.length);
      } else {
          console.error("Fetch Quizzes failed:", data);
      }
    } catch (error) { console.error("Error fetching quizzes:", error); }  
    finally { if(activeTab === "quizzes") setLoading(false); }
  }, [activeTab, searchTerm, sortBy, sortOrder, quizPage]);

  const handleDeleteQuiz = async (id) => {
      if(!window.confirm("Are you sure you want to delete this quiz?")) return;

      try {
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
              method: "POST", 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({
                  action: "deleteQuiz",
                  quiz_id: id
              })
          });
          const result = await response.json();
          showFlashMessage(result.status, result.message); 
          if (result.status === "success") {
              fetchQuizzes();
          }
      } catch (error) {
          console.error(error);
          showFlashMessage("failed", "An error occurred.");
      }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
       // Validate sortBy for Questions
       const validSorts = ['question_id', 'quiz_title', 'question_text', 'question_type', 'question_points'];
       const safeSortBy = validSorts.includes(sortBy) ? sortBy : 'question_id';

      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            action: "getQuestions",
            searchTerm: searchTerm,
            sortBy: safeSortBy,
            sortOrder: sortOrder,
            page: questionPage,
            limit: 10
        })
      });
      const data = await response.json();
      if(data.data) {
          setQuestions(data.data);
          setQuestionTotal(data.total);
      } else if(Array.isArray(data)) {
          setQuestions(data);
          setQuestionTotal(data.length);
      } else {
          console.error("Fetch Questions failed:", data);
      }
    } catch (error) { console.error("Error fetching questions:", error); }  
    finally { if(activeTab === "questions") setLoading(false); }
  }, [activeTab, searchTerm, sortBy, sortOrder, questionPage]);

  const handleDeleteQuestion = async (id) => {
      if(!window.confirm("Are you sure you want to delete this question?")) return;

      try {
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
              method: "POST", 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({
                  action: "deleteQuestion",
                  question_id: id
              })
          });
          const result = await response.json();
          showFlashMessage(result.status, result.message); 
          if (result.status === "success") {
              fetchQuestions();
          }
      } catch (error) {
          console.error(error);
          showFlashMessage("failed", "An error occurred.");
      }
  };

  const [allQuizzes, setAllQuizzes] = useState([]);

  // ... (keeping existing useEffects and functions)

  const fetchAllQuizzes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            action: "getQuizzes",
            limit: 1000 // Get all for dropdown
        })
      });
      const data = await response.json();
      if(data.data) {
          setAllQuizzes(data.data);
      } else if(Array.isArray(data)) {
          setAllQuizzes(data);
      }
    } catch (error) { console.error("Error fetching all quizzes:", error); }  
  }, []);

  useEffect(() => {
    // Only fetch if authenticated
    if(userCredential?.login_status) {
        if (activeTab === "e_learnings") fetchELearning();
        if (activeTab === "lessons") fetchLessons();
        if (activeTab === "quizzes") fetchQuizzes();
        if (activeTab === "questions") {
            fetchQuestions();
            fetchAllQuizzes();
        }
    }
  }, [activeTab, fetchELearning, fetchLessons, fetchQuizzes, fetchQuestions, fetchAllQuizzes, userCredential]);

  const fetchGetELearningId = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/e_learning.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getELearningBasedOnId", 
          e_learning_id: eLearningId
        })
      });
      const data = await response.json();
      setELearningData(data);
    } catch (error) {
      console.error("Error fetching course id", error);
    }
  }, [eLearningId]);

  useEffect(() => {
    if(eLearningId) {
      fetchGetELearningId();
    }
  }, [eLearningId, fetchGetELearningId]);


  const handleDeleteELearning = async (id) => {
      if(!window.confirm("Are you sure you want to delete this course?")) return;

      try {
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
              method: "POST", 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({
                  action: "deleteELearning",
                  e_learning_id: id
              })
          });
          const result = await response.json();
          showFlashMessage(result.status, result.message); 
          if (result.status === "success") {
              fetchELearning();
          }
      } catch (error) {
          console.error(error);
          showFlashMessage("failed", "An error occurred.");
      }
  };

  const handleDeleteLesson = async (id) => {
      if(!window.confirm("Are you sure you want to delete this lesson?")) return;

      try {
          const response = await fetch(`${API_BASE}/database/e_learning.php`, {
              method: "POST", 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({
                  action: "deleteLesson",
                  lesson_id: id
              })
          });
          const result = await response.json();
          showFlashMessage(result.status, result.message); 
          if (result.status === "success") {
              fetchLessons();
          }
      } catch (error) {
          console.error(error);
          showFlashMessage("failed", "An error occurred.");
      }
  };

  // console.log("ELearning Render:", { authLoading, userCredential, activeTab, modal, navOpen });

  if(authLoading) {
     return <div className="min-h-screen bg-gray-200 flex items-center justify-center">Loading...</div>;
  }

  // Auth Protection moved to useEffect, this is just fail-safe UI
  if (!userCredential && !authLoading) {
      return <div className="min-h-screen bg-gray-200 flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <main className='min-h-dvh flex flex-col bg-slate-50 overflow-hidden 
                    sm:h-dvh 
                    lg:flex-row'>
      <Nav  navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${modal !== "" 
                            ? 'blur-md pointer-events-none' 
                            : 'pointer-events-auto' 
                          }`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                setActiveNav={setActiveNav} />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            { userCredential && userCredential.login_role === "Student" ? (
                <StudentView />
            ) : (
                <div className="flex flex-col h-full"> 
                    {/* Admin Tabs */}
                    <div className="flex items-center gap-8 border-b border-gray-100 px-8 pt-6">
                        <button 
                            className={`pb-4 text-sm font-bold transition-all duration-200 uppercase tracking-widest ${activeTab === 'e_learnings' ? 'text-blue-600 border-b-2 border-blue-600 translate-y-[1px]' : 'text-gray-400 hover:text-gray-600 hover:border-b-2 hover:border-gray-200'}`} 
                            onClick={() => setActiveTab('e_learnings')}
                        >
                            E-Learnings
                        </button>
                        <button 
                            className={`pb-4 text-sm font-bold transition-all duration-200 uppercase tracking-widest ${activeTab === 'lessons' ? 'text-blue-600 border-b-2 border-blue-600 translate-y-[1px]' : 'text-gray-400 hover:text-gray-600 hover:border-b-2 hover:border-gray-200'}`} 
                            onClick={() => setActiveTab('lessons')}
                        >
                            Lessons
                        </button>
                        <button 
                            className={`pb-4 text-sm font-bold transition-all duration-200 uppercase tracking-widest ${activeTab === 'quizzes' ? 'text-blue-600 border-b-2 border-blue-600 translate-y-[1px]' : 'text-gray-400 hover:text-gray-600 hover:border-b-2 hover:border-gray-200'}`} 
                            onClick={() => setActiveTab('quizzes')}
                        >
                            Quizzes
                        </button>
                        <button 
                            className={`pb-4 text-sm font-bold transition-all duration-200 uppercase tracking-widest ${activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600 translate-y-[1px]' : 'text-gray-400 hover:text-gray-600 hover:border-b-2 hover:border-gray-200'}`} 
                            onClick={() => setActiveTab('questions')}
                        >
                            Questions
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        { activeTab === 'e_learnings' && (
                            <ELearningList eLearnings={eLearnings} 
                                        setELearningId={setELearningId} 
                                        setModal={setModal} 
                                        loading={loading} 
                                        handleDelete={handleDeleteELearning}
                                        onRefresh={fetchELearning}
                                        selectedIds={selectedIds}
                                        setSelectedIds={setSelectedIds}
                                        selectionMode={selectionMode}
                                        setSelectionMode={setSelectionMode}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        handleSort={handleSort} />
                        )}
                        { activeTab === 'lessons' && (
                            <LessonList lessons={lessons} 
                                        setLessonId={setLessonId} 
                                        setModal={setModal} 
                                        loading={loading}
                                        onRefresh={fetchLessons}
                                        selectedIds={selectedIds}
                                        setSelectedIds={setSelectedIds}
                                        selectionMode={selectionMode}
                                        setSelectionMode={setSelectionMode}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        handleSort={handleSort}
                                        handleDelete={handleDeleteLesson}
                                        page={lessonPage}
                                        setPage={setLessonPage}
                                        paginationInfo={{ 
                                            total: lessonTotal, 
                                            limit: 10, 
                                            currentPage: lessonPage 
                                        }} />
                        )}
                        { activeTab === 'quizzes' && (
                            <QuizList quizzes={quizzes} 
                                        setQuizId={setQuizId} 
                                        setModal={setModal} 
                                        loading={loading}
                                        onRefresh={fetchQuizzes}
                                        selectedIds={selectedIds}
                                        setSelectedIds={setSelectedIds}
                                        selectionMode={selectionMode}
                                        setSelectionMode={setSelectionMode}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        handleSort={handleSort}
                                        handleDelete={handleDeleteQuiz}
                                        page={quizPage}
                                        setPage={setQuizPage}
                                        paginationInfo={{ 
                                            total: quizTotal, 
                                            limit: 10, 
                                            currentPage: quizPage, 
                                            lastPage: Math.ceil(quizTotal / 10) 
                                        }} />
                        )}
                        { activeTab === 'questions' && (
                            <QuestionList questions={questions} 
                                        setQuestionId={setQuestionId} 
                                        setModal={setModal} 
                                        loading={loading}
                                        onRefresh={fetchQuestions}
                                        selectedIds={selectedIds}
                                        setSelectedIds={setSelectedIds}
                                        selectionMode={selectionMode}
                                        setSelectionMode={setSelectionMode}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        handleSort={handleSort}
                                        handleDelete={handleDeleteQuestion}
                                        page={questionPage}
                                        setPage={setQuestionPage}
                                        paginationInfo={{ 
                                            total: questionTotal, 
                                            limit: 10, 
                                            currentPage: questionPage, 
                                            lastPage: Math.ceil(questionTotal / 10) 
                                        }} />
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </section>
      { activeTab === 'e_learnings' && (
        <ELearningModal 
                        modal={modal} 
                        setModal={setModal} 
                        fetchELearning={fetchELearning} 
                        setELearningId={setELearningId} 
                        eLearningData={eLearningData} 
                        setELearningData={setELearningData} />
      )}
      
      { activeTab === 'lessons' && (
        <LessonModal 
            modal={modal} 
            setModal={setModal} 
            fetchLessons={fetchLessons} 
            lessonId={lessonId} 
            lessons={lessons} />
      )}

      { activeTab === 'quizzes' && (
        <QuizModal 
            modal={modal} 
            setModal={setModal} 
            fetchQuizzes={fetchQuizzes} 
            quizId={quizId} 
            quizzes={quizzes}
            lessons={lessons} />
      )}

      { activeTab === 'questions' && (
        <QuestionModal 
            modal={modal} 
            setModal={setModal} 
            fetchQuestions={fetchQuestions} 
            questionId={questionId} 
            questions={questions}
            quizzes={allQuizzes} />
      )}
    </main>
  )
}

export default ELearning