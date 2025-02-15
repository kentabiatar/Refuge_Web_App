import React from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { axiosClient } from '../lib/axios'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

function RecommendedUser({user}) {
    const queryClient = useQueryClient()
    const {data: connectionStatus, isLoading} = useQuery({
        queryKey: ['connectionStatus', user._id],
        queryFn: async () => await axiosClient.get(`/connections/status/${user._id}`),
    })
    
    const {mutate: sendConnectionReq} = useMutation({
        mutationFn: (userid) => axiosClient.post(`/connections/request/${userid}`),
        onSuccess: () => {
            toast.success('Connection Request Sent')
            queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error Sending Connection Request')
        }
    })
    
    const {mutate: acceptConnectionReq} = useMutation({
		mutationKey: ['acceptConnectionReq'],
        mutationFn: (requestid) => axiosClient.put(`/connections/accept/${requestid}`),
        onSuccess: () => {
            toast.success('connection accepted')
            queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error Accepting Connection Request')
        }
    })
    
    const {mutate: rejectConnectionReq} = useMutation({
		mutationKey: ['rejectConnectionReq'],
        mutationFn: (requestid) => axiosClient.put(`/connections/reject/${requestid}`),
        onSuccess: () => {
            toast.success('connection rejected')
            queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error rejecting Connection Request')
        }
    })

	const renderButton = () => {
		if (isLoading) {
			return (
				<button className='px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-500' disabled>
					Loading...
				</button>
			);
		}

		switch (connectionStatus?.data?.status) {
			case "pending":
				return (
					<button
						className='px-3 py-1 rounded-full text-sm bg-yellow-400 text-white flex items-center'
						disabled
					>
						{/* <Clock size={16} className='mr-1' /> */}
						Pending
					</button>
				);
			case "received":
				console.log("connectionStatus.data:", connectionStatus.data);
				return (
					<div className='flex gap-2 justify-center items-center'>
						<button
							onClick={() => acceptConnectionReq(connectionStatus.data.requestid)}
							className={`btn btn-xs p-1 flex flex-1 items-center justify-center bg-green-500 hover:bg-green-600 text-white`}
						>
							Accept
						</button>
						<button
							onClick={() => rejectConnectionReq(connectionStatus.data.requestid)}
							className={`btn btn-xs p-1 flex flex-1 items-center justify-center bg-red-500 hover:bg-red-600 text-white`}
						>
							Reject
						</button>
					</div>
				);
			case "connected":
				return (
					<button
						className='px-3 py-1 rounded-full text-sm bg-green-700 text-white flex items-center'
						disabled
					>
						{/* <UserCheck size={16} className='mr-1' /> */}
						Connected
					</button>
				);
			default:
				return (
					<button
						className='px-3 py-1 rounded-full text-sm border border-secondary text-neutral-600 hover:bg-secondary hover:text-base-100 transition-colors duration-200 flex items-center'
						onClick={handleConnect}
					>
						{/* <UserPlus size={16} className='mr-1' /> */}
						Connect
					</button>
				);
		}
	};

	const handleConnect = () => {
		if (connectionStatus?.data?.status === "not_connected") {
			sendConnectionReq(user._id);
		}
	};


	return (
		<div className='flex items-center justify-between mb-4'>
			<Link to={`/profile/${user.username}`} className='flex items-center flex-grow'>
				<img
					src={user.profileImage || "/defaultProfile.png"}
					alt={user.name}
					className='size-7 rounded-full mr-3'
				/>
				<div className='text-neutral-600 font-playfair'>
					<h3 className='font-semibold text-sm'>{user.name}</h3>
					<p className='text-xs text-info'>{user.bio}</p>
				</div>
			</Link>
			{renderButton()}
		</div>
	);
}

export default RecommendedUser