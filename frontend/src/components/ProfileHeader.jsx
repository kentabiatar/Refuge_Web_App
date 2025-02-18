import { useMemo, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { HiOutlineUsers, HiOutlinePaperClip } from "react-icons/hi"
import { PiNote } from "react-icons/pi"
import { toast } from 'react-hot-toast'
import { axiosClient } from '../lib/axios'

function ProfileHeader({user, isOwner, onSave}) {

    const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState({});
	const queryClient = useQueryClient();
    const navigate = useNavigate();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
		queryKey: ["connectionStatus", user._id],
		queryFn: () => axiosClient.get(`/connections/status/${user._id}`),
		enabled: !isOwner,
	});

    const isConnected = user.connections.some((connection) => connection === authUser._id);

	const { mutate: sendConnectionRequest } = useMutation({
		mutationFn: (userId) => axiosClient.post(`/connections/request/${userId}`),
		onSuccess: () => {
			toast.success("Connection request sent");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: acceptRequest } = useMutation({
		mutationFn: (requestId) => axiosClient.put(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request accepted");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: rejectRequest } = useMutation({
		mutationFn: (requestId) => axiosClient.put(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request rejected");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: removeConnection } = useMutation({
		mutationFn: (userId) => axiosClient.delete(`/connections/${userId}`),
		onSuccess: () => {
			toast.success("Connection removed");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

    const numberOfPosts = user?.posts?.length
    const numberOfConnections = user?.connections?.length



    const renderButton = () => {
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
							onClick={() => acceptRequest(connectionStatus.data.requestid)}
							className={`btn btn-xs p-1 flex flex-1 items-center justify-center bg-green-500 hover:bg-green-600 text-white`}
						>
							Accept
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestid)}
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
						onClick={() => removeConnection(user._id)}
					>
						{/* <UserCheck size={16} className='mr-1' /> */}
						Connected
					</button>
				);
			default:
				return (
					<button
						className='px-3 py-1 rounded-full text-sm border border-secondary text-neutral-600 hover:bg-secondary hover:text-base-100 transition-colors duration-200 flex items-center'
						onClick={() => sendConnectionRequest(user._id)}
					>
						{/* <UserPlus size={16} className='mr-1' /> */}
						Connect
					</button>
				);
		}
	};

    const handleImageChange = (event) => {
        console.log("File selected:", event.target.files[0]);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedData((prev) => ({ ...prev, [event.target.name]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const newUsername = editedData.username || user.username;
        console.log(newUsername);
    
        Promise.resolve(onSave(editedData)) // Ensure `onSave` completes first
            .then(() => {
                setIsEditing(false);
                navigate(`/profile/${newUsername}`);
            })
            .catch((err) => console.error("Error saving:", err));
    };

  return (
    <div className='bg-base-100 rounded-lg p-4 shadow mb-4 border-b-[3px] border-r-[3px] border-secondary min-w-80'>
    <div className='p-4'>
        <img src="/banner.jpg" alt="Banner" className="w-full h-56 object-cover object-right-top" />
        <div className='flex flex-col items-center gap-4 lg:flex-row lg:items-start'>
            <div className="relative">
                <img
                    src={editedData.profileImage || user.profileImage || "/defaultProfile.png"}
                    alt={user.name}
                    className="size-24 rounded-full mt-[-50px] mx-auto lg:size-36 lg:ml-20"
                />
                {isEditing && (
                    <label className="absolute -top-10 right-0 bg-primary p-2 rounded-full shadow cursor-pointer">
                        <HiOutlinePaperClip size={20} />
                        <input
                            type="file"
                            className="hidden"
                            name="profileImage"
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    </label>
                )}
            </div> 
            <div>
                <span className='flex items-center mt-2 gap-3'>
                    {isEditing ? (
                        <>
                            <input
                                type='text'
                                placeholder={`name: ${user.name}`}
                                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                className='w-52 text-3xl font-semibold text-neutral-600 font-playfair bg-primary border-secondary'
                                />
                            <input
                                type='text'
                                placeholder={`username: ${user.username}`}
                                onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                                className='w-24 text-sm font-semibold text-neutral-600 font-playfair border-secondary bg-primary'
                            />
                        </>
                    ) : (
                        <>
                            <h2 className='text-3xl font-semibold text-neutral-600 font-playfair'>{user.name}</h2>
                            <p className='text-sm font-semibold text-neutral-600 font-playfair'>@{user.username}</p>
                        </>
                    )}
                </span>
                {isEditing ? (
                    <input
                        type='text'
                        placeholder={`bio: ${user.bio}`}
                        onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                        className='w-full text-sm font-semibold text-neutral-600 font-playfair border-secondary bg-primary'
                    />
                ) : (
                    <p className='text-sm font-semibold mt-1 text-neutral-600 font-playfair'>{user.bio}</p>
                )}
                <span className='flex items-center mt-2 gap-3'>
                    <div className="flex items-center gap-2 cursor-default">
                        <HiOutlineUsers size={20} />
                        <span className="text-sm">Connections ({numberOfConnections})</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-default">
                        <PiNote size={20} />
                        <span className="text-sm">Posts ({numberOfPosts})</span>
                    </div>
                    {isOwner ? (
                        isEditing ? (
                            <button
                                className='px-3 py-1 rounded-full text-sm border border-secondary text-neutral-600 hover:bg-secondary hover:text-base-100 transition-colors duration-200 flex items-center'
                                onClick={handleSave}
                            >
                                Save Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className='px-3 py-1 rounded-full text-sm border border-secondary text-neutral-600 hover:bg-secondary hover:text-base-100 transition-colors duration-200 flex items-center'
                            >
                                Edit Profile
                            </button>
                        )
                    ) : (
                        <div className='flex justify-center ml-4'>{renderButton()}</div>
                    )}
                </span>
            </div>
        </div>
    </div>
</div>
  )
}

export default ProfileHeader