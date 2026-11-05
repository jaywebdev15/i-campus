import React, { useState, useEffect, useContext } from 'react';
import { API_BASE } from '../../config/api';
import Nav from '../../components/shared/Nav';
import Header from '../../components/shared/Header';
import { BiChevronLeft, BiChevronRight, BiPlus, BiTrash, BiEdit, BiCalendarEvent, BiX, BiImport } from 'react-icons/bi';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { AuthContext } from '../../context/AuthContext';

const SchoolCalendar = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
    const { userCredential } = useContext(AuthContext);
    const { showFlashMessage } = useContext(FlashMessageContext);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState(""); // "", "add", "edit"
    const [eventData, setEventData] = useState({
        calendar_id: "",
        event_title: "",
        event_description: "",
        event_date: "",
        event_type: "Activity"
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_BASE}/database/school_calendar.php`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]); 
                if (data.status === "error") {
                   console.error("Error fetching events:", data.message);
                }
            }
        } catch (error) {
            console.error("Error fetching events", error);
        }
    };

    const handleMonthChange = (direction) => {
        const newDate = new Date(currentDate);
        // Set to the first day of the month before shifting to avoid jumping 
        // past months with fewer days (e.g. March 31 -> May 1 if March 31 +/- 1 month)
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        setEventData({
            calendar_id: "",
            event_title: "",
            event_description: "",
            event_date: formattedDate,
            event_type: "Activity"
        });
        setModal("add");
    };

    const handleEventClick = (e, event) => {
        e.stopPropagation();
        setEventData(event);
        setModal("edit");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = modal === "add" ? "addEvent" : "updateEvent";
        
        try {
            const response = await fetch(`${API_BASE}/database/school_calendar.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...eventData })
            });
            const result = await response.json();
            
            showFlashMessage(result.status, result.message);
            if (result.status === "success") {
                setModal("");
                fetchEvents();
            }
        } catch (error) {
            console.error("Error saving event", error);
            showFlashMessage("failed", "An error occurred.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const response = await fetch(`${API_BASE}/database/school_calendar.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "deleteEvent", calendar_id: eventData.calendar_id })
            });
            const result = await response.json();
            showFlashMessage(result.status, result.message);
            if (result.status === "success") {
                setModal("");
                fetchEvents();
            }
        } catch (error) {
            console.error("Error deleting event", error);
            showFlashMessage("failed", "An error occurred.");
        }
    };

    const handleImportHolidays = async () => {
        if (!window.confirm("Import Philippine holidays for 2026? This will skip any holidays that already exist.")) return;
        try {
            const response = await fetch(`${API_BASE}/database/school_calendar.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "importHolidays" })
            });
            const result = await response.json();
            showFlashMessage(result.status, result.message);
            if (result.status === "success") {
                fetchEvents();
            }
        } catch (error) {
            console.error("Error importing holidays", error);
            showFlashMessage("failed", "An error occurred while importing holidays.");
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/30"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            const dayEvents = events.filter(e => e.event_date === dateStr);
            
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            const isToday = todayStr === dateStr;

            days.push(
                <div key={day} 
                     onClick={() => userCredential.login_role === 'Admin' && handleDateClick(day)}
                     className={`h-24 border border-gray-100 p-2 relative group hover:bg-blue-50 transition-colors cursor-pointer overflow-hidden ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                    <span className={`text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                        {day}
                    </span>
                    
                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[calc(100%-2rem)] custom-scrollbar">
                        {dayEvents.map(event => (
                            <div key={event.calendar_id} 
                                 onClick={(e) => userCredential.login_role === 'Admin' && handleEventClick(e, event)}
                                 className={`text-xs p-1 rounded truncate text-white shadow-sm hover:opacity-90 transition-opacity ${
                                     event.event_type === 'Exam' ? 'bg-red-500' : 
                                     event.event_type === 'Holiday' ? 'bg-green-500' : 
                                     'bg-blue-500'
                                 }`}>
                                {event.event_title}
                            </div>
                        ))}
                    </div>

                    {userCredential.login_role === 'Admin' && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <BiPlus className="text-gray-400 hover:text-blue-600" />
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Filter events for the current month
    const currentMonthEvents = events.filter(e => {
        const eventDate = new Date(e.event_date + 'T00:00:00');
        return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => a.event_date.localeCompare(b.event_date));

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-row h-screen bg-gray-50 overflow-hidden">
            <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm}
            activeNav={"School Calendar"} />
            
            <div className='flex-1 flex flex-col h-screen overflow-hidden relative'>
                <Header setNavOpen={setNavOpen} activeNav={activeNav} setActiveNav={setActiveNav} title={"School Calendar"} />
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                    
                    {/* Calendar Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                    <BiChevronLeft className="text-2xl" />
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                    <BiChevronRight className="text-2xl" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {userCredential.login_role === 'Admin' && (
                                    <button onClick={handleImportHolidays}
                                            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 shadow-md">
                                        <BiImport className="text-lg" /> Import PH Holidays
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-3 text-center font-semibold text-gray-500 text-sm uppercase tracking-wide">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {renderCalendar()}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Events List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BiCalendarEvent className="text-blue-600 text-xl" />
                            Events & Holidays — {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Description</th>
                                        {userCredential.login_role === 'Admin' && <th className="p-4 text-center">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentMonthEvents.length > 0 ? currentMonthEvents.map(event => (
                                        <tr key={event.calendar_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-gray-700">{formatDate(event.event_date)}</td>
                                            <td className="p-4 font-medium text-gray-900">{event.event_title}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    event.event_type === 'Exam' ? 'bg-red-100 text-red-700' : 
                                                    event.event_type === 'Holiday' ? 'bg-green-100 text-green-700' : 
                                                    event.event_type === 'Meeting' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 max-w-xs truncate">{event.event_description}</td>
                                            {userCredential.login_role === 'Admin' && (
                                                <td className="p-4 flex justify-center gap-2">
                                                    <button onClick={(e) => handleEventClick(e, event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                                        <BiEdit size={18} />
                                                    </button>
                                                    <button onClick={() => {
                                                        if(window.confirm("Delete event?")) {
                                                            fetch(`${API_BASE}/database/school_calendar.php`, {
                                                                method: "POST",
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: "deleteEvent", calendar_id: event.calendar_id })
                                                            }).then(() => {
                                                                showFlashMessage("success", "Event deleted");
                                                                fetchEvents();
                                                            });
                                                        }
                                                    }} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                        <BiTrash size={18} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No events or holidays this month.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Modal */}
                {modal !== "" && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                         onClick={() => setModal("")}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                             onClick={e => e.stopPropagation()}>
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {modal === "add" ? "Add New Event" : "Edit Event"}
                                </h3>
                                <button onClick={() => setModal("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <BiX size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Event Title</label>
                                    <input type="text" required
                                           value={eventData.event_title}
                                           onChange={e => setEventData({...eventData, event_title: e.target.value})}
                                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                           placeholder="e.g. Midterm Exam" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                                    <input type="date" required
                                           value={eventData.event_date}
                                           onChange={e => setEventData({...eventData, event_date: e.target.value})}
                                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
                                    <select value={eventData.event_type}
                                            onChange={e => setEventData({...eventData, event_type: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white">
                                        <option value="Activity">Activity</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Meeting">Meeting</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                                    <textarea value={eventData.event_description}
                                              onChange={e => setEventData({...eventData, event_description: e.target.value})}
                                              rows="3"
                                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none resize-none"
                                              placeholder="Optional details..."></textarea>
                                </div>

                                <div className="flex justify-end gap-2 mt-2">
                                    {modal === "edit" && (
                                        <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors mr-auto">
                                            Delete
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setModal("")} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-all active:scale-95">
                                        {modal === "add" ? "Add Event" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



export default SchoolCalendar;
