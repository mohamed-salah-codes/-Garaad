const fs = require('fs');
const transcriptPath = 'c:/Users/Pc/.gemini/antigravity-ide/brain/bd2a4bd4-e32d-4d79-8bb9-fd659a177f80/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
let maxEndLine = 0;
for (const line of lines) {
    if (line.includes('"name":"view_file"') && line.includes('App.tsx')) {
        try {
            const entry = JSON.parse(line);
            if (entry.tool_calls) {
                for (const tc of entry.tool_calls) {
                    if (tc.name === 'view_file' && tc.args && tc.args.AbsolutePath && tc.args.AbsolutePath.includes('App.tsx')) {
                        const start = tc.args.StartLine || 1;
                        const end = tc.args.EndLine || 800;
                        if (end > maxEndLine) maxEndLine = end;
                        if (end - start > 1000) {
                             console.log('Found large view_file:', start, end);
                        }
                    }
                }
            }
        } catch(e) {}
    }
}
console.log('Max endline viewed:', maxEndLine);
