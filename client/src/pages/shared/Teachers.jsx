import { useCallback, useEffect, useState } from "react";
import Nav from "../../components/shared/Nav";
import { API_BASE } from "../../config/api";
import TeachersList from "../../components/teacher/TeachersList";
import TeacherModal from "../../components/teacher/TeacherModal";
import Header from "../../components/shared/Header";

const Teachers = ({
  navOpen,
  setNavOpen,
  activeNav,
  setActiveNav,
  searchTerm,
  setSearchTerm,
}) => {
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    lastPage: "",
    total: "",
  });
  const [teacherId, setTeacherId] = useState("");
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState("none"); // "none", "manual", "page", "all"

  // Clear selection when changing page or filters
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode("none");
  }, [page, category, subCategory, searchTerm]);

  const [teacherData, setTeacherData] = useState({
    teacher_id: "",
    teacher_image: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    civil_status: "",
    date_of_birth: "",
    contact_number: "",
    email_address: "",
    house_number: "",
    street: "",
    barangay: "",
    town: "",
    province: "",
    educational_attainment: "",
    achievements: "",
    specialty: "",
    teaching_experience: "",
    subject_to_teach: "",
    teacher_status: "Active",
  });

  const clearFields = () => {
    return setTeacherData({
      teacher_id: "",
      teacher_image: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      civil_status: "",
      date_of_birth: "",
      contact_number: "",
      email_address: "",
      house_number: "",
      street: "",
      barangay: "",
      town: "",
      province: "",
      educational_attainment: "",
      achievements: "",
      subject_to_teach: "",
      specialty: "",
      teaching_experience: "",
      teacher_status: "Active",
    });
  };

  const categoryTypes = {
    Gender: ["Male", "Female"],
    Civil_Status: ["Single", "Married", "Widow"],
    Status: ["Active", "Inactive"],
  };

  let subOptions = [];
  if (category) {
    const selected = categoryTypes[category];
    if (Array.isArray(selected)) {
      subOptions = selected;
    } else if (typeof selected === "object") {
      subOptions = Object.keys(selected);
    }
  }

  // Sorting State
  const [sortBy, setSortBy] = useState("teacher_id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // ==========> Fetching Teachers Data <========== \\
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/teachers.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "searchTeacher",
          category: category,
          subCategory: subCategory,
          searchTerm: searchTerm,
          page: page,
          sortBy: sortBy,
          sortOrder: sortOrder
        }),
      });
      const data = await response.json();
      setTeachers(data.records);
      setPaginationInfo({
        currentPage: data.current_page,
        lastPage: data.last_page,
        total: data.total,
      });
    } catch (error) {
      console.log("Error fetching teachers", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, category, subCategory, searchTerm, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);
  // ==========> Fetching Teachers Data <========== \\

  // ==========> Fetch Get Teacher By Id <========== \\
  const fetchGetTeacher = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/teachers.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getTeacher",
          teacher_id: teacherId,
        }),
      });
      const data = await response.json();
      setTeacherData(data);
    } catch (error) {
      console.log("Error in getting student", error);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchGetTeacher();
    }
  }, [teacherId, fetchGetTeacher]);
  // ==========> Fetch Get Teacher By Id <========== \\

  return (
    <main
      className="min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row"
    >
      <Nav
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        setActiveNav={setActiveNav}
        setSearchTerm={setSearchTerm}
      />
      <section
        className={`flex-1 flex flex-col h-screen overflow-hidden
                          ${
                            modal !== ""
                              ? "blur-md pointer-events-none"
                              : "pointer-events-auto"
                          }`}
      >
        <Header
          setNavOpen={setNavOpen}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
        />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            <TeachersList
              teachers={teachers}
              setTeacherId={setTeacherId}
              setModal={setModal}
              loading={loading}
              categoryTypes={categoryTypes}
              page={page}
              setPage={setPage}
              paginationInfo={paginationInfo}
              category={category}
              setCategory={setCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              subCategory={subCategory}
              setSubCategory={setSubCategory}
              subOptions={subOptions}
              activeNav={activeNav}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              fetchTeachers={fetchTeachers}
            />
          </div>
        </div>
      </section>
      <TeacherModal
        modal={modal}
        setModal={setModal}
        teacherData={teacherData}
        setTeacherData={setTeacherData}
        fetchTeachers={fetchTeachers}
        setTeacherId={setTeacherId}
        clearFields={clearFields}
      />
    </main>
  );
};

export default Teachers;
