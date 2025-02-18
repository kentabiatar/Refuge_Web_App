import React from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { axiosClient } from '../lib/axios'
import { GoPersonAdd } from "react-icons/go"
import Sidebar from '../components/Sidebar'
import Post from '../components/Post'
import { formatDistanceToNow } from 'date-fns'
import { useParams } from 'react-router-dom'
function PostPage() {
    const { id } = useParams()
    const { data: authUser } = useQuery({queryKey: ['authUser']})
    const {data: getPostById, isLoading: postLoading} = useQuery({
        queryKey: ['getPostById', id],
        queryFn: async () => axiosClient.get(`/posts/${id}`)
    })
    
    if (postLoading) return <div>Loading...</div>
    if (!getPostById?.data) return <div>Post not found</div>
    console.log("post ", getPostById.data)
  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar user={ authUser } />
      </div>
      <div className='col-span-1 lg:col-span-3 order-first lg:order-none'>
      <div className='bg-base-100 rounded-lg shadow mb-4 border-b-[3px] border-r-[3px] border-secondary min-w-80'>
            <Post post={getPostById.data.post}/>
        </div>
      </div>
    </div>
  )
}

export default PostPage