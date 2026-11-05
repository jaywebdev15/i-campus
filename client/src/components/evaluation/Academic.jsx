import React from 'react'

const Academic = ({ criteria, evaluations, setEvaluations, category }) => {

    const academicFieldMap = {
    "Demonstrates understanding of the subject matter": "evaluation_demonstration",
    "Participates actively in class discussions":       "evaluation_participation",
    "Completes assignments and projects on time":       "evaluation_responsible",
    "Shows curiosity and willingness to learn":         "evaluation_willing_to_learn",
    "Applies critical thinking in problem-solving":     "evaluation_problem_solving",
  };
				
  const handleRatingChange = (field, value) => {
    setEvaluations(prev => ({
      ...prev, [category]: {
        ...prev[category], [field]: value
      }
    }));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="border px-4 py-2 text-left">Academic / Learning Skills</th>
            {[5,4,3,2,1].map(r => (
              <th key={r} className="border px-3 py-2 text-center">{r}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {criteria.map(item => {
            const field = academicFieldMap[item];
            return (
              <tr key={item} className="text-sm">
                <td className="border px-4 py-3">{item}</td>
                {[5,4,3,2,1].map(rate => (
                  <td key={rate} className="border text-center">
                    <input type="radio" name={`academic_${field}`} 
                            className='cursor-pointer' 
                            value={rate} 
                            checked={evaluations[category]?.[field] === rate}
                            onChange={() => handleRatingChange(field, rate)}/>
                  </td>
                ))}
              </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}

export default Academic