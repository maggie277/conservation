import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          console.log("User document found:", docData);
          setUserData(docData);
          setEmail(docData.email);
          setType(docData.type);
          setCompanyId(docData.companyId || "");  // Make sure companyId exists for organizations
        } else {
          console.log(`User document NOT found for UID: ${uid}`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("Auth State Changed: ", currentUser);
        fetchUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const userRef = doc(db, "users", userData.id); // Assumes you are using document ID, else adjust
      await updateDoc(userRef, {
        email,
        type,
        companyId,
      });
      console.log("User data updated");
      setIsEditing(false);
      setUserData((prevData) => ({
        ...prevData,
        email,
        type,
        companyId,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {userData.email}</p>
      <p>Type: {userData.type}</p>
      {userData.type === "organization" && <p>Company ID: {userData.companyId}</p>}
      
      <button onClick={handleSignOut}>Sign Out</button>

      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Cancel Edit" : "Edit Profile"}
      </button>

      {isEditing && (
        <form onSubmit={handleEditSubmit}>
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Type: </label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>
          {type === "organization" && (
            <div>
              <label>Company ID: </label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </div>
          )}
          <button type="submit">Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
