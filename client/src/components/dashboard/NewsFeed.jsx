import React, { useState, useEffect } from "react";
import { API_BASE } from '../../config/api';

const staticFeeds = [
  "🎓 College Enrollment for 2nd Semester — Ongoing Now!",
  "📘 Senior High Semester Advising — Visit your strand coordinator!",
  "🛠️ TESDA Skills Training Registration — Open This Week!",
  "📝 Scholarship Applications for College & SHS — Apply Now!",
  "🏆 NC II Assessment Schedule — Check TESDA Bulletin Board!"
];

const NewsFeedCarousel = () => {
  const [feedItems, setFeedItems] = useState([]);

  const getEventEmoji = (type) => {
    switch (type) {
      case 'Holiday': return '🏖️';
      case 'Exam': return '📝';
      case 'Meeting': return '🤝';
      default: return '📅';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE}/database/school_calendar.php`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Get upcoming events (today and future), sorted by date
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = data
            .filter(e => e.event_date >= today)
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
            .slice(0, 15)
            .map(e => `${getEventEmoji(e.event_type)} ${e.event_title} — ${formatDate(e.event_date)}`);

          setFeedItems([...upcoming, ...staticFeeds]);
        } else {
          setFeedItems(staticFeeds);
        }
      } catch (error) {
        console.error("Error fetching calendar events for newsfeed", error);
        setFeedItems(staticFeeds);
      }
    };
    fetchEvents();
  }, []);

  const items = feedItems.length > 0 ? feedItems : staticFeeds;

  return (
    <div
      className="relative w-screen overflow-hidden h-[10vh] 
                 flex items-center bg-[#0f172a] text-white font-semibold text-lg
                 lg:w-[calc(100vw-280px)]"
    >
      {/* Scrolling container */}
      <div
        className="flex whitespace-nowrap animate-[slide_200s_linear_infinite] 
                    hover:[animation-play-state:paused]"
        style={{
          width: `${items.length * 200}vw`,
        }}
      >
        {[...items, ...items].map((text, index) => (
          <span
            key={index}
            className="flex-shrink-0 w-screen px-10 text-6xl text-center text-yellow-300 
                        hover:text-yellow-500"
          >
            {text}
          </span>
        ))}
      </div>

      {/* Inline CSS animation */}
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};

export default NewsFeedCarousel;

