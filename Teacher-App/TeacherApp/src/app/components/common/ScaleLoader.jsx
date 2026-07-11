const ScaleLoader = ({ color = "#36d7b7", size = 50 }) => {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="scale-loader"
          style={{ "--loader-color": color, "--loader-size": `${size}px` }}
        ></div>
      </div>
    );
  };
  
  export default ScaleLoader;
  