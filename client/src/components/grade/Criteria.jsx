import React from 'react'

const Criteria = ({ selectedTab }) => {

  return (
    <div className={`flex flex-col gap-6 p-6 border border-gray-200 rounded-b-xl rounded-tr-xl bg-white shadow-sm
                      ${selectedTab === "Criteria" ? '' : 'hidden'}`}>
      
      {/* Title Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase border-b-2 border-blue-500 pb-2 w-fit">
          Components of Summative Assessment
        </h2>
        <p className='text-gray-600 leading-relaxed text-justify'>
          Summative assessments are classified into three components: <span className="font-semibold text-blue-700">Written Work (WW)</span>, 
          <span className="font-semibold text-blue-700"> Performance Tasks (PT)</span>, and <span className="font-semibold text-blue-700">Quarterly Assessment (QA)</span>. 
          These three will be the bases for grading. The nature of the learning area defines the way these three components are assessed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Written Work */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
           <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3">
              <h3 className='font-bold text-white tracking-wider'>WRITTEN WORK</h3>
           </div>
           <div className="p-5 text-gray-700 text-sm leading-relaxed">
              The Written Work component ensures that students are able to express skill and concepts in written form. 
              Written Work, which may include long quizzes, unit or long tests, help strengthen test-taking skills among the learners. 
              It is strongly recommended that items in long quizzes/tests be distributed across the Cognitive Process Dimensions.
           </div>
        </div>

        {/* Performance Tasks */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
           <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-3">
              <h3 className='font-bold text-white tracking-wider'>PERFORMANCE TASKS</h3>
           </div>
           <div className="p-5 text-gray-700 text-sm leading-relaxed">
              The Performance Task component allows learners to show what they know and are able to do in diverse ways. 
              They may create or innovate products or do performance-based tasks. 
              Includes skills demonstration, group presentations, oral work, multimedia presentations, and research projects.
           </div>
        </div>

        {/* Quarterly Assessment */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
           <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3">
              <h3 className='font-bold text-white tracking-wider'>QUARTERLY ASSESSMENT</h3>
           </div>
           <div className="p-5 text-gray-700 text-sm leading-relaxed">
              The Quarterly Assessment measures student learning at the end of the quarter. 
              These may be in the form of objective tests, performance-based assessment, or a combination thereof.
           </div>
        </div>
      </div>
    </div>
  )
}

export default Criteria