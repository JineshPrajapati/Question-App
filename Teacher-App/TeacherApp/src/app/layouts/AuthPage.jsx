import { Outlet } from "react-router";
import { useEffect } from "react";
 

 
export function AuthLayout() {
  useEffect(() => {
    document.body.classList.add("bg-gray-50");
    return () => {
      document.body.classList.remove("bg-gray-50");
    };
  }, []);
 
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left visual panel */}
    <div className="hidden md:flex md:w-3/5 bg-primary  justify-center items-center p-10 relative overflow-hidden">
     <img
      src={"/assets/illustrations/teacherIllustration.png"}
      alt="Login Visual"
      className=" m-0 w-[60%]"
    />
      </div>
 
      {/* Right login form panel */}
      <div className="flex flex-1 md:w-1/2 items-center flex-col gap-6 justify-center p-8 bg-white">
      <div className="flex flex-col items-center justify-center gap-0">
      <img src="/assets/logo/main-logo.png" className="h-[90px]" />
      <h1 className="text-center text-gray-800">Teacher App</h1>
      </div>
        <div className="w-full max-w-md space-y-8 shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}