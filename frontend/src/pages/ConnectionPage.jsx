import React from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { axiosClient } from '../lib/axios'
import { GoPersonAdd } from "react-icons/go"
import Sidebar from '../components/Sidebar'
import { formatDistanceToNow } from 'date-fns'

function ConnectionPage() {
    
    const queryClient = useQueryClient()
    const { data: authUser } = useQuery({ queryKey: ['authUser'] }) 
    
    const {data: getConnections, isLoading: isGettingReq} = useQuery({
        queryKey: ['getConnections'],
        queryFn: async() => axiosClient.get('/connections')
    })
    
    const {data: getConnectionsReq} = useQuery({
        queryKey: ['getConnectionsReq'],
        queryFn: async() => axiosClient.get('/connections/requests')
    })

    const {mutate: acceptConnectionReq} = useMutation({
        mutationKey: ['acceptConnectionReq'],
        mutationFn: (requestid) => axiosClient.put(`/connections/accept/${requestid}`),
        onSuccess: () => {
            toast.success('connection accepted')
            queryClient.invalidateQueries({queryKey: ['getConnectionsReq']})
            queryClient.invalidateQueries({queryKey: ['getConnections']})
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
            queryClient.invalidateQueries({queryKey: ['getConnectionsReq']})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error rejecting Connection Request')
        }
    })

    const {mutate: removeConnection} = useMutation({
        mutationKey: ['removeConnection'],
        mutationFn: (id) => axiosClient.delete(`/connections/${id}`),
        onSuccess: () => {
            toast.success('connection removed')
            queryClient.invalidateQueries({queryKey: ['getConnections']})
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error removing connection ')
        }
    })

    const handleRemoveConnection = (id) => {
        if (!window.confirm("Are you sure you want to remove this connection?")) return;
        removeConnection(id)
    }
    


  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar user={ authUser } />
      </div>
      <div className='col-span-1 lg:col-span-3 order-first lg:order-none space-y-3'>

        {/* connection request     */}
        <div className='p-10 bg-base-100 rounded-lg shadow border-b-[3px] border-r-[3px] border-secondary'>
            {getConnectionsReq?.data?.length > 0 ? (
            <>
                <h2 className='text-lg font-bold mb-4 text-gray-800'>Connection Requests</h2>
                {getConnectionsReq?.data?.map(connectionReq => (
                    <div key={connectionReq._id} className='flex items-center justify-between p-4 border-b-[1px] border-secondary hover:bg-slate-50 transition-colors duration-200'>
                        <Link to={`/profile/${connectionReq.username}`} className='flex items-center flex-grow'>
                            <img
                                src={connectionReq.sender.profileImage || "/defaultProfile.png"}
                                alt={connectionReq.sender.name}
                                className='size-12 rounded-full mr-3'
                                />
                            <div className='mr-2'>
                                <h3 className='font-semibold text-base'>{connectionReq.sender.name}</h3>
                                <p className='text-xs text-info'>{connectionReq.sender.bio}</p>
                            </div>
                            <p className='text-xs m-1 text-zinc-500'>{formatDistanceToNow(new Date(connectionReq.createdAt), { addSuffix: true})}</p>
                        </Link>
                        <div className='flex gap-2 justify-center items-center'>
                            <button
                                onClick={() => acceptConnectionReq(connectionReq._id)}
                                className={`btn btn-sm p-2 flex flex-1 items-center justify-center bg-green-500 hover:bg-green-600 text-white`}
                                >
                                Accept
                            </button>
                            <button
                                onClick={() => rejectConnectionReq(connectionReq._id)}
                                className={`btn btn-sm p-2 flex flex-1 items-center justify-center bg-red-500 hover:bg-red-600 text-white`}
                                >
                                Reject
                            </button>
					    </div>
                    </div>
                ))}
            </>
            ) : (
                <>
                    <h2 className='text-lg font-bold mb-4 text-gray-800'>No connections request yet</h2>
                    <p className='text-gray-600 mb-6'>youre not interesting</p>        
                </>
            )}
        </div>

        {/* connections */}
        <div className='p-10 bg-base-100 rounded-lg shadow border-b-[3px] border-r-[3px] border-secondary space-y-1'>
            {getConnections?.data?.length > 0 ? (
                <>
                 <h2 className='text-lg font-bold mb-4 text-gray-800'>Your Connections</h2>
                 {getConnections?.data?.map(connection => (
                    console.log("getConnection", connection),
                     <div key={connection._id} className=' rounded-lg flex items-center justify-between p-3 border-secondary hover:bg-slate-50 transition-colors duration-200'>
                         <Link to={`/profile/${connection.username}`} className='flex items-center flex-grow'>
                             <img
                                 src={connection.profileImage || "/defaultProfile.png"}
                                 alt={connection.name}
                                 className='size-12 rounded-full mr-3'
                                 />
                             <div>
                                 <h3 className='font-semibold text-base'>{connection.name}</h3>
                                 <p className='text-xs text-info'>{connection.bio}</p>
                             </div>
                         </Link>
                         <div className='flex gap-2 justify-center items-center'>
                            <button onClick={() => handleRemoveConnection(connection._id)} className='btn btn-sm hover:bg-red-50'>
                                Remove
                            </button>
                         </div>
                     </div>
                 ))}
             </>
            ) : (
                <div className='text-center'>
                    <div className='mb-6'>
                        <GoPersonAdd size={77} className='mx-auto text-secondary' />
                    </div>
                    <h2 className='text-lg font-bold mb-4 text-gray-800'>No connections yet</h2>
                    <p className='text-gray-600 mb-6'>ewww no friends</p>
                </div>    
            )}
        </div>
      </div>
  </div>
  )
}

export default ConnectionPage