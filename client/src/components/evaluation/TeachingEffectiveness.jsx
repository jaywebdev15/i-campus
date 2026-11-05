import React from 'react'

const TeachingEffectiveness = ({ teachingEffectiveness, evaluations, setEvaluations }) => {

    const teachingFieldMap = {
    "Explains lessons clearly":               "evaluation_explanation",
    "Demonstrates mastery of the subject":    "evaluation_demonstration",
    "Uses effective teaching methods":        "evaluation_method",
    "Encourages student participation":       "evaluation_encouragement",
    "Provides fair and helpful assessments":  "evaluation_assessment",
  };

  const handleTeachingEffectiveness = (field, value) => {
    setEvaluations(teachEffect => ({
      ...teachEffect, evaluation_teaching: {
        ...teachEffect.evaluation_teaching, [field]: value
      }
    }));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="border px-4 py-2 text-left">Teaching Effectiveness</th>
            {[5,4,3,2,1].map(r => (
              <th key={r} className="border px-3 py-2 text-center">{r}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {teachingEffectiveness.map(item => {
            const field = teachingFieldMap[item];
            return (
              <tr key={item} className="text-sm">
                <td className="border px-4 py-3">{item}</td>
                {[5,4,3,2,1].map(rate => (
                  <td key={rate} className="border text-center">
                    <input type="radio" name={`teaching_${field}`} 
                            className='cursor-pointer' 
                            value={rate} 
                            checked={evaluations.evaluation_teaching[field] === rate}
                            onChange={() => handleTeachingEffectiveness(field, rate)}/>
                  </td>
                ))}
              </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}

export default TeachingEffectiveness