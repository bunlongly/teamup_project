    import React, { useState } from "react";
    import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
    import {
    faTasks,
    faUsers,
    faPaperclip,
    faPaperPlane,
    } from "@fortawesome/free-solid-svg-icons";
    import { useNavigate } from "react-router-dom";

    const MyProjectPage = () => {
    const navigate = useNavigate();
    const [taskStatus, setTaskStatus] = useState("Finished");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [file, setFile] = useState(null);
    const [member, setMember] = useState("");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignee, setAssignee] = useState("");

    const handleAddComment = () => {
        if (newComment.trim()) {
        setComments([...comments, { text: newComment, user: "John Doe" }]);
        setNewComment("");
        }
    };

    const handleStatusChange = (e) => {
        setTaskStatus(e.target.value);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 p-6 space-y-6">
        {/* Top Navigation Buttons */}
        <div className="flex space-x-4">
            <button
            className="flex items-center px-4 py-2 bg-[#0046B0] text-white rounded"
            onClick={() => navigate("/tasks")}
            >
            <FontAwesomeIcon icon={faTasks} className="mr-2" /> Task
            </button>
            <button
            className="flex items-center px-4 py-2 bg-gray-200 text-black rounded"
            onClick={() => navigate("/team")}
            >
            <FontAwesomeIcon icon={faUsers} className="mr-2" /> Team
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-1 lg:col-span-9 space-y-6">
            {/* Task Overview */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Overview</h2>
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                    <th className="border-b p-2">Task Name</th>
                    <th className="border-b p-2">Start Date</th>
                    <th className="border-b p-2">Due Date</th>
                    <th className="border-b p-2">Assignee</th>
                    <th className="border-b p-2">Attachments</th>
                    <th className="border-b p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                    <td className="p-2">Front-End</td>
                    <td className="p-2">{startDate}</td>
                    <td className="p-2 text-red-500">{dueDate}</td>
                    <td className="p-2">{assignee}</td>
                    <td className="p-2 text-blue-600 cursor-pointer">
                        {file ? file.name : "No attachment"}
                    </td>
                    <td>
                        <select
                        className={`p-1 text-white text-sm rounded w-full ${
                            taskStatus === "Finished"
                            ? "bg-green-500"
                            : taskStatus === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                        value={taskStatus}
                        onChange={handleStatusChange}
                        >
                        <option value="Finished">Finished</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Pending">Pending</option>
                        </select>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* Task Details */}
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First row */}
                <div>
                    <input
                    type="text"
                    placeholder="Enter Member"
                    className="p-2 border rounded w-full"
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                    />
                </div>
                <div>
                    <input
                    type="date"
                    className="p-2 border rounded w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                {/* Second row */}
                <div>
                    <input
                    type="date"
                    className="p-2 border rounded w-full"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                <div>
                    <input
                    type="text"
                    placeholder="Enter Assignee"
                    className="p-2 border rounded w-full"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    />
                </div>
                </div>

                <div className="flex space-x-4 items-center mt-4">
                <input
                    type="file"
                    className="border p-2 rounded"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <div className="space-y-2">
                    {comments.map((comment, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                        <strong>{comment.user}:</strong> {comment.text}
                    </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2 mt-3">
                    <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Add a note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                    className="bg-[#0046B0] text-white px-3 py-1.5 rounded"
                    onClick={handleAddComment}
                    >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
                </div>
            </div>
            </div>

            {/* Right Panel */}
            <div className="col-span-1 lg:col-span-3 space-y-4">
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-[#0046B0] font-semibold">Project Overview</h3>
                <p className="text-sm text-gray-600">Web Development</p>
                <p className="text-sm text-gray-600">Mobile Development</p>
                <p className="text-sm text-gray-600">UX/UI Design</p>
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default MyProjectPage;
