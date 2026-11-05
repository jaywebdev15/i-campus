import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/shared/Header'
import { API_BASE } from '../../config/api'
import Nav from '../../components/shared/Nav'
import PaymentList from '../../components/payments/PaymentList'
import PaymentModal from '../../components/payments/PaymentModal'

const Payments = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const [enrollees, setEnrollees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [selectedEnrolleeId, setSelectedEnrolleeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sorting State
  const [sortBy, setSortBy] = useState("enrollment_id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [paymentStatus, setPaymentStatus] = useState("");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEnrolledStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/database/payments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getEnrolledStudents",
          searchTerm: debouncedSearch,
          paymentStatus: paymentStatus,
          page: page,
          limit: 10
        })
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.status === "success") {
          setEnrollees(data.records);
          setPaginationInfo({
            currentPage: data.current_page,
            lastPage: data.last_page,
            total: data.total
          });
        }
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, paymentStatus, page]);

  useEffect(() => {
    fetchEnrolledStudents();
  }, [fetchEnrolledStudents]);

  return (
    <main className="min-h-dvh flex flex-col bg-slate-50 overflow-hidden lg:flex-row">
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex-1 flex flex-col h-screen overflow-hidden ${isModalOpen ? "blur-md pointer-events-none" : "pointer-events-auto"}`}>
        <Header setNavOpen={setNavOpen} activeNav={activeNav} setActiveNav={setActiveNav} title="Payments" />
        
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-w-[1600px] mx-auto">
            <PaymentList 
                enrollees={enrollees}
                loading={loading}
                paginationInfo={paginationInfo}
                page={page}
                setPage={setPage}
                setSelectedEnrolleeId={setSelectedEnrolleeId}
                setIsModalOpen={setIsModalOpen}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                paymentStatus={paymentStatus}
                setPaymentStatus={setPaymentStatus}
            />
          </div>
        </div>
      </section>

      {isModalOpen && (
        <PaymentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          enrollmentId={selectedEnrolleeId}
          onSuccess={fetchEnrolledStudents}
        />
      )}
    </main>
  )
}

export default Payments
