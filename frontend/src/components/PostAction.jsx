import React from 'react'

function PostAction({ icon, text, onClick }) {
  return (
    <div className="flex items-center gap-2" onClick={onClick}>
        {icon}
        <span className="text-sm">{text}</span>
    </div>
  )
}

export default PostAction