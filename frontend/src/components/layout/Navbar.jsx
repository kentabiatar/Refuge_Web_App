import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { HiOutlineUser, HiOutlineUsers, HiOutlineBell } from "react-icons/hi";

function Navbar() {

  const {data: authUser} = useQuery({queryKey: ['authUser']})

  const {data: notifications} = useQuery({
    queryKey: ['notifications'],
    queryFn: async() => axiosClient.get('/notification'),
    enabled: !!authUser
  })
  
  const {data: connectionReq} = useQuery({
    queryKey: ['connectionReq'],
    queryFn: async() => axiosClient.get('/connections/requests'),
    enabled: !!authUser
  })

  const {mutate: logout} = useMutation({
    mutationKey: ['logout'],
    mutationFn: async() => axiosClient.post('/auth/logout')
  })

  const unseenNotifCount = notifications?.filter(notification => !notification.seen).length
  // const unseenNotifCount = 2
  const unseenConnectionReqCount = connectionReq?.filter(connection => !connection.status === "pending").length

  return (
    <div className="navbar bg-base-100 border-b-[3px] border-secondary">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><a>Notifications</a></li>
            <li><a>Friends</a></li>
            <li><a>Me</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost text-3xl text-secondary font-playball">Refuge</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 flex gap-10">
          <div to={"/"} className='flex flex-col justify-center items-center relative'>
            <div className="relative">
              <HiOutlineBell className='text-xl'/>
              {unseenNotifCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-primary text-stone-950 text-xs font-bold size-3 md:size-4 flex justify-center items-center rounded-full'>
                  {unseenNotifCount}
                </span>
              )}
            </div>
            <p className='text-xs text-neutral-600 font-bold scale-90'>Notif</p>
          </div>
          <div className='flex flex-col justify-center items-center relative'>
            <div className="relative">
              <HiOutlineUsers  className='text-xl'/>
              {unseenNotifCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-primary text-stone-950 text-xs font-bold size-3 md:size-4 flex justify-center items-center rounded-full'>
                  {unseenConnectionReqCount}
                </span>
              )}
            </div>
            <p className='text-xs text-neutral-600 font-bold scale-90'>Friends</p>
          </div>
          <div className='flex flex-col justify-center items-center relative'>
            <div className="relative">
              <HiOutlineUser className='text-xl'/>
            </div>
            <p className='text-xs text-neutral-600 font-bold scale-90'>Me</p>
          </div>
        </ul>
      </div>
      <div className="navbar-end">
        <button onClick={() => logout()} className="btn btn-ghost text-xs">Logout</button>
      </div>
    </div>
  )
}

export default Navbar