import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../lib/axios'
import Sidebar from '../components/Sidebar'
import PostCreation from '../components/PostCreation'
import Post from '../components/Post'
import { HiOutlineUser } from "react-icons/hi";
function HomePage() {

  const {data: authUser} = useQuery({queryKey: ['authUser']})
  const {data: getRecomendedUsers} = useQuery({
    queryKey: ['getRecomendedUsers'],
    queryFn: async () => {
      const res = await axiosClient.get('/users/suggestions')
      return res.data
    }
  })

  const {data: getPosts} = useQuery({
    queryKey: ['getPosts'],
    queryFn: async () => {
      const res = await axiosClient.get('/posts')
      return res.data
    }
  })

  console.log("getRecomendedUsers: ", getRecomendedUsers)
  console.log("getPosts: ", getPosts)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar user={ authUser } />
      </div>
      <div className='col-span-1 lg:col-span-2 order-first lg:order-none'>
        <PostCreation user={ authUser } />

        {getPosts?.map(post => <Post key={post._id} post={post}/>)}
        {getPosts?.length === 0 && (
          <div className='bg-neutral-100 rounded-lg p-8 shadow text-center'>
            <div className='mb-6'>
              <HiOutlineUser size={64} className='mx-auto text-secondary' />
            </div>
            <h2 className='text-lg font-bold mb-4 text-gray-800'>No posts yet</h2>
            <p className='text-gray-600 mb-6'>Connect with others to start seeing posts in your feed</p>
          </div>

        )}
      </div>

    </div>
  )
}

export default HomePage