  export const getPaginationRange = (current, last) => {
    // if there is one pages return what's available between 1 and last
    if(last <= 5) {
      return Array.from(
        { length: last - 2 },
        (_, i) => i + 2
      );  
    }

    // if at the beginning (Page 1 or 2)
    if(current <= 2) return [2, 3, 4];

    // if at the end (last page or the on before it)
    if(current >= last -1) return [last - 3, last - 2, last -1];

    // middle page 
    return [current - 1, current, current + 1];


  };