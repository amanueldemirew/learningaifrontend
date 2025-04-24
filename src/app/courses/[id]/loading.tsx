export default function CourseLoading() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="pl-4 space-y-2">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="h-5 bg-gray-200 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
