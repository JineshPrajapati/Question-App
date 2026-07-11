const Skeleton = ({count, color="bg-gray-300", height="10"}) => {
    return (
      <div className="space-y-4 animate-pulse">
        {/* <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div> */}
        {
            [...Array(count)].map(item => <div className={`h-${height} ${color} dark:bg-gray-700 rounded-xl w-full`}></div> )
        }
        
      </div>
    );
  };
  
  export default Skeleton;
  