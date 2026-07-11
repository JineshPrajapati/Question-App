import { Outlet } from "react-router"
import { APP_CONFIG } from "../../../../project.config"
import { useEffect } from "react"

export function AuthLayout(){
    useEffect(() => {
        document.body.classList.add('bg-gray-50')
        return () => {
          document.body.classList.remove('bg-gray-50')
        }
      }, [])

      return (
        <div className='h-dvh flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50'>
          <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            <img
              className='mx-auto h-25 w-auto'
              src={APP_CONFIG.mainLogo}
              alt='Logo'
            />
          </div>
          <div className='mr-5 ml-5 mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
              <Outlet />
            </div>
          </div>
        </div>
      )
}