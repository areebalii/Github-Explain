import { useState } from 'react';
import axios from 'axios';
import CodeViewer from './components/CodeViewer';
import ExplanationPanel from './components/ExplanationPanel';
import { Search, Loader2 } from 'lucide-react';

export default function App() {
  const [repoParams, setRepoParams] = useState({ owner: '', repo: '', filePath: '', branch: 'main' });
  const [codeContent, setCodeContent] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [explanationData, setExplanationData] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, explaining: false });

  // Fetches the raw file content directly from GitHub to display in the UI
  const fetchFileContent = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, explaining: false });
    setCodeContent('');
    setExplanationData(null);
    setSelectedLine(null);

    try {
      const { owner, repo, branch, filePath } = repoParams;
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      const response = await axios.get(rawUrl);

      // FIX: Check if Axios auto-parsed a JSON file into an object
      let rawText = response.data;
      if (typeof rawText === 'object') {
        rawText = JSON.stringify(rawText, null, 2); // Convert back to a nicely indented string
      }

      setCodeContent(rawText);
    } catch (err) {
      setStatus(prev => ({ ...prev, error: 'Failed to fetch file. Check repository details and ensure it is public.' }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Triggers the backend AI explanation when a line is clicked
  const handleLineClick = async (lineNumber) => {
    setSelectedLine(lineNumber);
    setStatus(prev => ({ ...prev, explaining: true, error: null }));

    try {
      // Create an array of all lines
      const allLines = codeContent.split('\n');

      // Get 3 lines before, the target line, and 3 lines after (handling file boundaries)
      const startIdx = Math.max(0, lineNumber - 4);
      const endIdx = Math.min(allLines.length, lineNumber + 3);
      const codeBlock = allLines.slice(startIdx, endIdx).join('\n');

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/explain`, {
        ...repoParams,
        targetLine: lineNumber,
        // Send the larger block instead of just one line
        codeSnippet: codeBlock
      });

      setExplanationData(response.data);
    } catch (err) {
      setStatus(prev => ({ ...prev, error: err.response?.data?.error || 'Failed to generate explanation.' }));
    } finally {
      setStatus(prev => ({ ...prev, explaining: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" /> GitExplain
        </h1>
        <form onSubmit={fetchFileContent} className="flex gap-3 text-sm">
          <input type="text" placeholder="Owner" className="border rounded px-3 py-1.5 w-32"
            value={repoParams.owner} onChange={e => setRepoParams({ ...repoParams, owner: e.target.value })} required />

          <input type="text" placeholder="Repo" className="border rounded px-3 py-1.5 w-32"
            value={repoParams.repo} onChange={e => setRepoParams({ ...repoParams, repo: e.target.value })} required />

          {/* NEW: Branch/Commit Input */}
          <input type="text" placeholder="Branch (e.g. main)" className="border rounded px-3 py-1.5 w-32"
            value={repoParams.branch} onChange={e => setRepoParams({ ...repoParams, branch: e.target.value })} required />

          <input type="text" placeholder="File Path" className="border rounded px-3 py-1.5 w-64"
            value={repoParams.filePath} onChange={e => setRepoParams({ ...repoParams, filePath: e.target.value })} required />

          <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded" disabled={status.loading}>
            {status.loading ? 'Loading...' : 'Load File'}
          </button>
        </form>
      </header>

      {status.error && (
        <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-200">
          {status.error}
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto bg-gray-900">
          {codeContent ? (
            <CodeViewer code={codeContent} onLineClick={handleLineClick} selectedLine={selectedLine} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Enter repository details to load a file.
            </div>
          )}
        </div>
        <ExplanationPanel explanation={explanationData} isLoading={status.explaining} selectedLine={selectedLine} />
      </main>
    </div>
  );
}