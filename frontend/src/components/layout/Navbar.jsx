import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { HiOutlineUser, HiOutlineUsers, HiOutlineBell } from "react-icons/hi";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosClient } from '../../lib/axios.js';

function Navbar() {

  const {data: authUser} = useQuery({queryKey: ['authUser']})
  const queryClient = useQueryClient()

  const {data: notifications} = useQuery({
    queryKey: ['notifications'],
    queryFn: async() => axiosClient.get('/notifications'),
    enabled: !!authUser
  })
  
  const {data: connectionReq} = useQuery({
    queryKey: ['connectionReq'],
    queryFn: async() => axiosClient.get('/connections/requests'),
    enabled: !!authUser
  })

  const {mutate: logout} = useMutation({
    mutationKey: ['logout'],
    mutationFn: async() => axiosClient.post('/auth/logout'),
    onSuccess: () => {
      toast.success("logout successfully")
      queryClient.invalidateQueries({queryKey: ['authUser']})
    },
    onError: (error) => {
      console.log("logout err: ", error)
      toast.error(error.response.data.msg || "something went wrong")
    },
  })

  const unseenNotifCount = notifications?.data.filter(notification => !notification.seen).length
  // const unseenNotifCount = 2
  const unseenConnectionReqCount = connectionReq?.data.filter(connection => connection.status === "pending").length

  return (
    <div className="navbar bg-base-100 border-b-[3px] border-secondary min-w-80">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>

          <div className="dropdown-content bg-base-100 rounded-box z-[1] mt-3 ml-3 w-52 p-2 shadow border-b-[3px] border-r-[3px] border-secondary">
            {authUser ? (
              <ul className="menu menu-sm text-neutral-600 font-playfair">
                <li><Link to={"/notifications"}>Notifications</Link></li>
                <li><Link to={"/connections"}>Connections</Link></li>
                <li><Link to={`/profile/${authUser.username}`}>Me</Link></li>
              </ul>
            ) : (
              <ul className="menu menu-sm text-neutral-600 font-playfair">
                <li><Link to={"/signup"}>Sign Up</Link></li>
                <li><Link to={"/login"}>Login</Link></li>
              </ul>
            )}
          </div>
        </div>
        <Link to={"/"} className="btn btn-ghost text-3xl text-secondary font-playball">Refuge</Link>
      </div>
      {authUser && (
        <div className="hidden navbar-center lg:flex font-playfair text-neutral-600">
          <ul className="menu menu-horizontal px-1 flex gap-10">
            <Link to={"/notifications"} className='flex flex-col justify-center items-center relative'>
              <div className="relative">
                <HiOutlineBell className='text-xl'/>
                {unseenNotifCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-primary text-stone-950 text-xs font-bold size-3 md:size-4 flex justify-center items-center rounded-full'>
                    {unseenNotifCount}
                  </span>
                )}
              </div>
              <p className='text-xs font-bold scale-90'>Notif</p>
            </Link>
            <Link to={"/connections"} className='flex flex-col justify-center items-center relative'>
              <div className="relative">
                <HiOutlineUsers  className='text-xl'/>
                {unseenConnectionReqCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-primary text-stone-950 text-xs font-bold size-3 md:size-4 flex justify-center items-center rounded-full'>
                    {unseenConnectionReqCount}
                  </span>
                )}
              </div>
              <p className='text-xs font-bold scale-90'>Connections</p>
            </Link>
            <Link to={`/profile/${authUser.username}`} className='flex flex-col justify-center items-center relative'>
              <div className="relative">
                <HiOutlineUser className='text-xl'/>
              </div>
              <p className='text-xs font-bold scale-90'>Me</p>
            </Link>
          </ul>
        </div>
      )} 
      <div className="navbar-end font-playfair text-neutral-600">
        {authUser ?(
          <Link onClick={() => logout()} className="btn btn-ghost text-xs">Logout</Link>
        ): (
          <>
          <Link to="/login" className="btn btn-ghost text-xs">Login</Link>
          <Link to="/signup" className="btn btn-ghost text-xs">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar