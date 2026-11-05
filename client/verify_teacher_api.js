import fetch from 'node-fetch';

async function testTeacherFilter() {
    try {
        // Use a teacher number we saw in previous logs (i-campus-prof-00000001)
        const teacherNumber = "i-campus-prof-00000001"; 

        const response = await fetch('http://localhost:3000/api/database/students.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'searchStudent',
                teacher_number: teacherNumber
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        // Note: The previous URL was missing /api/ in my first attempt potentially, 
        // but let's stick to the proxy path convention or relative? 
        // Node script needs full URL. The react app uses /api proxy to localhost:3000.
        // If I hit localhost:3000 directly, the path depends on how PHP serve is running.
        // PHP -S localhost:3000 starts at server/ folder I think? 
        // Let's try http://localhost:3000/database/students.php as per previous scripts.
        // Wait, previous working script used /api/database/students.php WITH PROXY in CLIENT.
        // Direct php server access usually is roughly http://localhost:3000/database/students.php 
        // IF the root is correct.
        
    } catch (error) {
        console.error(error);
    }
}

// Let's rewrite simply
async function run() {
    const teacherNumber = "i-campus-prof-00000001";
    console.log("Testing with teacher:", teacherNumber);
    try {
        const res = await fetch('http://localhost:3000/database/students.php', {
             method: 'POST',
             body: JSON.stringify({
                 action: 'searchStudent',
                 teacher_number: teacherNumber
             }),
             headers: { 'Content-Type': 'application/json' }
        });
        const text = await res.text();
        console.log("Response length:", text.length);
        try {
            const json = JSON.parse(text);
            console.log("Records:", json.records ? json.records.length : "No records field");
        } catch(e) {
            console.log("Not JSON:", text.substring(0, 100));
        }
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}

run();
