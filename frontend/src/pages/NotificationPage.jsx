import React from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { axiosClient } from '../lib/axios'
import { GoThumbsup, GoThumbsdown, GoComment, GoPersonAdd, GoLinkExternal, GoEye } from "react-icons/go";
import { HiOutlineBell, HiOutlineTrash } from "react-icons/hi";
import Sidebar from '../components/Sidebar'
import { formatDistanceToNow } from 'date-fns'
function NotificationPage() {

    const queryClient = useQueryClient()
    const { data: authUser } = useQuery({ queryKey: ['authUser'] })
    const {data: getNotifications, isLoading} = useQuery({
        queryKey: ['getNotifications'],
        queryFn: async() => axiosClient.get('/notifications'),
    })

    const {mutate: markAsRead, isLoading:isMarkingAsRead} = useMutation({
        mutationKey: ['markAsRead'],
        mutationFn: (notifid) => axiosClient.put(`/notifications/${notifid}/seen`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getNotifications']})
            toast.success("Notification Marked as Read")
        },
        onError: (error) => {
            toast.error(error.response?.data?.msg || "Error Marking Notification as Read")
        }
    })

    const {mutate: deleteNotification, isLoading: isDeleting} = useMutation({
        mutationKey: ['deleteNotif'],
        mutationFn: (notifid) => axiosClient.delete(`/notifications/${notifid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getNotifications']})
            toast.success('notification deleted successfully')
        },
        onError: (error) => {
            toast.error(error.response?.data?.msg || "Error deleting notification")
        }
    })

    const renderNotificationIcon = (type) => {
        switch (type) {
            case "upvote":
                return <GoThumbsup className='size-7 text-green-700'/>
            case "downvote":
                return <GoThumbsdown className='size-7 text-red-700'/>
            case "comment":
                return <GoComment className='size-7 text-secondary'/>
            case "connectionAccepted":
                return <GoPersonAdd className='size-7 text-yellow-300' />
            default: return null     
            }
    }

    const renderNotificationContent = (notification) => {
        switch (notification.type) {
            case 'upvote':
                return (
                    <span>
                        <strong>{notification.sender.name}</strong> upvoted your post 
                    </span>
                )
            case 'downvote':
                return (
                    <span>
                        <strong>{notification.sender.name}</strong> downvoted your post 
                    </span>
                )
            case "comment":
                return (
                    <span>
                        <Link to={`/profile/${notification.sender.username}`} className='font-bold'>
                            {notification.sender.name}
                        </Link>{" "}
                        commented on your post
                    </span>
                );
            case "connectionAccepted":
                return (
                    <span>
                        <Link to={`/profile/${notification.sender.username}`} className='font-bold'>
                            {notification.sender.name}
                        </Link>{" "}
                        accepted your connection request
                    </span>
                );
            default:
                return null;
        }
    }

    const renderRelatedPost = (relatedPost) => {
		if (!relatedPost) return null;

		return (
			<Link
				to={`/post/${relatedPost._id}`}
				className='mt-2 p-2 bg-slate-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors'
			>
				{relatedPost.image && (
					<img src={relatedPost.image} alt='Post preview' className='w-10 h-10 object-cover rounded' />
				)}
				<div className='flex-1 overflow-hidden'>
					<p className='text-sm text-gray-600 truncate'>{relatedPost.content}</p>
				</div>
				<GoLinkExternal size={14} className='text-gray-400' />
			</Link>
		)
	}

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar user={ authUser } />
      </div>
      <div className='col-span-1 lg:col-span-3 order-first lg:order-none'>
          <div className='p-4 bg-base-100 rounded-lg shadow space-y-2 border-b-[3px] border-r-[3px] border-secondary'>
                {getNotifications?.data?.map(notification =>(
                    <div key={notification._id} className={`flex border-secondary justify-between rounded-lg p-4 ${notification.seen ? "border-[1px]" : "border-2"}`}>
                        <div className='flex gap-4'>
                            <Link to={`/profile/${notification.sender.username}`}>
                                <img 
                                    src={notification.sender.profileImage || 'defaultProfile.png'}
                                    alt={notification.sender.name}
                                    className='size-10 rounded-full object-cover'/>
                            </Link>
                            <div className='flex flex-col'>
                                <span className='flex flex-row justify-center items-center gap-2'>
                                    {renderNotificationIcon(notification.type)}
                                    <p className='text-xs'>{renderNotificationContent(notification)}</p>
                                </span>
                                <p className='text-xs m-1 text-zinc-500'>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true})}</p>
                                {renderRelatedPost(notification.relatedPost)}
                            </div>
                        </div>
                        <div>
                            {!notification.seen && (
                                <button onClick={() => markAsRead(notification._id)} className='btn btn-ghost text-secondary hover:text-neutral-300' aria-label='Mark as seen'>
                                    {isMarkingAsRead ? <span className='loading loading-spinner'></span> : <GoEye className='size-5' />}
                                </button>
                            )}
                            <button onClick={() => deleteNotification(notification._id)} className='btn btn-ghost text-secondary hover:text-neutral-300'>
                                {isDeleting ? <span className='loading loading-spinner'></span> : <HiOutlineTrash className='size-5' />}
                            </button>
                        </div>
                    </div>
                ))}
                {getNotifications?.data?.length === 0 && (
                    <div className='text-center p-7'>
                        <div className='mb-6'>
                        <HiOutlineBell size={77} className='mx-auto text-secondary' />
                        </div>
                        <h2 className='text-lg font-bold mb-4 text-gray-800'>No notifications yet</h2>
                        <p className='text-gray-600 mb-6'>ewww no friends</p>
                    </div>
                )}
            </div> 
      </div>
    </div>
  )
}

export default NotificationPage