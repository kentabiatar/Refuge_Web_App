import React from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUser, HiOutlineUsers, HiOutlineBell } from "react-icons/hi";

function Sidebar({ user }) {
  return (
    <div className='bg-base-100 border-b-[3px] border-r-[3px] border-secondary rounded-lg shadow'>
        <div className='p-4 text-center'>
            <div
                className='h-16 rounded-t-lg bg-cover bg-center'
                style={{
                    backgroundImage: `url("/banner.jpg")`,
                }}
            />
            <Link to={`/profile/${user.username}`}>
                <img
                    src={user.profileImage || "/defaultProfile.png"}
                    alt={user.name}
                    className='w-20 h-20 rounded-full mx-auto mt-[-40px]'
                />
                <h2 className='text-xl font-semibold mt-2 text-neutral-600 font-playfair'>{user.name}</h2>
            </Link>
            <p className='text-neutral-600 font-playfair'>{user.bio}</p>
        </div>
        <div className='border-t border-base-100 p-4'>
            <nav>
                <ul className='space-y-2'>
                    <li>
                        <Link
                            to='/'
                            className='flex text-neutral-600 font-playfair items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                        >
                            <HiOutlineUser className='mr-2' size={20} /> Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/network'
                            className='flex text-neutral-600 font-playfair items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                        >
                            <HiOutlineUsers className='mr-2' size={20} /> My Community
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/notifications'
                            className='flex text-neutral-600 font-playfair items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors'
                        >
                            <HiOutlineBell className='mr-2' size={20} /> Notifications
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
        <div className='border-t border-base-100 p-4'>
            <Link to={`/profile/${user.username}`} className='text-sm text-neutral-600 font-playfair font-semibold'>
                Visit your profile
            </Link>
        </div>
    </div>
  )
}

export default Sidebar