import { useState } from 'react';
import axios from 'axios';
import CodeViewer from './components/CodeViewer';
import ExplanationPanel from './components/ExplanationPanel';
import { Search } from 'lucide-react';

export default function App() {
  const [repoParams, setRepoParams] = useState({ owner: '', repo: '', filePath: '', branch: 'main' });
  const [codeContent, setCodeContent] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [explanationData, setExplanationData] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, explaining: false });

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

      let rawText = response.data;
      if (typeof rawText === 'object') {
        rawText = JSON.stringify(rawText, null, 2);
      }
      setCodeContent(rawText);
    } catch (err) {
      setStatus(prev => ({ ...prev, error: 'Failed to fetch file. Check repository details and ensure it is public.' }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLineClick = async (lineNumber) => {
    setSelectedLine(lineNumber);
    setStatus(prev => ({ ...prev, explaining: true, error: null }));

    try {
      const allLines = codeContent.split('\n');
      const startIdx = Math.max(0, lineNumber - 4);
      const endIdx = Math.min(allLines.length, lineNumber + 3);
      const codeBlock = allLines.slice(startIdx, endIdx).join('\n');

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/explain`, {
        ...repoParams,
        targetLine: lineNumber,
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
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* HEADER: Mobile-optimized wrapping layout */}
      <header className="bg-white border-b border-gray-200 p-3 md:p-4 shrink-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-blue-600" /> GitExplain
        </h1>
        <form onSubmit={fetchFileContent} className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 text-sm">
          {/* Group 1: Owner & Repo */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="text" placeholder="Owner" className="border rounded px-3 py-2 w-1/2 sm:w-32 focus:ring-2 focus:ring-blue-100 outline-none"
              value={repoParams.owner} onChange={e => setRepoParams({ ...repoParams, owner: e.target.value })} required />
            <input type="text" placeholder="Repo" className="border rounded px-3 py-2 w-1/2 sm:w-32 focus:ring-2 focus:ring-blue-100 outline-none"
              value={repoParams.repo} onChange={e => setRepoParams({ ...repoParams, repo: e.target.value })} required />
          </div>
          {/* Group 2: Branch & File Path */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="text" placeholder="Branch" className="border rounded px-3 py-2 w-1/3 sm:w-28 focus:ring-2 focus:ring-blue-100 outline-none"
              value={repoParams.branch} onChange={e => setRepoParams({ ...repoParams, branch: e.target.value })} required />
            <input type="text" placeholder="File Path" className="border rounded px-3 py-2 w-2/3 sm:w-64 focus:ring-2 focus:ring-blue-100 outline-none"
              value={repoParams.filePath} onChange={e => setRepoParams({ ...repoParams, filePath: e.target.value })} required />
          </div>
          <button type="submit" className="bg-blue-600 active:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-medium w-full sm:w-auto shrink-0" disabled={status.loading}>
            {status.loading ? 'Loading...' : 'Load File'}
          </button>
        </form>
      </header>

      {status.error && (
        <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-200 shrink-0">
          {status.error}
        </div>
      )}

      {/* MAIN LAYOUT: min-h-0 prevents flex items from overflowing screen height */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-gray-900 w-full min-h-0">
          {codeContent ? (
            <CodeViewer code={codeContent} onLineClick={handleLineClick} selectedLine={selectedLine} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm px-6 text-center">
              Enter repository details above to load a file.
            </div>
          )}
        </div>
        <ExplanationPanel explanation={explanationData} isLoading={status.explaining} selectedLine={selectedLine} />
      </main>
    </div>
  );
}