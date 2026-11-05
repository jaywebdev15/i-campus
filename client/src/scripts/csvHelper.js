export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(fieldName => {
            let value = row[fieldName] || "";
            // Escape quotes and wrap in quotes if contains comma or newline
            if (typeof value === 'string' && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split(/\r?\n/).filter(row => row.trim() !== "");
            if (rows.length < 2) {
                reject("Invalid CSV format: No data found");
                return;
            }

            // Simple header extraction
            const headers = parseCSVLine(rows[0]);
            
            const result = [];
            for (let i = 1; i < rows.length; i++) {
                const values = parseCSVLine(rows[i]);
                if (values.length === headers.length) {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header.trim()] = values[index].trim();
                    });
                    result.push(obj);
                }
            }
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

// Helper to parse a single CSV line handling quotes
const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuote && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
};
