import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function NetworkPage() {
  const navigate = useNavigate();

  const [suggestedConnections, setSuggestedConnections] = useState([
    { id: 1, name: "John Doe", role: "Software Engineer" },
    { id: 2, name: "Jane Smith", role: "UX Designer" },
    { id: 3, name: "Alice Johnson", role: "Data Analyst" },
  ]);

  const [myConnections, setMyConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([
    { id: 4, name: "Bob Marley", role: "Product Manager" },
  ]);

  const handleConnect = (person) => {
    if (pendingConnections.some((p) => p.id === person.id)) {
      setPendingConnections(pendingConnections.filter((p) => p.id !== person.id));
    } else {
      setPendingConnections([...pendingConnections, person]);
    }
  };

  const handleAcceptRequest = (person) => {
    setMyConnections([...myConnections, person]);
    setReceivedRequests(receivedRequests.filter((p) => p.id !== person.id));
  };

  const handleDeleteRequest = (person) => {
    setReceivedRequests(receivedRequests.filter((p) => p.id !== person.id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full mx-auto space-y-8 lg:space-y-0 lg:space-x-8 p-6">
      <aside className="col-span-1 lg:col-span-3 bg-white p-4 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Received Connection Requests</h2>
        {receivedRequests.length > 0 ? (
          <div className="space-y-4">
            {receivedRequests.map((person) => (
              <div key={person.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  {/* Profile Picture Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-semibold">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.role}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-[#0046b0] text-white px-3 py-1.5 text-sm rounded"
                    onClick={() => handleAcceptRequest(person)}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1.5 text-sm rounded"
                    onClick={() => handleDeleteRequest(person)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No pending connection requests.</p>
        )}
      </aside>

      <main className="col-span-1 lg:col-span-9">
        <div className="bg-white p-4 shadow rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4">My Connections</h2>
          {myConnections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myConnections.map((person) => (
                <div key={person.id} className="bg-white p-4 shadow rounded-lg text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold">
                    {person.name.charAt(0)}
                  </div>
                  <h3 className="font-medium">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't connected with anyone yet.</p>
          )}
        </div>

        {/* Suggested Connections */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-3">People You May Know</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedConnections.map((person) => {
              const isPending = pendingConnections.some((p) => p.id === person.id);
              return (
                <div key={person.id} className="bg-gray-50 p-4 shadow rounded-lg text-center">
                  {/* Profile Picture Placeholder */}
                  <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center text-white text-lg font-semibold">
                    {person.name.charAt(0)}
                  </div>
                  <h3 className="font-medium">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.role}</p>
                  <button
                    className={`${isPending ? "bg-red-500" : "bg-[#0046b0]"} 
                    text-white px-3 py-1.5 text-sm rounded mt-2`}
                    onClick={() => handleConnect(person)}
                  >
                    {isPending ? "Cancel Request" : 
                      <>
                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Connect
                      </>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default NetworkPage;
