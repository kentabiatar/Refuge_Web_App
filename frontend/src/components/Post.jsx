import React, { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import axiosClient from '../lib/axios'
import { toast } from 'react-hot-toast'
import { HiOutlineTrash } from "react-icons/hi";
import { BiUpvote, BiDownvote } from "react-icons/bi";
function Post({ post }) {

    const {data: authUser} = useQuery({queryKey: ['authUser']})
    const {showComments, setShowComments} = useState(false)
    const {newComment, setNewComment} = useState("")
    const {comments, setComments} = useState(post.comments || [])
    const isOwner = post.author._id === authUser._id
    const isUpvoted = post.upVotes.includes(authUser._id)
    const isDownvoted = post.downVotes.includes(authUser._id)
    const queryClient = useQueryClient()

    const {mutate: deletePost, isPending:isDeleting } = useMutation({
        mutationFn: async () => {
            await axiosClient.delete(`/posts/delete/${post._id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getPosts']})
            toast.success("post deleted successfully")
        },
        onError: (error) => {
            toast.error(error.response.data.msg || "error deleting post")
        }
    })
    const {mutate: createComment, isPending:isCreatingComment} = useMutation({
        mutationFn: async (newComment) => {
            await axiosClient.post(`/posts/${post._id}/comment`, newComment)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getPosts']})
            toast.success("comment created successfully")
        },
        onError: (error) => {
            toast.error(error.response.data.msg || "error creating comment")
        }
    })
    const {mutate: upvotePost, isPending:isUpvoting} = useMutation({
        mutationFn: async () => {
            await axiosClient.post(`/posts/${post._id}/upvote`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getPosts']})
            toast.success("post upvoted successfully")
        },
        onError: (error) => {
            toast.error(error.response.data.msg || "error upvoting post")
        }
    })
    
    const {mutate: downvotePost, isPending:isdownvoting} = useMutation({
        mutationFn: async () => {
            await axiosClient.post(`/posts/${post._id}/downvote`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getPosts']})
            toast.success("post downvoted successfully")
        },
        onError: (error) => {
            toast.error(error.response.data.msg || "error downvoting post")
        }
    })

    const handleDeletePost = () => {
        if(!window.confirm("Are you sure you want to delete this post?")) return;
        deletePost()
    }

  return (
    <div className='flex items-center gap-3 bg-base-100 rounded-lg p-3 shadow mb-4 border-b-[3px] border-r-[3px] border-secondary'>
        <div className='flex flex-col items-center space-y-1 text-neutral-600'>
            <BiUpvote className='cursor-pointer size-7' />
            <p>{post.upVotes - post.downVotes}</p>
            <BiDownvote className='cursor-pointer size-7'/>
        </div>
        <div className='gap-1 grid w-full'>
            <div className='flex justify-between items-center text-neutral-600 font-playfair '>
                <div className='flex gap-3'>
                    <img src={post.author.profileImage || "/defaultProfile.png"} alt={post.author.name} className='size-12 rounded-full' />
                    <div className=''>
                        <h3 className='font-bold'>{post.author.name}</h3>
                        <p className='text-xs'>{post.author.bio}</p>
                    </div>
                </div>
                {isOwner && (
                    <button onClick={handleDeletePost} className='btn btn-ghost'>
                        {isDeleting ? <span className='loading loading-spinner'></span> : <HiOutlineTrash className='size-5 text-secondary'/> }
                    </button>
                )}
            </div>
                <div>
                    <p className='text-neutral-600 mb-4'>{post.content}</p>
                    {post.image && <img src={post.image} alt='Post content' className='rounded-lg w-full' />}
                </div>
            <div className=''>comments</div>
        </div>
    </div>
  )
}

export default Post