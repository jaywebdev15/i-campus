import React from 'react'

const Behavior = ({ criteria, evaluations, setEvaluations, category }) => {

    const behaviorFieldMap = {
    "Shows respect toward teachers and classmates":               "evaluation_respect",
    "Demonstrates responsibility and reliability":                "evaluation_reliable",
    "Works well in group activities":                             "evaluation_teamwork",
    "Maintains discipline and classroom etiquette":               "evaluation_discipline",
    "Exhibits motivation and positive attitude toward learning":  "evaluation_positive",
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
            <th className="border px-4 py-2 text-left">Behavior / Personal Skills</th>
            {[5,4,3,2,1].map(r => (
              <th key={r} className="border px-3 py-2 text-center">{r}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {criteria.map(item => {
            const field = behaviorFieldMap[item];
            return (
              <tr key={item} className="text-sm">
                <td className="border px-4 py-3">{item}</td>
                {[5,4,3,2,1].map(rate => (
                  <td key={rate} className="border text-center">
                    <input type="radio" name={`behavior_${field}`} 
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

export default Behavior