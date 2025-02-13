import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../lib/axios'
import Sidebar from '../components/Sidebar'
import PostCreation from '../components/PostCreation'
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
      </div>

    </div>
  )
}

export default HomePage