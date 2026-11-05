import React, { useContext, useRef, useState } from 'react'
import Nav from '../../components/shared/Nav'
import Header from '../../components/shared/Header'
import Cover from '../../components/Handbook/Cover';
import Contents from '../../components/Handbook/Contents';
import Contents2 from '../../components/Handbook/Contents2';
import Overview from '../../components/Handbook/Overview';
import Policies from '../../components/Handbook/Policies';
import Conduct from '../../components/Handbook/Conduct';
import HealthAndSafety from '../../components/Handbook/HealthAndSafety';
import Resources from '../../components/Handbook/Resources';
import Curricular from '../../components/Handbook/Curricular';
import Calendar from '../../components/Handbook/Calendar';
import ParentsAndGuardian from '../../components/Handbook/ParentsAndGuardian';
import Community from '../../components/Handbook/Community';
import RightsAndResponsibilities from '../../components/Handbook/RightsAndResponsibilities';
import { PrintContext } from '../../context/PrinterContext';

const HandBook = ({ navOpen, setNavOpen, activeNav, setActiveNav, searchTerm, setSearchTerm }) => {
  const refToPrint = useRef();
  const { handlePrint } = useContext(PrintContext);
  
  // View Mode State
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' | 'book'
  const [currentPage, setCurrentPage] = useState(0);
  
  // Flip Animation State
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev'

  const pages = [
    { id: 'cover', component: <Cover />, title: 'Cover Page' },
    { id: 'contents', component: <Contents />, title: 'Table of Contents' },
    { id: 'welcome', component: <Contents2 />, title: 'Welcome Message' },
    { id: 'overview', component: <Overview />, title: 'School Overview' },
    { id: 'policies', component: <Policies />, title: 'Academic Policies' },
    { id: 'conduct', component: <Conduct />, title: 'Student Conduct' },
    { id: 'health', component: <HealthAndSafety />, title: 'Health & Safety' },
    { id: 'resources', component: <Resources />, title: 'Student Resources' },
    { id: 'curricular', component: <Curricular />, title: 'Extracurricular Activities' },
    { id: 'calendar', component: <Calendar />, title: 'School Calendar' },
    { id: 'parents', component: <ParentsAndGuardian />, title: 'Parent Involvement' },
    { id: 'community', component: <Community />, title: 'Community Service' },
    { id: 'rights', component: <RightsAndResponsibilities />, title: 'Rights & Responsibilities' },
  ];

  const handlePageChange = (index) => {
    if (viewMode === 'scroll') {
       // Scroll mode just jumps
       // But wait, the scroll dropdown calls this? No, dropdown has its own logic in Scroll mode.
       // This function is mainly for Book mode buttons.
       // But let's support direct jump if needed.
       if (index >= 0 && index < pages.length) setCurrentPage(index);
       return;
    }

    // Book Mode Logic with Animation
    if (isFlipping) return; // Prevent double clicks
    
    if (index >= 0 && index < pages.length) {
      const direction = index > currentPage ? 'next' : 'prev';
      
      // If we are at the end, and try to go next, or start and try prev, do nothing
      // Actually the buttons are disabled, so this is just failsafe.
      
      setIsFlipping(true);
      setFlipDirection(direction);

      // Duration must match CSS (800ms)
      setTimeout(() => {
        setCurrentPage(index);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 800);
    }
  };

  return (
    <main className={`h-dvh flex flex-col bg-gray-200 overflow-hidden lg:flex-row`}>
      <Nav navOpen={navOpen} 
            setNavOpen={setNavOpen} 
            setActiveNav={setActiveNav} 
            setSearchTerm={setSearchTerm} />
      <section className={`flex flex-col justify-center lg:flex-1`}>
        <Header setNavOpen={setNavOpen} 
                activeNav={activeNav} 
                setActiveNav={setActiveNav} />
        <section id="handbook-container" className='relative flex flex-col items-center gap-5 overflow-auto p-5 scroll-smooth'>

          {/* Controls Bar */}
          <div className="sticky top-0 right-5 flex flex-wrap justify-between items-center w-full z-10 gap-2 bg-gray-100/90 backdrop-blur-sm p-3 rounded-b-lg shadow-sm border-b border-gray-200">
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
               <button onClick={() => setViewMode('scroll')}
                       className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'scroll' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                  <i className='bx bx-scroll'></i> Scroll
               </button>
               <button onClick={() => setViewMode('book')}
                       className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'book' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                  <i className='bx bx-book-open'></i> Book
               </button>
            </div>

            <div className="flex gap-2 items-center">
                <select className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer min-w-[180px]"
                        value={viewMode === 'book' ? pages[currentPage].id : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (viewMode === 'scroll') {
                             const element = document.getElementById(val);
                             if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                             const idx = pages.findIndex(p => p.id === val);
                             if (idx !== -1) setCurrentPage(idx);
                          }
                        }}>
                    <option value="" disabled>Go to Page...</option>
                    {pages.map((p, i) => (
                        <option key={p.id} value={p.id}>{i + 1}. {p.title}</option>
                    ))}
                </select>
                
                <button className='bg-gray-800 text-white rounded-lg py-1.5 px-3 text-sm font-bold cursor-pointer hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2' 
                        onClick={() => handlePrint(refToPrint)}>
                    <i className='bx bx-printer'></i> Print
                </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div ref={refToPrint} className='flex flex-col gap-5 w-full max-w-[1200px] transition-all duration-300'> {/* Wider for 2-page book mode */}
            
            {viewMode === 'scroll' ? (
                // Scroll View
                <div className="flex flex-col gap-8 pb-10">
                    {pages.map((page) => (
                        <div key={page.id} id={page.id} className="scroll-mt-24 transition-opacity duration-500 animate-fade-in-up">
                            {page.component}
                        </div>
                    ))}
                </div>
            ) : (
                // Book View (Two Pages) - 3D Flip
                <div className="flex flex-col items-center justify-center h-full w-full py-4 px-10">
                     
                     {/* Book Navigation Top */}
                     <div className="flex justify-between items-center text-sm text-gray-500 px-2 w-full max-w-[1400px] mb-2">
                        <span>Pages {currentPage + 1}-{Math.min(currentPage + 2, pages.length)} of {pages.length}</span>
                        <div className="flex gap-4">
                           <span className="font-semibold">{pages[currentPage]?.title}</span>
                           {pages[currentPage + 1] && <span className="font-semibold text-gray-400">|</span>}
                           {pages[currentPage + 1] && <span className="font-semibold">{pages[currentPage + 1]?.title}</span>}
                        </div>
                     </div>

                     {/* Book Container - Perspective Wrapper */}
                     <div className="flex shadow-xl shadow-black/20 rounded-md bg-gray-300 relative border border-gray-400 perspective-1000 overflow-visible"
                          style={{ 
                              height: 'calc(100vh - 180px)',
                              aspectRatio: '3/2',
                              maxHeight: '900px',
                              maxWidth: '100%'
                           }}>
                        
                        {/* 1. LAYER 1: BOTTOM / STATIC */}
                        <div className="absolute inset-0 flex z-0">
                           {/* Left Base */}
                           <div className="flex-1 bg-white border-r border-gray-200 overflow-hidden relative">
                              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10 transition-all duration-300"></div>
                              <div className="h-full w-full p-8 md:p-10 lg:p-12 flex flex-col">
                                 <div className="flex-1 overflow-hidden animate-fade-in">
                                     {(isFlipping && flipDirection === 'prev' ? pages[currentPage - 2] : pages[currentPage]) 
                                        ? (isFlipping && flipDirection === 'prev' ? pages[currentPage - 2].component : pages[currentPage].component)
                                        : <div className="flex items-center justify-center h-full text-gray-400 italic">Front Cover</div>}
                                 </div>
                                 <div className="text-xs text-center text-gray-400 mt-4 pt-2 border-t border-gray-100">
                                    {(isFlipping && flipDirection === 'prev' ? currentPage - 2 : currentPage) + 1}
                                 </div>
                              </div>
                           </div>
                           
                           {/* Right Base */}
                           <div className="flex-1 bg-white border-l border-gray-200 overflow-hidden relative">
                              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10 transition-all duration-300"></div>
                              <div className="h-full w-full p-8 md:p-10 lg:p-12 flex flex-col">
                                 <div className="flex-1 overflow-hidden animate-fade-in">
                                     {(isFlipping && flipDirection === 'next' ? pages[currentPage + 3] : pages[currentPage + 1])
                                        ? (isFlipping && flipDirection === 'next' ? pages[currentPage + 3].component : pages[currentPage + 1].component)
                                        : <div className="flex items-center justify-center h-full text-gray-400 italic"></div>}
                                 </div>
                                 {(isFlipping && flipDirection === 'next' ? pages[currentPage + 3] : pages[currentPage + 1]) && 
                                    <div className="text-xs text-center text-gray-400 mt-4 pt-2 border-t border-gray-100">
                                        {(isFlipping && flipDirection === 'next' ? currentPage + 3 : currentPage + 1) + 1}
                                    </div>
                                 }
                              </div>
                           </div>
                        </div>

                        {/* 2. LAYER 2: FLIPPER */}
                        {isFlipping && (
                           <div className={`absolute top-0 bottom-0 right-0 w-1/2 h-full z-20 origin-left transform-style-3d ${flipDirection === 'next' ? 'animate-flip-next' : 'animate-flip-prev'}`}>
                              
                              {/* Front Face (Visible at 0deg - Right Side) */}
                              <div className="absolute inset-0 bg-white border-l border-gray-200 backface-hidden overflow-hidden">
                                 <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
                                 <div className="h-full w-full p-8 md:p-10 lg:p-12 flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                       {(flipDirection === 'next' ? pages[currentPage + 1] : pages[currentPage - 1])
                                          ? (flipDirection === 'next' ? pages[currentPage + 1].component : pages[currentPage - 1].component)
                                          : <div className="flex items-center justify-center h-full text-gray-400 italic"></div>}
                                    </div>
                                    <div className="text-xs text-center text-gray-400 mt-4 pt-2 border-t border-gray-100">
                                       {(flipDirection === 'next' ? currentPage + 1 : currentPage - 1) + 1}
                                    </div>
                                 </div>
                              </div>

                              {/* Back Face (Visible at -180deg - Left Side) */}
                              <div className="absolute inset-0 bg-white border-r border-gray-200 backface-hidden rotate-y-180 overflow-hidden">
                                 <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10"></div>
                                 <div className="h-full w-full p-8 md:p-10 lg:p-12 flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                       {(flipDirection === 'next' ? pages[currentPage + 2] : pages[currentPage])
                                          ? (flipDirection === 'next' ? pages[currentPage + 2].component : pages[currentPage].component)
                                          : <div className="flex items-center justify-center h-full text-gray-400 italic"></div>}
                                    </div>
                                    <div className="text-xs text-center text-gray-400 mt-4 pt-2 border-t border-gray-100">
                                       {(flipDirection === 'next' ? currentPage + 2 : currentPage) + 1}
                                    </div>
                                 </div>
                              </div>

                           </div>
                        )}

                        {/* Spine Shadow Overlay */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/20 to-transparent z-50 pointer-events-none mix-blend-multiply"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-gray-300 z-50 pointer-events-none"></div>

                     </div>

                     {/* Book Navigation Bottom */}
                     <div className="flex justify-between items-center mt-4 px-4 pb-10 w-full max-w-[1200px]">
                        <button onClick={() => handlePageChange(currentPage - 2)}
                                disabled={isFlipping || currentPage === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200'}`}>
                           <i className='bx bx-chevron-left text-xl'></i> Previous
                        </button>
                        
                        <button onClick={() => handlePageChange(currentPage + 2)}
                                disabled={isFlipping || currentPage >= pages.length - 2}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentPage >= pages.length - 2 ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200'}`}>
                           Next <i className='bx bx-chevron-right text-xl'></i>
                        </button>
                     </div>
                </div>
            )}

          </div>
        </section>
      </section>          
    </main>
  )
}

export default HandBook