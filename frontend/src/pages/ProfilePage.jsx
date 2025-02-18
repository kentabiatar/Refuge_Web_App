import { React, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { axiosClient } from '../lib/axios'
import { toast } from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { HiOutlineUsers} from "react-icons/hi"
import { PiNote } from "react-icons/pi"
import Post from '../components/Post'
import ProfileHeader from '../components/ProfileHeader'


function ProfilePage() {


    const { username } = useParams()
    const queryClient = useQueryClient()
    const {data: authUser, isLoading: userLoading} = useQuery({queryKey: ['authUser']})

    const {data: userProfile, isLoading: profileLoading} = useQuery({
        queryKey: ['userProfile', username],
        queryFn: async () => axiosClient.get(`/users/${username}`)
    })

    
    const {mutate: updateProfile, isLoading: isUpdating} = useMutation({
        mutationKey: ['updateProfile'],
        mutationFn: (data) => axiosClient.put('/users/profile', data),
        onSuccess: () => {
            toast.success('Profile Updated')
            queryClient.invalidateQueries({queryKey: ['userProfile', username]})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error updating profile')
        }
    })
    
    if(userLoading || profileLoading) return null
    
    const isOwner = authUser?.username === username
    // console.log(authUser)
    const user = userProfile.data
    const handleSave = (data) => {
		updateProfile(data);
	};

    const numberOfPosts = user?.posts?.length
  return (
    <div>
        <ProfileHeader user={user} isOwner={isOwner} onSave={handleSave}/>
        <div className='bg-base-100 rounded-lg p-7 shadow mb-4 border-b-[3px] border-r-[3px] border-secondary min-w-80'>
            <h1 className='text-xl font-semibold text-neutral-600 font-playfair'>
                {user.name}'s Posts
            </h1>
            {numberOfPosts > 0 ? (
                user.posts.map((post) => <Post key={post._id} post={post} />)
            ) : (
                <p className='text-sm font-semibold text-neutral-600 font-playfair'>
                    No posts yet
                </p>
            )}
        </div>
    </div>
  )
}

export default ProfilePage