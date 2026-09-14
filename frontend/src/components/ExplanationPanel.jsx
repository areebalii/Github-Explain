import { Loader2, GitCommit, GitPullRequest, User, AlertCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ExplanationPanel({ explanation, isLoading, selectedLine }) {
  // COMPACT EMPTY STATE FOR MOBILE
  if (!selectedLine && !isLoading && !explanation) {
    return (
      <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200 bg-white p-3 md:p-8 flex flex-row md:flex-col items-center justify-center text-center shrink-0 h-auto md:h-full z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
        <div className="hidden md:flex bg-gray-50 p-4 rounded-full mb-4 border border-gray-100">
          <GitCommit className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex items-center md:flex-col">
          <h3 className="hidden md:block font-semibold text-gray-800 text-base mb-2">No Line Selected</h3>
          <p className="text-[11px] md:text-sm text-gray-500 font-medium md:font-normal">
            <span className="md:hidden text-blue-500 mr-2">↑</span> Tap any line of code to trace its history.
          </p>
        </div>
      </aside>
    );
  }

  const context = explanation?.contextFetched;

  // BOTTOM DRAWER STATE FOR MOBILE (h-[45vh])
  return (
    <aside className="w-full md:w-80 lg:w-96 h-[45vh] md:h-full border-t md:border-t-0 md:border-l border-gray-200 bg-white flex flex-col shrink-0 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-none z-10 relative">
      <div className="p-3 md:p-5 border-b border-gray-200 bg-gray-50/90 backdrop-blur flex items-center justify-between sticky top-0 z-20 shrink-0">
        <h2 className="font-semibold text-gray-800 text-xs md:text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Line {selectedLine} History
        </h2>
        {explanation?.source && (
          <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${explanation.source === 'cache'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
            {explanation.source}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-6 bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 min-h-[120px]">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-blue-500" />
            <p className="text-[11px] md:text-xs font-medium animate-pulse">Resolving blame & PR context...</p>
          </div>
        ) : explanation ? (
          <>
            <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-3 md:p-4 space-y-2.5 md:space-y-3 text-[11px] md:text-xs text-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Commit</span>
                <span className="font-mono bg-white text-gray-800 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-gray-200">
                  {context?.commitHash ? context.commitHash.substring(0, 7) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Author</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[120px]">{context?.author || 'N/A'}</span>
                </span>
              </div>
              {context?.pr ? (
                <div className="pt-2 mt-1 border-t border-gray-150 flex flex-col gap-1.5">
                  <span className="text-gray-500 font-medium">Associated Pull Request</span>
                  <a
                    href={context.pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium flex items-center gap-1.5 line-clamp-2 leading-relaxed"
                  >
                    <GitPullRequest className="w-4 h-4 flex-shrink-0" />
                    #{context.pr.number}: {context.pr.title}
                  </a>
                </div>
              ) : (
                <div className="pt-2 mt-1 border-t border-gray-150 text-amber-600 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Direct commit (no PR linked)
                </div>
              )}
            </div>

            <div className="space-y-3 pb-6">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                Analysis <div className="h-px bg-gray-100 flex-1"></div>
              </span>
              <div className="prose prose-sm text-gray-700 text-xs md:text-[13px] leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-mono text-[10px] md:text-[11px] border border-rose-100 break-all">
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-4 md:pl-5 space-y-1.5 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 md:pl-5 space-y-1.5 mb-3">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
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