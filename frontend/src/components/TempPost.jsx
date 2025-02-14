import React, { useState } from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { axiosClient } from '../lib/axios'
import { toast } from 'react-hot-toast'
import { HiOutlineTrash, HiOutlinePaperClip } from "react-icons/hi";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { GoCommentDiscussion, GoShareAndroid } from "react-icons/go";
import PostAction from './PostAction'

function TempPost({ post }) {
    const { data: authUser } = useQuery({ queryKey: ['authUser'] })
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const { data: comments = [], isLoading: isLoadingComments } = useQuery({
        queryKey: ['getComments', post._id],
        queryFn: async () => {
            const res = await axiosClient.get(`/posts/${post._id}/comments`)
            return res.data.sort((a, b) => (b.upVotes.length - b.downVotes.length) - (a.upVotes.length - a.downVotes.length))
        },
        // enabled: showComments 
    });

    const isOwner = post.author._id === authUser?._id
    const isUpvoted = post.upVotes.includes(authUser?._id)
    const isDownvoted = post.downVotes.includes(authUser?._id)
    const queryClient = useQueryClient()

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => axiosClient.delete(`/posts/delete/${post._id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: post.parent ? ['getComments'] : ['getPosts'] })
            toast.success("Post deleted successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.msg || "Error deleting post")
        }
    })

    const { mutate: upvotePost, isPending: isUpvoting } = useMutation({
        mutationFn: async () => axiosClient.post(`/posts/${post._id}/upvote`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: post.parent ? ['getComments'] : ['getPosts'] })
            toast.success("Post upvoted successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.msg || "Error upvoting post")
        }
    })

    const { mutate: downvotePost, isPending: isDownvoting } = useMutation({
        mutationFn: async () => axiosClient.post(`/posts/${post._id}/downvote`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: post.parent ? ['getComments'] : ['getPosts'] })
            toast.success("Post downvoted successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.msg || "Error downvoting post")
        }
    })

    const { mutate: createComment, isPending: isAddingComment } = useMutation({
		mutationFn: async (commentData) => {
			const res = await axiosClient.post(`/posts/${post._id}/comment`,commentData, {
                headers:{"Content-Type": "application/json"}
            });
            return res.data
		},
		onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getComments"] }),
            resetForm(),
			toast.success("Comment added successfully")
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Failed to add comment");
		},
	});

    const handleCommentCreation = async (e) => {
        try {
            const commentData = {content: newComment}
            if(image){
                commentData.image = await readFileAsDataUrl(image)
            }
            createComment(commentData)
        } catch (error) {
            console.error("error in handle comment creation: ", error.message);
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        setImage(file)
        if(file){
            readFileAsDataUrl(file).then(setImagePreview)
        }else{
            setImagePreview(null)
        }
    }

    const readFileAsDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleDeletePost = () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        deletePost()
    }

    const resetForm = () => {
        setNewComment("")
        setImage(null)
        setImagePreview(null)
    }

    return (
        <div>
            <div className='flex items-center gap-3 p-3 border-b-[1px] border-secondary'>
                <div className='flex flex-col items-center space-y-1'>
                    <BiUpvote 
                        onClick={() => !isUpvoting && upvotePost()} 
                        className={`cursor-pointer size-7 ${isUpvoted ? "text-green-700" : "text-neutral-600"}`}
                    />
                    <p className='text-neutral-600'>{post.upVotes.length - post.downVotes.length}</p>
                    <BiDownvote 
                        onClick={() => !isDownvoting && downvotePost()} 
                        className={`cursor-pointer size-7 ${isDownvoted ? "text-red-700" : "text-neutral-600"}`}
                    />
                </div>
                <div className='gap-1 grid w-full'>
                    <div className='flex justify-between items-center text-neutral-600 font-playfair'>
                        <div className='flex gap-3'>
                            <img src={post.author.profileImage || "/defaultProfile.png"} alt={post.author.name} className='size-10 rounded-full' />
                            <div>
                                <h3 className='font-bold'>{post.author.name}</h3>
                                <p className='text-xs'>{post.author.bio}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <button onClick={handleDeletePost} className='btn btn-ghost'>
                                {isDeleting ? <span className='loading loading-spinner'></span> : <HiOutlineTrash className='size-5 text-secondary' />}
                            </button>
                        )}
                    </div>
                    <div>
                        <p className='text-neutral-600 mb-4'>{post.content}</p>
                        {post.image && <img src={post.image} alt='Post content' className='rounded-lg w-full' />}
                    </div>
                    <div className='flex justify-between items-center'>
                        <PostAction 
                            icon={<GoCommentDiscussion size={15} className="text-neutral-600" />} 
                            text={`Comments (${comments.length})`} 
                            onClick={() => setShowComments(!showComments)}
                        />
                        <PostAction 
                            icon={<GoShareAndroid size={15} className="text-neutral-600" />} 
                            text={"Share"} 
                        />
                    </div>
                </div>
            </div>

            {/* Comments */}
            {showComments && (
                <div>
                    {isLoadingComments ? (
                        <p>Comments are loading...</p>
                    ) : (
                        comments.length > 0 ? comments.map(comment => (
                            <div key={comment._id} className='ml-14'>
                                <TempPost post={comment} />
                            </div>
                        )) : <p>No comments yet.</p>

                    )}

                    {/* New Comment Input */}
                    <div className='p-3'>
                        <div className='flex space-x-3'>
                            <textarea value = {newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full textarea textarea-bordered border-secondary hover:bg-gray-100 transition-colors duration-200" placeholder="Add a comment..."></textarea>
                        </div>
                        {imagePreview && (
                            <div className='mt-4'>
                                <img src={imagePreview} alt='preview' className='w-full' />
                            </div>
                        )}
                        <div className='flex justify-between items-center mt-4'>
                            <div className='flex space-x-4'>
                                <label className='flex items-center cursor-pointer text-neutral-600'>
                                    <HiOutlinePaperClip size={20} className='mr-2' />
                                    <span>Photo</span>
                                    <input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
                                </label>
                            </div>
                            <button className='btn-sm rounded-lg bg-secondary border-[3px] hover:bg-primary border-secondary hover:text-secondary text-primary transition-colors duration-200' onClick={handleCommentCreation} disabled={isAddingComment}>
                                {isAddingComment ? <span className='loading loading-spinner'></span> : "Submit"} 
                            </button>    
                        </div>
                    </div>



                </div>
            )}
        </div>
    )
}

export default TempPost;
