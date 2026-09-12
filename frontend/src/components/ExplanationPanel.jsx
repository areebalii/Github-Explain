import { Loader2, GitCommit, GitPullRequest, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ExplanationPanel({ explanation, isLoading, selectedLine }) {
  if (!selectedLine && !isLoading && !explanation) {
    return (
      <div className="w-96 border-l border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center text-gray-500">
        <GitCommit className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-sm">Click any line in the code view to trace its commit history and purpose.</p>
      </div>
    );
  }

  const context = explanation?.contextFetched;

  return (
    <aside className="w-96 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">
          Line {selectedLine} History
        </h2>
        {explanation?.source && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${explanation.source === 'cache' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {explanation.source}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-56 text-gray-500 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-xs text-gray-500 font-medium">Resolving blame & PR context...</p>
          </div>
        ) : explanation ? (
          <>
            {/* Metadata Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2.5 text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Commit</span>
                <span className="font-mono bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">
                  {context?.commitHash ? context.commitHash.substring(0, 7) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Author</span>
                <span className="font-medium text-gray-800">{context?.author || 'N/A'}</span>
              </div>
              {context?.pr ? (
                <div className="pt-2 border-t border-gray-200 flex flex-col gap-1">
                  <span className="text-gray-500">Associated Pull Request</span>
                  <a
                    href={context.pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-medium flex items-center gap-1.5 line-clamp-1"
                  >
                    <GitPullRequest className="w-3.5 h-3.5 flex-shrink-0" />
                    #{context.pr.number}: {context.pr.title}
                  </a>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 text-amber-600 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Direct commit (no pull request linked)
                </div>
              )}
            </div>

            {/* AI Explanation Content */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Analysis</span>
              <div className="prose prose-sm text-gray-700 text-xs leading-relaxed space-y-2">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 text-rose-600 px-1 py-0.5 rounded font-mono text-[11px]">
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                  }}
                >
                  {explanation.explanation}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}