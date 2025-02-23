import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Profile.css"; // Import the CSS file for styling

const countries = ["Zambia", "United States", "Canada", "United Kingdom", "Australia", "South Africa", "India", "China", "Brazil", "Germany"];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [nrcPassport, setNrcPassport] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [projects, setProjects] = useState("");
  const [contributions, setContributions] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [organizationPhone, setOrganizationPhone] = useState("");
  const [organizationWebsite, setOrganizationWebsite] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0]; // Get the first document
          const docData = docSnapshot.data(); // Get the document data
          console.log("User document found:", docData);
          setUserData({ ...docData, id: docSnapshot.id }); // Include the document ID
          setEmail(docData.email);
          setType(docData.type);
          setFirstName(docData.firstName || "");
          setLastName(docData.lastName || "");
          setAge(docData.age || "");
          setNrcPassport(docData.nrcPassport || "");
          setCountry(docData.country || "");
          setAddress(docData.address || "");
          setProjects(docData.projects || "");
          setContributions(docData.contributions || "");
          setOrganizationName(docData.organizationName || "");
          setOrganizationAddress(docData.organizationAddress || "");
          setOrganizationPhone(docData.organizationPhone || "");
          setOrganizationWebsite(docData.organizationWebsite || "");
          setMissionStatement(docData.missionStatement || "");
          setCompanyId(docData.companyId || "");
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (type === "individual") {
      if (!firstName) newErrors.firstName = "First Name is required";
      if (!lastName) newErrors.lastName = "Last Name is required";
      if (!age) newErrors.age = "Age is required";
      if (!nrcPassport) newErrors.nrcPassport = "NRC/Passport is required";
    } else if (type === "organization") {
      if (!organizationName) newErrors.organizationName = "Organization Name is required";
      if (!organizationAddress) newErrors.organizationAddress = "Organization Address is required";
      if (!organizationPhone) newErrors.organizationPhone = "Organization Phone is required";
      if (!organizationWebsite) newErrors.organizationWebsite = "Organization Website is required";
      if (!missionStatement) newErrors.missionStatement = "Mission Statement is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userRef = doc(db, "users", userData.id); // Now userData.id is defined
      await updateDoc(userRef, {
        type,
        firstName,
        lastName,
        age,
        nrcPassport,
        country,
        address,
        projects,
        contributions,
        organizationName,
        organizationAddress,
        organizationPhone,
        organizationWebsite,
        missionStatement,
      });
      console.log("User data updated");
      setIsEditing(false); // Switch back to read-only mode
      setUserData((prevData) => ({
        ...prevData,
        type,
        firstName,
        lastName,
        age,
        nrcPassport,
        country,
        address,
        projects,
        contributions,
        organizationName,
        organizationAddress,
        organizationPhone,
        organizationWebsite,
        missionStatement,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  if (!userData) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile</h2>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Type:</strong> {userData.type}</p>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="profile-form">
            {type === "individual" && (
              <>
                <label>First Name:<input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
                {errors.firstName && <p className="error">{errors.firstName}</p>}
                <label>Last Name:<input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
                {errors.lastName && <p className="error">{errors.lastName}</p>}
                <label>Age:<input type="text" value={age} onChange={(e) => setAge(e.target.value)} /></label>
                {errors.age && <p className="error">{errors.age}</p>}
                <label>NRC/Passport:<input type="text" value={nrcPassport} onChange={(e) => setNrcPassport(e.target.value)} /></label>
                {errors.nrcPassport && <p className="error">{errors.nrcPassport}</p>}
              </>
            )}
            {type === "organization" && (
              <>
                <label>Organization Name:<input type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} /></label>
                {errors.organizationName && <p className="error">{errors.organizationName}</p>}
                <label>Company ID:<input type="text" value={companyId} readOnly /></label>
                <label>Organization Address:<input type="text" value={organizationAddress} onChange={(e) => setOrganizationAddress(e.target.value)} /></label>
                {errors.organizationAddress && <p className="error">{errors.organizationAddress}</p>}
                <label>Phone:<input type="text" value={organizationPhone} onChange={(e) => setOrganizationPhone(e.target.value)} /></label>
                {errors.organizationPhone && <p className="error">{errors.organizationPhone}</p>}
                <label>Website:<input type="text" value={organizationWebsite} onChange={(e) => setOrganizationWebsite(e.target.value)} /></label>
                {errors.organizationWebsite && <p className="error">{errors.organizationWebsite}</p>}
                <label>Mission Statement:<textarea value={missionStatement} onChange={(e) => setMissionStatement(e.target.value)} /></label>
                {errors.missionStatement && <p className="error">{errors.missionStatement}</p>}
              </>
            )}
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <>
            {type === "individual" && (
              <>
                <p><strong>First Name:</strong> {firstName}</p>
                <p><strong>Last Name:</strong> {lastName}</p>
                <p><strong>Age:</strong> {age}</p>
                <p><strong>NRC/Passport:</strong> {nrcPassport}</p>
              </>
            )}
            {type === "organization" && (
              <>
                <p><strong>Organization Name:</strong> {organizationName}</p>
                <p><strong>Company ID:</strong> {companyId}</p>
                <p><strong>Organization Address:</strong> {organizationAddress}</p>
                <p><strong>Phone:</strong> {organizationPhone}</p>
                <p><strong>Website:</strong> {organizationWebsite}</p>
                <p><strong>Mission Statement:</strong> {missionStatement}</p>
              </>
            )}
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
          </>
        )}
        <button onClick={handleSignOut} className="signout-button">Sign Out</button>
      </div>
    </div>
  );
};

export default Profile;