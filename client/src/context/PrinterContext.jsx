import React, { createContext, useContext } from "react";

export const PrintContext = createContext();

export const usePrint = () => useContext(PrintContext);

export const PrintProvider = ({ children }) => {
  const handlePrint = (refToPrint) => {
    if (!refToPrint?.current) return;

    const printContent = refToPrint.current;

    // Grab all styles from the page
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('');

    const WinPrint = window.open('', '', 'width=1200,height=650');
    WinPrint.document.write(`
      <html>
        <head>${styles}</head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    WinPrint.document.close();

    WinPrint.onload = () => {
      setTimeout(() => {
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
      }, 500);
    }
  };

  return (
    <PrintContext.Provider value={{ handlePrint }}>
      {children}
    </PrintContext.Provider>
  );
};
