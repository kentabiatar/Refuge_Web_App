import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { HiOutlinePaperClip } from "react-icons/hi"
import { axiosClient } from '../lib/axios'
import { toast } from 'react-hot-toast'
function PostCreation({user}) {

    const [content, setContent] = useState("")
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const queryClient = useQueryClient()

    const {mutate: createPostMutation, isPending} = useMutation({
        mutationFn: async (postData) => {
            console.log("Post data", postData)
            const res = await axiosClient.post("/posts/create", postData, {
                headers:{"Content-Type": "application/json"}
            })
            return res.data
        },
        onSuccess: () => {
            resetForm(),
            toast.success("post created successfully"),
            queryClient.invalidateQueries({queryKey: ['getPosts']})
        },
        onError: (error) => {
            toast.error(error.response.data.msg || "something went wrong when creating post")
        }
    })
    const handlePostCreation = async (e) => {
        try {
            const postData = {content}
            if(image){
                postData.image = await readFileAsDataUrl(image)
            }
            createPostMutation(postData)
        } catch (error) {
            console.error("error in handle post creation: ", error.msg);
        }
    }

    const resetForm = () => {
        setContent("")
        setImage(null)
        setImagePreview(null)
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


  return (
    <div className='bg-base-100 rounded-lg p-4 shadow mb-4 border-b-[3px] border-r-[3px] border-secondary'>
        <div className='flex space-x-3'>
            <img src={user.profileImage || "/defaultProfile.png"} alt={user.name} className='size-10 rounded-full' />
            <textarea value = {content} onChange={(e) => setContent(e.target.value)} className="w-full textarea textarea-bordered border-secondary hover:bg-gray-100 transition-colors duration-200" placeholder="Whats on your mind?"></textarea>
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
        <button className='btn-sm rounded-lg bg-secondary border-[3px] hover:bg-primary border-secondary hover:text-secondary text-primary transition-colors duration-200' onClick={handlePostCreation} disabled={isPending}>
            {isPending ? <span className='loading loading-spinner'></span> : "Submit"} 
        </button>    
        </div>
    </div>
  )
}

export default PostCreation