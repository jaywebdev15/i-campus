import React from 'react'

const professionalism = ({ professionalism, evaluations, setEvaluations }) => {

    const professionalismMap = {
    "Manages the class effectively":              "evaluation_management",
    "Treats students with respect":               "evaluation_respect",
    "Communicates clearly":                       "evaluation_communication",
    "Comes to class prepared and on time":        "evaluation_ontime",
    "Maintains a positive learning environment":  "evaluation_positive_learning",
  };

  const handleProfessionalism = (field, value) => {
    setEvaluations(prof => ({
      ...prof, evaluation_professionalism: {
        ...prof.evaluation_professionalism, [field]: value
      }
    }))
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="border px-4 py-2 text-left">Professionalism and Classroom Management</th>
            {[5,4,3,2,1].map(r => (
              <th key={r} className="border px-3 py-2 text-center">{r}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {professionalism.map(item => { 
            const field = professionalismMap[item];
            return (
              <tr key={item} className="text-sm">
                <td className="border px-4 py-3">{item}</td>
                {[5,4,3,2,1].map(rate => (
                  <td key={rate} className="border text-center">
                    <input type="radio" name={`professionalism_${field}`} 
                            value={rate} 
                            checked={evaluations.evaluation_professionalism[field] === rate}
                            onChange={() => handleProfessionalism(field, rate)}
                            className='cursor-pointer' />
                  </td>
                ))}
              </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}

export default professionalism